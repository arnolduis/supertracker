module.exports = function(app, stpath, mwAuth) {

	// BASE SETUP
	// ==============================================

	var express = require('express'); //ttt kell e

	var path = require('path');
	var nconf = require('nconf');
	var mongoose = require('mongoose');
	var http = require('http');
	var bodyParser = require('body-parser');
	
	nconf.argv()
		 .env()
		 .file('user','config-user-supertracker.json')
		 .file('default','node_modules/supertracker/config/config-default-supertracker.json');
		 
	mongoose.connect('mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));
	var db = mongoose.connection;

	var corsOptions = {
		origin: nconf.get("cors:whitelist"),
		methods: nconf.get("cors:methods")
	};

	// CHECKING PREREQUISITS
	// =============================================

	var options = { 
		stpath          : stpath,
		bufferSize      : nconf.get('buffer:size'),
		bufferTimeLimit : nconf.get('buffer:timeLimit'),
		db              : db,
		mwAuth			: mwAuth,
		corsOptions		: corsOptions
	};

	for (var i in options) {
		if (!options[i]) {
			console.log("Supertracker: Missing option: " + i);
			process.exit(1);
		}
	}

	// CONFIGURE
	// ==============================================

	app.use(bodyParser.json({strict:false}));






	// // Views context switch ========================
	// var viewEngineOrigin = app.get('view engine');
	// var viewsOrigin = app.get('views');
	// app.set('views', '../views');
	// app.set('view engine', 'ejs');

	// ROUTES
	// ==============================================


	require('../routes')(app, options);

	
	// // Views context switch back =====================
	// app.set('views', viewsOrigin);
	// app.set('view engine', viewEngineOrigin);

	// DATABASE 
	// ===============================================

	console.log('Supertracker database connected to: mongodb://'+nconf.get('mongodb:host')+'/'+nconf.get('mongodb:dbname'));	
};