var express = require('express');
var app = express();
var PORT = require('./config');

app.use(express.static('public'));

app.get('/dashboard', function(req, res) {
	return res.sendFile('dashboard.html', {root: './public'});
});

app.listen(PORT);

exports.app = app;