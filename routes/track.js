var Event = require('../models/event');
var mongoose = require('mongoose');

module.exports = function(req, res) {

	console.log("supertracker/routes/track.js");

	mongoose.connect('mongodb://localhost/supertracker');

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {

		var buttonpress = new Event(req.body);	

		buttonpress.save(function (err) {

	  		if (err) 
	  			console.log(err);

	  		mongoose.disconnect();

	  	});
	});

	res.send( { response: req.body.name} );
}

module.exports.get = function(req,res) {
	res.send("Mukodok routes/track.get");
}