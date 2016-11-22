module.exports = function(app, conf) {

	// BASIC SETUP
	// ==============================================

	var express = require('express'); //ttt kell e

	var fs = require('fs');
	var path = require('path');
	var mongoose = require('mongoose');
	var http = require('http');
	var bodyParser = require('body-parser');



	// mongoose.connect('mongodb://'+conf.mongodb.host+'/'+conf.mongodb.dbname);
	// var db = mongoose.connection;

	var db = mongoose.createConnection(conf.mongodb.url);

	// MODELS
	// require("../models/event");
	require("../models/funnel");
	require("../models/session");
	require("../models/user");
	// require("../models/city_block");

	var corsOptions = {
		whitelist: conf.cors.whitelist,
		methods: conf.cors.methods
	};

	// CHECKING PREREQUISITS
	// =============================================
	var options = { 
		stpath           : conf.base_route,
		bufferSize       : conf.buffer.size,
		bufferTimeLimit  : conf.buffer.timeLimit,
		db               : db,
		mwAuth			 : conf.mwAuth,
		corsOptions      : corsOptions
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

	console.log("Supertracker database connected to: " + conf.mongodb.url);	
};