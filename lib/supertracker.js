module.exports = function(app, conf) {

	// BASIC SETUP
	// ==============================================

	var express = require('express'); //ttt kell e

	var fs = require('fs');
	var path = require('path');
	var mongoose = require('mongoose');
	var http = require('http');
	var bodyParser = require('body-parser');

	var mmGeo = path.join(__dirname, "../node_modules/node-geolite2/data/GeoLite2-City.mmdb");
	var npmGeo = path.join(__dirname, "../dbdata/GeoLite2-City.mmdb");

	var npmGeoCsv = path.join(__dirname, "../dbdata/GeoLite2-City-Blocks-IPv4.csv");

	// var maxmind = require("maxmind");

	// maxmind.init(path.join(__dirname, "../dbdata/GeoLite2-City.mmdb"));
	// console.log("VAROS:");
	// console.log(maxmind.getLocation("80.99.236.194"));
	
	// require the db reader
	// var mmdbreader = require('maxmind-db-reader');
	// // open database
	// mmdbreader.open(path.join(__dirname, "../node_modules/node-geolite2/data/GeoLite2-City.mmdb"),function(err,countries){
	// 	if (err) {
	// 		console.log(err);
	// 	}

	//     // get geodata
	//     countries.getGeoData("80.99.236.194", function(err,geodata){
	//         // log data :D
	//         if (err) {
	//         	console.log(err);
	//         }
	//         console.log(geodata.city);
	//     });
	//     console.log("METADATA:");
	//     countries.getDatabaseMetadata(function (err, data) {
	//     	console.log(data);
	//     });
	// });

	// var mmdbreader2 = require('maxmind-db-reader');
	// // open database
	// mmdbreader2.open(path.join(__dirname, "../dbdata/GeoLite2-City.mmdb"),function(err,countries){
	// 	if (err) {
	// 		console.log(err);
	// 	}

	    // get geodata
	    // countries.getGeoData("80.99.236.194", function(err,geodata){
	    //     // log data :D
	    //     if (err) {
	    //     	console.log(err);
	    //     }
	    //     console.log(geodata);
	    // });
	    

	// });

	// var geoip2 = require('node-geoip2');
	// geoip2.init(mmGeo);
	// geoip2.lookupSimple("80.99.236.194", function(error, result) {
	//   if (error) {
	//     console.log("Error: %s", error);
	//   }
	//   else if (result) {
	//     console.log(result);
	//   }
	// });












	// mongoose.connect('mongodb://'+conf.mongodb.host+'/'+conf.mongodb.dbname);
	// var db = mongoose.connection;

	var db = mongoose.createConnection(conf.mongodb.url);

	// MODELS
	// require("../models/event");
	require("../models/funnel");
	require("../models/session");
	require("../models/user");
	// require("../models/city_block");





	// function numtoip (num) {
		
	// }


	// function dot2num(dot) 
	// {
	//     var d = dot.split('.');
	//     return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
	// }

	// function num2dot(num) 
	// {
	//     var d = num%256;
	//     for (var i = 3; i > 0; i--) 
	//     { 
	//         num = Math.floor(num/256);
	//         d = num%256 + '.' + d;
	//     }
	//     return d;
	// }





	// var dbGeoloc = mongoose.createConnection("mongodb://localhost:27017/geolocation");
	// var CityBlock = dbGeoloc.model("city_block");



	// var firstLine = true;
	// var headers = null;
	 
	// function readLines(input, func) {
	//   var remaining = '';
	 
	//   input.on('data', function(data) {
	//     remaining += data;
	//     var index = remaining.indexOf('\n');
	//     while (index > -1) {
	//       var line = remaining.substring(0, index);
	//       remaining = remaining.substring(index + 1);
	//       func(line);
	//       index = remaining.indexOf('\n');
	//     }
	//   });
	 
	//   input.on('end', function() {
	//     if (remaining.length > 0) {
	//       func(remaining);
	//     }
	//   });
	// }
	 
	// var input = fs.createReadStream(npmGeoCsv);
	// readLines(input, function (line) {
	// 	if (firstLine) {
	// 		headers = line.split(",");
	// 	} else {

	// 		// console.log(headers);

	// 		var lineArr = line.split(",");

	// 		var ip = dot2num(lineArr[0].split("/")[0]);

	// 		var city_block = {};

	// 		city_block[headers[0]] = ip;

	// 		for (var i = 1; i < headers.length; i++) {
	// 			city_block[headers[i]] = lineArr[i];
	// 		}

	// 		CityBlock.create(city_block);
	// 	}

	// 	firstLine = false;
	// });






























	var corsOptions = {
		origin: function(origin, callback) {
					callback(null, conf.cors.whitelist.indexOf(origin) !== -1);
				},
		methods: conf.cors.methods
	};

	// CHECKING PREREQUISITS
	// =============================================
	var options = { 
		stpath          : conf.base_route,
		bufferSize      : conf.buffer.size,
		bufferTimeLimit : conf.buffer.timeLimit,
		db              : db,
		mwAuth			: conf.mwAuth,
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

	console.log('Supertracker database connected to: mongodb://'+conf.mongodb.host+'/'+conf.mongodb.dbname);	
};