///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import robot = require('../robot/index');
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/robot/", (req: express.Request, res: express.Response) => {
			res.end(JSON.stringify({status: "OK"}));
			robot.robotUpdate();
		});
	}
}
export = RouteList;