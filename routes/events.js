var cors = require('cors');
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = function(app, options) {
var Event = options.db.model("Event", require("../models/event"));
// var Event = options.db.model("Event");

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;
	var corsOptions     = options.corsOptions;

	app.get(stpath+"/events", cors(corsOptions), getEvents); // get list of all events
	app.post(stpath+"/events", cors(corsOptions), postEvents); // put event to db
	app.get(stpath+"/events/getNames", getNames); // get event names for picking

	function getEvents(req, res) {
		Event.find({}, function (err, events) {
	  		if (err) console.log(err);	  		
	  		res.send(events);
	  	});
	}

	function postEvents(req, res){
console.log(req.body);
console.log(ObjectId());
		// Saving to server
		Event.create(req.body,function(err, doc) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
				return;
			}

console.log(doc);

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