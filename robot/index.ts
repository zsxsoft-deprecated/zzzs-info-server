///<reference path="../typings/tsd.d.ts" />
import rp = require('request-promise');
import cheerio = require('cheerio');
import path = require('path');

var hostUrl: string = "http://gaokao.chsi.com.cn/";
var earlistYear: number = 2014; // 超过这个年份的信息不采集
var singlePageList: number = 30; // 学信网每个页面最大显示30条消息
var scanList: Array<string> = [
	"gkxx/zzzs/", // 动态
	"gkxx/zzzs/bkzn/", // 报考指南
	"gkxx/zzzs/gxzc/", // 高校政策
];
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

function singleArticle(url: string): Promise<any> {
	return rp(url).then((result) => {
		var $: CheerioStatic = cheerio.load(result.toString());
		var title = $("h1").text();
		var content = $(".l_news").html();
		var time = $(".l_news_time").text();
		return {
			title: title,
			content: content,
			time: time
		};
	}).error((reason) => {
		
	});
};

scanList.map((value: string) => {
	var nowPage: number = 0;
	function runNextList(urlList: Array<string>) {
		return singleList(hostUrl + value + "?start=" + nowPage).then((oneUrlList: Array<string>) => {
			urlList = urlList.concat(oneUrlList);
			nowPage += singlePageList;
			if (urlList.length % singlePageList === 0) {
				return runNextList(urlList);
			} else {
				return urlList;
			}
		});	
	};
	runNextList([]).then((urlList: Array<string>) => {
		urlList.map((value: string) => {
			singleArticle(path.join(hostUrl, value)).then((value) => {
			});
		})
	});
	
});

