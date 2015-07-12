///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import path = require('path');
import url = require('url');
import config = require('../config');
var app: express.Express = express();
function renderIndex(req: express.Request, res: express.Response) {
	res.render('index', config.view);
}
app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');

app.set('views', path.join(__dirname, "../view/"));
app.use('/static', express.static(path.join(__dirname, '../static/')));
app.use('/*', (req: express.Request, res: express.Response, next) => {
	req["hostUrl"] = url.format({
		protocol: req.protocol,
		hostname: req.hostname,
		port: app.get('port')
	}); // 格式化URL
	next();
});
app.get("/", renderIndex);
app.get("/article/:id", renderIndex);
app.get("/advanced", renderIndex);

app.listen(app.get('port'), () => {
	console.log('Express started on: http://127.0.0.1:' + app.get('port'));
}); 

// 读取其它路由
['./route.list', './route.robot', './route.article'].map((value: string) => {
	require(value)(app);
});