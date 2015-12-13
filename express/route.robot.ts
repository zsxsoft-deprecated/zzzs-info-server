///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import robot = require('../robot/index');
import intercept = require("intercept-stdout");
var capturedText: string[] = [];
var unhook_intercept = intercept((txt) => {
   if (config.extra.maxLogCount <= capturedText.length) {
      capturedText.shift();
   }
  capturedText.push(txt);
});
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/robot/", (req: express.Request, res: express.Response) => {
			res.end(JSON.stringify({status: "OK"}));
			robot.robotUpdate();
		});
		app.get("/api/stdout/", (req: express.Request, res: express.Response) => {
			res.end(JSON.stringify(capturedText));
		});
		app.get("/api/stdout/:line", (req: express.Request, res: express.Response) => {
			res.end(JSON.stringify(capturedText.slice(-req.params.line)));
		});
	}
}
export = RouteList;