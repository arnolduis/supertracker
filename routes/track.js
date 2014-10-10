var Event = require('../models/event');

module.exports = function(req, res) {

	var buttonpress = new Event(req.body);	

	buttonpress.save(function (err) {

		if (err) console.log(err);
	});

	res.send( { response: req.body.name} );
};

module.exports.get = function(req,res) {
	res.send("Mukodok routes/track.get");
};