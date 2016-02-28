///<reference path="../typings/tsd.d.ts" />
import mongodb = require('mongodb');
import config = require('../config');
// Promise.promisifyAll(mongodb); // I need IS

var server: mongodb.Server = new mongodb.Server(config.db.host, config.db.port, { auto_reconnect: true });
var db = new mongodb.Db(config.db.db, server, { w: 1 });
db.open(() => {
    if (!config.db.authenticate) return;
    db.authenticate(config.db.username, config.db.password, (err, result) => {
        if (!err) {
            console.log("Authenticated");
        } else {
            console.log("Error when authenticate with DB.");
            console.error(err);
        }
    })
});
var articleCollection = db.collection("article");

/**
 * Promise化mongodb.Collection.insert
 * @param  {mongodb.Collection} collection
 * @param  {any}                selector  
 * @param  {any = null}         options   
 * @return {Promise}                      
 */
function insertAsync(collection: mongodb.Collection, selector: any, options: any = null): Promise<{}> {
    var resolver = Promise.defer();
    collection.insert(selector, options, function(err, results) {
        if (err)
            return resolver.reject(err);
        return resolver.resolve(results);
    });
    return resolver.promise;
};
/**
 * Promise化mongodb.Collection.find
 * @param  {mongodb.Collection} collection
 * @param  {any}                query 
 * @param  {any = null}         fields
 * @param  {any = null}         options
 * @return {Promise}                      
 */
function findAsync(collection: mongodb.Collection, query: any, fields: any = null, options: any = null): Promise<{}> {
    var resolver = Promise.defer();
    collection.find(query, fields, options).toArray(function(err, results) {
        if (err)
            return resolver.reject(err);
        return resolver.resolve(results);
    });
    return resolver.promise;
};

/**
 * Promise化mongodb.Collection.findOne
 * @param  {mongodb.Collection} collection
 * @param  {any}                query 
 * @param  {any = null}         fields
 * @param  {any = null}         options
 * @return {Promise}                      
 */
function findOneAsync(collection: mongodb.Collection, query: any, fields: any = null, options: any = null): Promise<{}> {
    var resolver = Promise.defer();
    collection.findOne(query, fields, options, function(err, result) {
        if (err)
            return resolver.reject(err);
        return resolver.resolve(result);
    });
    return resolver.promise;
};
/**
 * 根据ID列表，从数据库查找文章
 * @param  {string[]} idList [description]
 * @return {Promise}              [description]
 */
export function findArticleByIdList(idList: number[]): Promise<{}> {
	return findAsync(articleCollection, {
		id: {
			$in: idList
		}
	});
}
/**
 * 往数据库写入一篇文章
 * @param  {string}  id      
 * @param  {string}  title   
 * @param  {string}  content 
 * @param  {string}  category
 * @param  {string}  source
 * @param  {Date}    time    
 * @param  {string}  url
 * @return {Promise}         
 */
export function addArticle(id: string, title: string, content: string, category: string, source: string, time: Date, url: string): Promise<{}> {
	return insertAsync(articleCollection, {
		id: id,
		title: title,
		content: content,
		category: category,
		time: time,
        url: url,
        source: source
	})
}

/**
 * 根据所需条件从数据库得到文章
 * @param  {any} query 
 * @return {Promise}
 */
export function getArticleList(query: any, skip: number, limit: number): Promise<{}> {
    return findAsync(articleCollection, query, null, {
        skip: skip,
        limit: limit,
        sort: [['time', 'desc']]
    });
}

/**
 * 根据所需条件从数据库得到单篇文章
 * @param  {any} query 
 * @return {Promise}
 */
export function findOne(query: any): Promise<{}> {
    return findOneAsync(articleCollection, query, null);
}