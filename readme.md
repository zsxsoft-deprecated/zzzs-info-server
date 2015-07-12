zzzz-info-server
=====================

一个自主招生信息拉取项目。

其主要功能包括

* 爬虫抓取学信网自主招生信息，存入MongoDB。
* Web页面展示抓取信息
* 为推送等预备的API
* 计划任务式自动抓取信息

## 配置说明

1. Clone这个项目
2. 安装MongoDB(https://www.mongodb.org/)，对``config.ts``进行配置
3. npm install && tsd install 
4. MongoDB内，为你的数据库插入索引：
```javascript
use YOUR_DATABASE;
db.article.ensureIndex({id: -1, time: -1});
```
5. tsc （编译TypeScript，忽略其显示的任何错误）
6. npm start

## API说明

未经标识，参数均采用QueryString(即?xxx=xxx&xxx=xxx)形式输入。


##### ``GET /api/robot/ -> object``

启动爬虫，抓取最新资讯。


##### ``GET /api/stdout/ -> string[]``

得到stdout


##### ``GET /api/stdout/:line -> string[]``
> @param line 行数

得到最后数行的stdout


##### ``GET /api/list/(category?: string, id?: string) -> object``

> @param category string 指定查询分类

> @param id       number 指定从某条之后读取

得到指定条件的列表

##### ``GET /rss/(...) -> string``

> @param @see /api/list

得到RSS列表

##### ``GET /api/article/:id -> object``

> @param id number 文章ID

得到指定ID 的文章


## 修改代码说明

```bash
tsc --watch
supervisor app --debug
```

## 开源协议

The MIT License