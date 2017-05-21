var express = require('express');
var app = express();
var PORT = require('./config');

app.use(express.static('public'));

app.listen(PORT);

exports.app = app;