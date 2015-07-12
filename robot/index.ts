///<reference path="../typings/tsd.d.ts" />
import rp = require('request-promise');
import cheerio = require('cheerio');
import path = require('path');
import url = require('url');
import db = require('../db/index');
import util = require('../utils/index');
import config = require('../config');

var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
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
			if (new Date(timeString).getFullYear() >= config.robot.earlistYear) {
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
			time: new Date(time.replace(/年|月|日/g, ".")).getTime(),
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
function getIdByUrl(url: string): number {
	var match: RegExpMatchArray = url.match(/(\d+)\.html/);
	if (match === null || match.length <= 1) {
		return 0;
	} else {
		return parseInt(match[1]);
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

export function robotUpdate() {//: Promise<any> {

	function runNextList(nowPage: number, searchUrl: string, urlList: string[]) {
		return singleList(config.robot.hostUrl + searchUrl + "?start=" + nowPage).then((oneUrlList: string[]) => {
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
				});
				console.log("Fetch " + searchUrl + "?start=" + nowPage + ", get " + uniqueUrlList.length + " urls.");
				urlList = urlList.concat(uniqueUrlList);
				console.log("Queue: " + urlList.length);
				nowPage += config.robot.singlePageList;
				// 为了保险起见，对urlList进行一次去重
				util.unique(urlList);
				/**	
				 * 如果这里得到的Url不是每个页面的数据的倍数，就自动停止拉取
				 * 如果是中途截断的话，其必定有余数
				 * 或者，如果独立ID已经没有的话，也可以视为拉取完成（这一页全部拉取过了，或这一页是空的）
				 */
				if (uniqueIdList.length === 0 || (urlList.length % config.robot.singlePageList > 0)) {
					return {
						category: searchUrl, 
						urlList: urlList
					};
				} else {
					return runNextList(nowPage, searchUrl, urlList);
				}
			});
		});
	};
	
	function promiseThen(singleUrlList: any) {
		console.log("Got " + singleUrlList.urlList.length + " Url in " + singleUrlList.category);
		singleUrlList.urlList.map((singleUrl: string) => {
			singleArticle(url.resolve(config.robot.hostUrl, singleUrl)).then((result) => {
				console.log("Inserted: " + result.id + " (" + singleUrlList.category + ") (" + result.title + ")");
				db.addArticle(result.id, result.title, result.content, singleUrlList.category, result.source, result.time, singleUrl);
			}).error((reason) => {
				//console.log(reason);
				// Eat it
			});
		})
	};
	
	
	var resolver: any[] = [null, null, null];
	for (var index in config.robot.scanList) {
		var value: string = config.robot.scanList[index];
		var nowPage: number = 0;
		resolver[index] = Promise.defer();
		resolver[index].promise.then(promiseThen);
		resolver[index].resolve(runNextList(0, value, []));
	}

	return true;
}
