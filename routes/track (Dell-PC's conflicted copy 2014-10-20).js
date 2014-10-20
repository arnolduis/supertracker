var Event = require('../models/event');

module.exports = function(req, res) {

	// Saving to server
	Event.create(req.body,function(err) {
		if (err) console.log(err);
	});


	// Creating server response
	var response = [];

	for (var i = 0 ; i < req.body.length; i++) {

		response.push(req.body[i].name);
	}

	res.send( JSON.stringify(response) );
};

module.exports.get = function(req,res) {
	res.send("Mukodok routes/track.get");
};