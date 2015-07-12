///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import db = require('../db/index');
import util = require('../utils/index');
class RouteList {
	constructor(app: express.Express) {
		app.get("/api/list/", (req: express.Request, res: express.Response) => {
			var query: any = {};
			var page: number = parseInt(req.query.page);
			if (isNaN(page) || page === null) page = 0;
			
			if ('id' in req.query) {
				query.id = {
					$lte: req.query.id
				}
			}
			
			if ('category' in req.query) {
				query.category = req.query.category;
			}

			db.getArticleList(query, 0, config.list.limit).then((data: string[]) => {
				data.map((value: any) => {
					value.intro = value.content.replace(/\<.+?\>/g, "").substr(0, 100) + "...";
					value.content = "";
					value.time = util.formatDate(new Date(value.time));
				});
				res.end(JSON.stringify(data));
			});
		});
	}
}
export = RouteList;