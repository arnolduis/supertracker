// BASE SETUP
// ==============================================

var express = require('express');
var app     = express();
var port    =   process.env.PORT || 3005;
var path = require('path');
var bodyParser = require('body-parser');
var nconf = require('nconf');

// CONFIGURE
// ==============================================

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({strict:false}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// nconf
nconf.argv()
	 .env()
	 .file('user','config-user-supertracker.json');
 
// Serve fake req.user, and authentication middleware for the supertracker
app.use(function (req, res, next) {
	req.supertracker = { // ezt majd illik atirni
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


var stpath = nconf.get('stpath');
var mwAuth = function (req, res, next) {
	if (req.supertracker.userId === 'arni') {
		next();
	}else {
		res.send("Sorry, you can't acces the Supertrackers dashboard with this account. ");			
	}
};

var st = require('supertracker')(app, stpath, mwAuth);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);