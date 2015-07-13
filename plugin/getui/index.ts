///<reference path="../../typings/tsd.d.ts" />
import config = require('../../config');
import GeTui = require('igetui');
import event = require('../../event/index');
import utils = require('util');
import cheerio = require('cheerio');

var tuiConfig = config.plugin.plugin.getui;
var gt = new GeTui(tuiConfig.host, tuiConfig.appKey, tuiConfig.masterSecret);
    
gt.connect(function() {
	console.log("Connected to GeTui server.");
});
/**
 * 推送信息到个推
 * @param  {Object}	    param
 * @return {Promise<any>}	   
 */
export function pushMessage(param: Object): Promise<any> {
	var resolver = Promise.defer();
	var taskGroupName = null;
	var templateParam: Object = {
		appId: tuiConfig.appId[0],
		appKey: tuiConfig.appKey,
		title: "",
		text: "",
		isRing: true,
		isVibrate: false,
		isClearable: true,
		transmissionType: 1,
		transmissionContent: ""
	};
	/* 合并参数到默认参数内 */
	for (var index in param) {
		templateParam[index] = param[index];
	}
	var template = new GeTui.Template.NotificationTemplate(templateParam);
	var message = new GeTui.Message.AppMessage({
		isOffline: true,
		offlineExpireTime: 3600 * 12 * 1000,
		data: template,
		appIdList: tuiConfig.appId,
		phoneTypeList: ['ANDROID'],
		provinceList: [],
		tagList: [],
		speed: 40
	});

	gt.pushMessageToApp(message, taskGroupName, function(err, res) {
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
		title: result.title,
		text: $.root().text()
	}).then((res: any) => {
		console.log(res);
    });

});