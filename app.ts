///<reference path="typings/tsd.d.ts" />
import express = require('express');
import path = require('path');
var app = express();
app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, "./view/"));
//app.use(express.static(path.join(__dirname, './bower_components/')));
app.get("/", (req, res) => { 
	res.render('index');
});
app.listen(app.get('port'), () => {
	console.log('Express started on: http://127.0.0.1:' + app.get('port'));
});