var Event = require('../models/event');

module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	app.get(stpath+"/events", getEvents); // get list of all events
	app.post(stpath+"/events", postEvents); // put event to db
	app.get(stpath+"/events/getNames", getNames); // get event names for picking

	function getEvents(req, res) {
		Event.find({}, function (err, events) {
	  		if (err) console.log(err);	  		
	  		res.send(events);
	  	});
	}

	function postEvents(req, res){
	console.log(req.body);
		// Saving to server
		Event.create(req.body,function(err) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
				return;
			}

			// Creating server response
			var response = [];

			for (var i = 0 ; i < req.body.length; i++) {

				response.push(req.body[i].name);
			}

			res.send( JSON.stringify(response) );
		});
	}

	function getNames(req, res) {
		var names;
		Event.find().distinct('name', function (err, names) {
	  		if (err) res.send(err);
	  		res.send(JSON.stringify(names));
		});
	}
};