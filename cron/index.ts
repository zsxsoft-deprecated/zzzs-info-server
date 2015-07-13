///<reference path="../typings/tsd.d.ts" />
import config = require('../config');
import cron = require('cron');
import robot = require('../robot/index');
import event = require('../event/index');
if (config.cron.enable) {
	var CronJob = cron.CronJob;
	new CronJob({
		cronTime: config.cron.cronTime,
		onTick: () => {
			console.log("Start a new cron at: " + new Date());
			event.emit("cron.tick");
		},
		onComplete: () => {
				
		},
		start: true
	});
}
