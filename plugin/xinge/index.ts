///<reference path="../../typings/tsd.d.ts" />
import config = require('../../config');
var Xinge = require('xinge');
import event = require('../../event/index');
import utils = require('util');
import cheerio = require('cheerio');


var XingeApp = new Xinge.XingeApp(config.plugin.plugin.xinge.accessId, config.plugin.plugin.xinge.secretKey);

//Android message start.
var style = new Xinge.Style();
style.ring = 1;
style.vibrate = 0;
style.ringRaw = 'a';
style.smallIcon = 'b';
style.builderId = 77;

var action = new Xinge.ClickAction();
action.actionType = Xinge.ACTION_TYPE_ACTIVITY;
//action.packageName.packageName = 'com.demo.xg';
//action.packageName.packageDownloadUrl = 'http://a.com';
//action.packageName.confirm = 1;

/**
 * 推送信息到信鸽
 * @param  {Object}	    param
 * @return {Promise<any>}	   
 */
export function pushMessage(param: Object): Promise<any> {
	var resolver = Promise.defer();
	var androidMessage = new Xinge.AndroidMessage();

	androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
	androidMessage.style = style;
	androidMessage.action = action;
	androidMessage.sendTime = Date.parse(new Date().toDateString()) / 1000;
	androidMessage.expireTime = 0;
	//androidMessage.acceptTime.push(new Xinge.TimeInterval(0, 0, 23, 59));
	//androidMessage.customContent = {
	//	'name': 'huangnaiang'
	//};
	androidMessage.multiPkg = 0;
	//androidMessage.loopTimes = 3;
	//androidMessage.loopInterval = 2;
	//And message end.
	
	for (var index in param) {
		androidMessage[index] = param[index];
	}
	
	XingeApp.pushToAllDevices(androidMessage, function(err, res){
		if (err)
			return resolver.reject(err);
		return resolver.resolve(res);
	});
	return resolver.promise;
}

/**
 * 当得到一篇新文章时自动推送到手机
 */
event.on("robot.insertArticle", (result: any) => {
	var $: CheerioStatic = cheerio.load(result.content.toString());
	pushMessage({
		title: result.title.toString().substr(0, 30),
		content: $.root().text().toString.substr(0, 50)
	}).then((res) => {
		console.log(res);
    });

});
