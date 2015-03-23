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
	// var Event = require('../models/event');
	
	// CONFIGURE
	// ==============================================

	app.use(bodyParser.json({strict:false}));


	nconf.argv()
		 .env()
		 .file('user','config-user-supertracker.json')
		 .file('default','node_modules/supertracker/config/config-default-supertracker.json');


	// // Views context switch ========================
	// var viewEngineOrigin = app.get('view engine');
	// var viewsOrigin = app.get('views');
	// app.set('views', '../views');
	// app.set('view engine', 'ejs');

	// ROUTES
	// ==============================================
	require('../routes')(app, stpath, nconf.get('buffer:size'),nconf.get('buffer:timeLimit'));
	// // Views context switch back =====================
	// app.set('views', viewsOrigin);
	// app.set('view engine', viewEngineOrigin);

	// DATABASE 
	// ===============================================

	mongoose.connect('mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));
	console.log('Supertracker database connected to: mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));	
};