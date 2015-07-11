///<reference path="../typings/tsd.d.ts" />
import rp = require('request-promise');
import cheerio = require('cheerio');
import path = require('path');
import url = require('url');
import db = require('../db/index');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
/**
 * 学信网的Host Url
 * @type {string}
 */
var hostUrl: string = "http://gaokao.chsi.com.cn/";
/**
 * 不采集超过年份的信息
 * @type {number}
 */
var earlistYear: number = 2014;
/**
 * 学信网每个列表页的文章数目
 * @type {number}
 */
var singlePageList: number = 30;
/**
 * 学信网栏目列表
 * @type {string[]>}
 */
var scanList: string[] = [
	"gkxx/zzzs/", // 动态
	"gkxx/zzzs/bkzn/", // 报考指南
	"gkxx/zzzs/gxzc/", // 高校政策
];
/**
 * 获取单个列表的内容
 * @param  {string}       url
 * @return {Promise<any>}    
 */
function singleList(url: string): Promise<any> {
	return rp(url).then((result) => {
		var $: CheerioStatic = cheerio.load(result.toString());
		var elements: Cheerio = $(".l_news_list> li");
		var urlList: Array<string> = [];
		elements.map((index: number, element: CheerioElement) => {
			var $e: Cheerio = $(element);
			var timeString: string = $e.children(".spanTime").text();
			if (new Date(timeString).getFullYear() >= earlistYear) {
				urlList.push($e.children("a").attr("href"));
			}
		});
		return urlList;
	}).error((reason) => {

	});
};
/**
 * 清理文章内容中的无用部分
 * @param  {string} content
 * @return {string}        
 */
function cleanContent(content: string): string {
	var $: CheerioStatic = cheerio.load(content);
	$("#share").remove();
	$(".clearFloat").remove();
	$(".l_news_time").remove();
	$("h1").remove();
	return entities.decode($.html().trim());
}
/**
 * 获取单篇文章的内容
 * @param  {string}       url
 * @return {Promise<any>}    
 */
function singleArticle(url: string): Promise<any> {
	return rp(url).then((result) => {
		var $: CheerioStatic = cheerio.load(result.toString());
		var title = $("h1").text().trim();
		var content = $(".l_news").html();
		var timeAndSource = $(".l_news_time").text().split("\r\n");
		var time = ""; var source = "";
		time = timeAndSource[0].trim();
		if (timeAndSource.length >= 1) {
			source = timeAndSource[1].trim();
		}
		// 来源和时间混一起了 
		return {
			error: null,
			title: title,
			content: cleanContent(content),
			time: time,
			source: source,
			id: getIdByUrl(url)
		};
	})
};

/**
 * 通过URL得到这条数据的ID
 * @param  {string} url
 * @return {string} 
 */
function getIdByUrl(url: string): string {
	var match: RegExpMatchArray = url.match(/(\d+)\.html/);
	if (match === null || match.length <= 1) {
		return "";
	} else {
		return match[1];
	}
}

/**
 * 把ID有重复的数据进行筛除
 * @param  {string[]}          idList
 * @return {Promise<string[]>}       
 */
function replaceDulipatedKey(idList: string[]): Promise<string[]> {
	return db.findArticleByIdList(idList).then((results: Array<string[]>) => {
        results.map((result: any) => {
            idList.splice(idList.indexOf(result.id), 1);
        })
        return idList; 
    });;
}

export function robotUpdate() {
	scanList.map((value: string) => {
		var nowPage: number = 0;
		function runNextList(urlList: Array<string>) {
			return singleList(hostUrl + value + "?start=" + nowPage).then((oneUrlList: string[]) => {
				/**
				 * 首先，我们要对URL进行去重处理。
				 * 在数据库中，保存的内容是ID。所以我们要从URL解析出ID，然后把ID提交给数据库检查哪些ID还没被计入数据库
				 * 因此，我们需要一个专门的数据结构，来存储ID与URL的对应值。
 				 */
				var urlWithKey: any = {};
				var idList: string[] = [];
				oneUrlList.map((url: string) => {
					var id: string = getIdByUrl(url);
					if (id !== "") {
						urlWithKey[id] = url;
						idList.push(id);
					}
				});
				return replaceDulipatedKey(idList).then((uniqueIdList: string[]) => {
					/**
					 * 到这里，我们已经拿到了去过重的ID
					 * 因此，我们就要整理出一份去过重的Url
					 */
					var uniqueUrlList: string[] = [];
					uniqueIdList.map((id: string) => {
						uniqueUrlList.push(urlWithKey[id]);
					})
					urlList = urlList.concat(uniqueUrlList);
					nowPage += singlePageList;
					/**	
					 * 如果这里得到的Url不是每个页面的数据的倍数，就自动停止拉取
					 * 如果是中途截断的话，其必定有余数
					 * 或者，如果独立ID已经没有的话，也可以视为拉取完成（这一页全部拉取过了，或这一页是空的）
					 */
					if ((urlList.length % singlePageList === 0 && urlList.length > 0) || uniqueIdList.length > 0) {
						return runNextList(urlList);
					} else {
						return urlList;
					}
				});
			});
		};
		runNextList([]).then((urlList: string[]) => {
			urlList.map((singleUrl: string) => {
				singleArticle(url.resolve(hostUrl, singleUrl)).then((result) => {
					db.addArticle(result.id, result.title, result.content, value, result.source, result.time, singleUrl);
				}).error((reason) => {
					//console.log(reason);
					// Eat it
				});
			})
		});
	});
}
