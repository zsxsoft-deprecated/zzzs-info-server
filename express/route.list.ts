///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import config = require('../config');
import db = require('../db/index');
import util = require('../utils/index');
import url = require('url');
import RSS = require('rss');

/**
 * 返回文章列表
 * @private
 * @param  {any}          requestParams
 * @return {Promise<any>}               
 */
function returnArticleList(requestParams: any): Promise<any> {
	var query: any = {};
	var page: number = parseInt(requestParams.page);
	var $or: any = [];
	if (isNaN(page) || page === null) page = 0;

	if ('id' in requestParams) { // ID翻页用
		query.id = {
			$lte: parseInt(requestParams.id)
		}
	} else if ('lastId' in requestParams) { // ID获取最新消息用
		query.id = {
			$gt: parseInt(requestParams.lastId)
		}
	}

	if ('category' in requestParams) {
		query.category = requestParams.category;
	}
	
	if ('search' in requestParams) {
		$or.push({title: new RegExp(util.quoteRegExp(requestParams.search))});
		$or.push({content: new RegExp(util.quoteRegExp(requestParams.search))});
	}

	if ($or.length > 0) {
		query.$or = $or;
	}
	
	console.log(query);
	return db.getArticleList(query, 0, config.view.limit);
}

class RouteList {
	constructor(app: express.Express) {
		var that = this;

		
		app.get("/api/list/", (req: express.Request, res: express.Response) => {
			returnArticleList(req.query).then((data: string[]) => {
				data.map((value: any) => {
					value.intro = value.content.replace(/\<.+?\>/g, "").substr(0, 100) + "...";
					value.content = "";
					value.time = util.formatDate(new Date(value.time));
				});
				res.end(JSON.stringify(data));
			});
		});

		app.get("/rss/", (req: express.Request, res: express.Response) => {
			returnArticleList(req.query).then((data: string[]) => {
				var feed = new RSS({
					title: config.view.title,
					description: config.view.description,
					webMaster: config.view.webMaster,
					feed_url: req["hostUrl"] + '/rss/',
					site_url: req["hostUrl"],
					language: 'zh-cn'
				});
				data.map((value: any) => {
					feed.item({
						title: value.title,
						description: value.content,
						date: util.formatDate(new Date(value.time)),
						author: value.source,
						url: url.resolve(config.robot.hostUrl, value.url),
						categories: [value.category]
					})
				});
				res.end(feed.xml());
			});
		});
	}

}
export = RouteList;