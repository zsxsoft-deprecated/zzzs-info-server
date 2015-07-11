///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import db = require('../db/index');
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/article/:id", (req: express.Request, res: express.Response) => {			
			console.log(req.params);
			db.findOne({
				id: req.params.id
			}).then((data: string[]) => {
				res.end(JSON.stringify(data));
			});
		});
	}
}
export = RouteList;