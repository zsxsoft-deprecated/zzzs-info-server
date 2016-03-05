///<reference path="../../typings/tsd.d.ts" />
import config = require('../../config');

import event = require('../../event/index');
import utils = require('util');
import cheerio = require('cheerio');
let Xinge = require('xinge');
let XingeApp = new Xinge.XingeApp(config.plugin.plugin.xinge.accessId, config.plugin.plugin.xinge.secretKey);

let style = new Xinge.Style();
style.ring = 1;
style.vibrate = 0;
style.ringRaw = 'a';
style.smallIcon = 'b';
style.builderId = 77;

/**
 * 推送信息到信鸽
 * @param  {Object}	    param
 * @return {Promise<any>}	   
 */
export function pushMessage(param: any): Promise<any> {
    
    let action = new Xinge.ClickAction();
    action.actionType = 2;
    action.browser = {
        url: config.extra.webRoot + `/article/${param.articleId}`, 
        confirm: 0,
    };

	var resolver = Promise.defer();
	var androidMessage = new Xinge.AndroidMessage();

	androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
	androidMessage.style = style;
	androidMessage.action = action;
	androidMessage.sendTime = Date.parse(new Date().toDateString()) / 1000;
	androidMessage.expireTime = 0;
	androidMessage.multiPkg = 0;
    Object.assign(androidMessage, param);
	
    return new Promise((resolve, reject) => {
        return XingeApp.pushToAllDevices(androidMessage, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    })

}

/**
 * 当得到一篇新文章时自动推送到手机
 */
event.on("robot.insertArticle", (result: any) => {
	let $: CheerioStatic = cheerio.load(result.content.toString());
	pushMessage({
		title: result.title.toString().substr(0, 30),
		content: $.root().text().toString().substr(0, 50), 
        articleId: result.id, 
	}).then((res) => {
		console.log(res);
    });

});
