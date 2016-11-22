var cors = require("cors");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = function(app, options) {
var Event = options.db.model("Event", require("../models/event"));
var User = options.db.model("User");
// var Event = options.db.model("Event");

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	app.options(stpath+"/events" , cors(options.corsOptions));
	app.get(stpath+"/events"              , getEvents); // get list of all events
	app.get(stpath+"/events/getNames"     , getNames); // get event names for picking
	app.post(stpath+"/events"             , cors(options.corsOptions), postEvents); // put event to db

	app.options(stpath+"/events/external" , cors(options.corsOptions));
	app.post(stpath+"/events/external"    , cors(options.corsOptions), postExternalEvent); // put event to db
	

	function getEvents(req, res) {
		Event.find({}, function (err, events) {
	  		if (err) console.log(err);	  		
	  		res.send(events);
	  	});
	}

	function postExternalEvent(req, res) {
		if(!req.body.external_user_id) {
			console.log("ST: Missing external_user_id");
			return res.send({err: "ST: Missing external_user_id"});
		}
		Event.create(req.body, function(err, doc) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
				return;
			}
			console.log("ST: INSERTED EXTERNAL EVENT:");
			console.log(doc);

			res.send( JSON.stringify({response: "Events saved"}) );
		});
	}

	function postEvents(req, res){
		var external = [];

		// if (!Array.isArray(req.body)) {
		// 	req.body = [req.body];
		// }

		Event.create(req.body, function(err, doc) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
				return;
			}
			console.log("ST: INSERTED EVENT: ");//xxx
			console.log(doc);//xxx

			// Creating server response

			res.send( JSON.stringify({response: "Events saved"}) );
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