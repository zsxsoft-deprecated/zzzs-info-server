///<reference path="../typings/tsd.d.ts" />
import rp = require('request-promise');
import cheerio = require('cheerio');
import path = require('path');
import url = require('url');
import db = require('../db/index');
import util = require('../utils/index');
import config = require('../config');
import event = require('../event/index');

var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

function requestUrl(url: string): Promise<any> {
    let option = {
        timeout: config.robot.requestTimeout,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.9 Safari/537.36 PoweredByZsx zzzs-info-server/1.0'
        },
        uri: url,
        gzip: true
    };
    return rp(option);
}

/**
 * 获取单个列表的内容
 * @param  {string}       url
 * @return {Promise<any>}    
 */
function getOneList(url: string): Promise<any> {
    return requestUrl(url).then((result) => {
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
        event.emit("robot.getgetOneList", urlList);
        return urlList;
    }).error((reason) => {
        console.error("Fetch " + url + " " + reason.toString());
    });
};


/**
 * 清理文章内容中的无用部分
 * @param  {string} content
 * @return {string}        
 */
function cleanContent(content: string): string {
    let $: CheerioStatic = cheerio.load(content);
    $("#share").remove();
    $(".clearFloat").remove();
    $(".l_news_time").remove();
    $("h1").remove();
    event.emit("robot.cleanContent", $);
    return entities.decode($.html().trim());
}
/**
 * 获取单篇文章的内容
 * @param  {string}       url
 * @return {Promise<any>}    
 */
function getSingleArticle(url: string): Promise<any> {
    return requestUrl(url).then((result) => {
        let $: CheerioStatic = cheerio.load(result.toString());
        let title = $("h1").text().trim();
        let content = $(".l_news").html();
        let timeAndSource = $(".l_news_time").text().split("\r\n");
        let time = "";
        let source = "";
        time = timeAndSource[0].trim();
        if (timeAndSource.length >= 1) {
            source = timeAndSource[1].trim();
        }
        let returnObject = {
            error: null,
            title: title,
            content: cleanContent(content),
            time: new Date(time.replace(/年|月|日/g, ".")).getTime(),
            source: source,
            id: getIdByUrl(url)
        };
        event.emit("robot.singleArticle", returnObject);
        return returnObject;
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
 * 清理重复ID
 * @param  {string} url
 * @return {string} 
 */
function cleanDuplicatedKey(oneUrlList: string[]) {
    /**
     * 首先，我们要对URL进行去重处理。
     * 在数据库中，保存的内容是ID。所以我们要从URL解析出ID，然后把ID提交给数据库检查哪些ID还没被计入数据库
     * 因此，我们需要一个专门的数据结构，来存储ID与URL的对应值。
     */
    let urlWithKey: any = {};
    let idList: number[] = [];
    oneUrlList.map((url: string) => {
        let id: number = getIdByUrl(url);
        if (id !== 0) {
            urlWithKey[id] = url;
            idList.push(id);
        }
    });
    return db.findArticleByIdList(idList).then((results: Array<number[]>) => {
        results = util.unique(results, 'id');
        results.map((result: any) => {
            idList.splice(idList.indexOf(result), 1);
        });
        return {
            urlWithKey,
            idList
        };
    });
}

/**
 * 获取数据Promise数据链处理
 * @param  {any} singleUrlList
 * @return none
 */
function gotData(singleUrlList: any) {
    let timeoutForCatch: number = 0;
    console.log("Got " + singleUrlList.urlList.length + " Url in " + singleUrlList.category);
    singleUrlList.urlList.map((singleUrl: string) => {
        setTimeout(() => {
            getSingleArticle(url.resolve(config.robot.hostUrl, singleUrl)).then((result) => {
                console.log("Inserted: " + result.id + " (" + singleUrlList.category + ") (" + result.title + ")");
                event.emit("robot.insertArticle", result);
                db.addArticle(result.id, result.title, result.content, singleUrlList.category, result.source, result.time, singleUrl);
            }).error(reason => {
                console.error("Fetch " + url + " " + reason.toString());
            });
        }, timeoutForCatch);
        timeoutForCatch += config.robot.delay;
    });
    return true;
};
// 这里注册自身到cron内部
event.on('cron.tick', robotUpdate);
export function robotUpdate() {//: Promise<any> {

    function runNextList(nowPage: number, searchUrl: string, urlList: string[]) {

        function finishingUpdate(object: any) {

            let uniqueIdList = object.idList;
            let urlWithKey = object.urlWithKey;
            /**
             * 到这里，我们已经拿到了去过重的ID
             * 因此，我们就要整理出一份去过重的Url
             */
            let uniqueUrlList: string[] = [];
            uniqueIdList.map((id: number) => {
                uniqueUrlList.push(urlWithKey[id]);
            });
            urlList = urlList.concat(uniqueUrlList);
            nowPage += config.robot.singlePageList;
            console.log("Fetch " + searchUrl + "?start=" + nowPage + ", get " + uniqueUrlList.length + " urls.");
            console.log("Queue: " + urlList.length);

            // 为了保险起见，对urlList进行一次去重
            urlList = util.unique(urlList);
            event.emit("robot.getUrlList", urlList);
            /**	
             * 如果这里得到的Url不是每个页面的数据的倍数，就自动停止拉取
             * 如果是中途截断的话，其必定有余数
             * 或者，如果独立ID已经没有的话，也可以视为拉取完成（这一页全部拉取过了，或这一页是空的）
             */
            if (uniqueIdList.length === 0 || (urlList.length % config.robot.singlePageList > 0)) {
                return {
                    category: searchUrl,
                    urlList
                };
            } else {
                return runNextList(nowPage, searchUrl, urlList);
            }
        }


        return getOneList(config.robot.hostUrl + searchUrl + "?start=" + nowPage)
            .then(cleanDuplicatedKey)
            .then(finishingUpdate)
            .then(gotData);
    };


    config.robot.scanList.forEach(value => {
        runNextList(0, value, []) 
    });

    return true;
}
