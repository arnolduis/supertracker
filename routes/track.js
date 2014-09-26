var Event = require('../models/event');

module.exports = function(req, res) {

	console.log("eventReceiver.js");
	console.log(req.body);
	console.log(req.body.name);

	var mongoose = require('mongoose');
	mongoose.createConnection('mongodb://localhost/supertracker');

	var buttonpress = new Event(req.body);	

	buttonpress.save(function (err) {
		if (err) console.log(err);

		mongoose.disconnect();
		
	});
	res.send( { response: req.body.name} );
}