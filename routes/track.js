var Event = require('../models/event');

module.exports = function(req, res) {

	var response = [];

	for (var i = 0 ; i < req.body.length; i++) {

		console.log(req.body[i]);
		console.log(req.body[i].name);
		console.log(typeof(req.body[i].name));
		console.log(' ');
		var event = new Event(req.body);

		event.save(function (err) {	if (err) console.log(err);	});		

		// response.push(event.name);
	}

	// res.send( JSON.stringify(response) );
};

module.exports.get = function(req,res) {
	res.send("Mukodok routes/track.get");
};