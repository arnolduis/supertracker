module.exports = function(app, path) {
	// BASE SETUP
	// ==============================================

	var nconf = require('nconf');
	var mongoose = require('mongoose');

	var dashboard = require('../routes/dashboard');
	var track = require('../routes/track');
	var tracker = require('../routes/tracker'); 

	// models
	var Event = require('../models/event');
	
	// CONFIGURE
	// ==============================================

	nconf.argv()
		 .env()
		 .file('node_modules/supertracker/config/config-default-supertracker.json'); // ttt nem tudom ket fajlosan
		 // .file('config-user-supertracker.json');

	//ttt itt talan kicserelem az nconf geteket, es itt egyben megnezem.


	// ROUTES
	// ==============================================

	app.get(path+"/dashboard",dashboard);
	app.get(path+"/track",track.get);
	app.post(path+"/track",track);
	app.get(path+"/tracker",tracker(path,nconf.get('buffer:size'),nconf.get('buffer:timeLimit')));

	// DATABASE 
	// ===============================================

	mongoose.connect('mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));
	
};

module.exports.init = function() {
	nconf = require('nconf');
	fs = require('fs');

	nconf.argv()
	     .env()
	     .file({ file: '../config.json' });

	nconf.set('database:host', 'localhost');
	nconf.set('database:port', 27017);

	nconf.save(function (err) {
		fs.readFile('../config.json', function (err, data) {
			console.dir(JSON.parse(data.toString()));
		});
	});
};


module.exports.auth = function (userlevel) {

	if(userlevel == 1) {
		console.log("Authenticated");
		return true;
	}
	console.log("Not authenticated");
	return false;
};

module.exports.hello = function() {
	console.log("hello");
};