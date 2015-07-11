///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import db = require('../db/index');
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/list/", (req: express.Request, res: express.Response) => {
			var query: any = {};
			var page: number = parseInt(req.query.page);
			if (isNaN(page) || page === null) page = 0;
			
			if ('id' in req.query) {
				query.id = {
					$gt: req.query.id
				}
			}

			db.getArticleList(query, 1, config.list.limit).then((data: string[]) => {
				res.end(JSON.stringify(data));
			});
		});
	}
}
export = RouteList;