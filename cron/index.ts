///<reference path="../typings/tsd.d.ts" />
import config = require('../config');
import cron = require('cron');
import robot = require('../robot/index');
if (config.cron.enable) {
	var CronJob = cron.CronJob;
	new CronJob({
		cronTime: config.cron.cronTime,
		onTick: () => {
			console.log("Start a new robot update at: " + new Date());
			robot.robotUpdate();
		},
		onComplete: () => {
				
		},
		start: true
	});
}
