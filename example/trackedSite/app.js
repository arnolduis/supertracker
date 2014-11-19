// BASE SETUP
// ==============================================

var express = require('express');
var app     = express();
var port    =   process.env.PORT || 3000;
var path = require('path');
var bodyParser = require('body-parser');


// CONFIGURE
// ==============================================

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({strict:false}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
 
// Serve req.user for the supertracker
app.use(function (req, res, next) {
	req.user = {
		userId: 'arni'
	};
	next();
});

// ROUTES
// ==============================================
var index = require('./routes/index');
var secondPage = require('./routes/secondPage');

app.get('/', index);
app.get('/secondPage', secondPage);

// LOGIC
// ==============================================

var stpath = '/tracking';
var st = require('supertracker')(app, stpath);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);