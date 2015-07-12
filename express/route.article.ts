///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import db = require('../db/index');
import util = require('../utils/index');
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/article/:id", (req: express.Request, res: express.Response) => {			
			db.findOne({
				id: parseInt(req.params.id)
			}).then((data: any) => {
				data.time = util.formatDate(new Date(data.time));
				res.end(JSON.stringify(data));
			});
		});
	}
}
export = RouteList;