///<reference path="../typings/tsd.d.ts" />
var rp = require('request-promise');
var cheerio = require('cheerio');
var hostUrl = "http://gaokao.chsi.com.cn/";
var earlistYear = 2014; // 超过这个年份的信息不采集
var singlePageList = 30; // 学信网每个页面最大显示30条消息
var scanList = [
    "gkxx/zzzs/",
    "gkxx/zzzs/bkzn/",
    "gkxx/zzzs/gxzc/",
];
function singleList(url) {
    return rp(url).then(function (result) {
        var $ = cheerio.load(result.toString());
        var elements = $(".l_news_list> li");
        var urlList = [];
        elements.map(function (index, element) {
            var $e = $(element);
            var timeString = $e.children(".spanTime").text();
            if (new Date(timeString).getFullYear() >= earlistYear) {
                urlList.push($e.children("a").attr("href"));
            }
        });
        return urlList;
    }).error(function (reason) {
    });
}
;
scanList.map(function (value) {
    var nowPage = 0;
    function runNextList(urlList) {
        return singleList(hostUrl + value + "?start=" + nowPage).then(function (oneUrlList) {
            urlList = urlList.concat(oneUrlList);
            nowPage += singlePageList;
            if (urlList.length % singlePageList === 0) {
                return runNextList(urlList);
            }
            else {
                return urlList;
            }
        });
    }
    ;
    runNextList([]).then(function (urlList) {
        console.log(urlList);
    });
});
