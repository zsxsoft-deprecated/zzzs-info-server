///<reference path="../typings/tsd.d.ts" />
import express = require('express');
import path = require('path');
var app: express.Express = express();
function renderIndex(req: express.Request, res: express.Response) {
	res.render('index');
}
app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');

app.set('views', path.join(__dirname, "../view/"));
app.use('/static', express.static(path.join(__dirname, '../static/')));
app.get("/", renderIndex);
app.get("/article/:id", renderIndex);

app.listen(app.get('port'), () => {
	console.log('Express started on: http://127.0.0.1:' + app.get('port'));
}); 

// 读取其它路由
['./route.list', './route.robot', './route.article'].map((value: string) => {
	require(value)(app);
});