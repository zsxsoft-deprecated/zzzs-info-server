///<reference path="typings/tsd.d.ts" />
require('./express');
require('./cron');
require('./plugin');


if (process.env.DEVEL == "1") {
	console.log("In development mode!");
	require('v8-profiler');
}