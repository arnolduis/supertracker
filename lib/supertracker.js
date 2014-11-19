module.exports = function(app, stpath) {
	// BASE SETUP
	// ==============================================

	var express = require('express'); //ttt kell e

	var path = require('path');
	var nconf = require('nconf');
	var mongoose = require('mongoose');
	var http = require('http');
	var bodyParser = require('body-parser');
	// models
	var Event = require('../models/event');
	
	// CONFIGURE
	// ==============================================

	app.use(bodyParser.json({strict:false}));


	nconf.argv()
		 .env()
		 .file('user','config-user-supertracker.json')
		 .file('default','node_modules/supertracker/config/config-default-supertracker.json');

	//ttt itt talan kicserelem az nconf geteket, es itt egyben megnezem.

	app.use(express.static(path.join(__dirname, 'node_modules/supertracker/public')));
	app.set('view engine', 'ejs');


	// ROUTES
	// ==============================================
	var dashboard = require('../routes/dashboard');
	var track = require('../routes/track');
	var events = require('../routes/events');
	var funnels = require('../routes/funnels');
	var sessions = require('../routes/sessions');
	//static
	var statics = require('../routes/statics');
	var funnelVM = require('../routes/funnelVM');
	var tracker = require('../routes/tracker'); 

	app.get(stpath+"",dashboard);
	app.get(stpath+"/track",track.get);
	app.post(stpath+"/track",track);
	app.get(stpath+"/events",events);
	app.get(stpath+"/events/getNames",events.getNames);
	app.post(stpath+"/funnels",funnels.post);
	app.delete(stpath+"/funnels/:userId/:funnelName",funnels.delete);
	app.post(stpath+"/sessions", sessions.post);
	// statics
	app.get([stpath+'/javascripts/*', stpath+'/stylesheets/*'], statics);
	app.get(stpath+"/viewmodels/funnelVM",funnelVM(stpath)); //ttt ez kezd retek csunya lenni
	app.get(stpath+"/tracker",tracker(stpath,nconf.get('buffer:size'),nconf.get('buffer:timeLimit')));

	// DATABASE 
	// ===============================================

	mongoose.connect('mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));
	console.log('Supertracker database connected to: mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));
	
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