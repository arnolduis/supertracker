var Event = require('../models/event');
var mongoose = require('mongoose');

module.exports = function(req, res) {

	// res.send("Mukodik routes/dashboaN");

	mongoose.connect('mongodb://localhost/supertracker');

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {

		Event.find({}, function (err, events) {

	  		if (err) 
	  			console.log(err);

	  		mongoose.disconnect();

	  		res.send(events);
	  	});
	});
}
