// BASE SETUP
// ==============================================

var express = require('express');
var app     = express();
var port    =   process.env.PORT || 3000;
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');

// CONFIGURE
// ==============================================

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({strict:false}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// ROUTES
// ==============================================

app.get('/', index);

// LOGIC
// ==============================================

var stpath = '/tracking';
var st = require('supertracker')(app, stpath);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);