var cors = require('cors');
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
	var corsOptions     = options.corsOptions;

	console.log(corsOptions);//xxx

	app.get(stpath+"/events", cors(corsOptions), getEvents); // get list of all events
	app.post(stpath+"/events", cors(corsOptions), postEvents); // put event to db
	app.post(stpath+"/events/external", cors(corsOptions), postExternalEvent); // put event to db
	app.options(stpath+"/events", cors(corsOptions));
	app.options(stpath+"/events/external", cors(corsOptions));
	app.get(stpath+"/events/getNames", getNames); // get event names for picking

	function getEvents(req, res) {
		Event.find({}, function (err, events) {
	  		if (err) console.log(err);	  		
	  		res.send(events);
	  	});
	}

	function postExternalEvent(req, res) {
			if(req.body.properties && req.body.properties.externalEvent) {
				User.findOne({ external_user_id: req.body.extUserId}, function(err, result) {
					if (err) {
						console.log(err);
						return res.send(err);
					}
					if (!result || (result && result.length <= 0) ) {
						console.log("No matching alias for the gieven user id.");
						return res.send({ err: "No matching alias for the gieven user id."});
					}

					// Add the obtained track_id to external event
					req.body.track_id = result.track_id;

					Event.create(req.body, function(err, doc) {
						if (err) {
							console.log(err);
							res.send('Server error, couldn\'t save events to server!');
							return;
						}
						console.log("PROBABLY INSERÍTED EXTERNAL DOCUMENT");
						console.log(doc);//xxx

						// Creating server response

						res.send( JSON.stringify({response: "Events saved"}) );
					});

				});
			}
		
	}

	function postEvents(req, res){
		var external = [];

		console.log("  ");//xxx
		console.log("  ");//xxx
		console.log("  ");//xxx
		console.log("REQ.BODY:");//xxx
		console.log(req.body);//xxx

		// if (!Array.isArray(req.body)) {
		// 	req.body = [req.body];
		// }

		Event.create(req.body, function(err, doc) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
				return;
			}
			console.log("PROBABLY INSERÍTED DOCUMENT");
			console.log(doc);//xxx

			// Creating server response

			res.send( JSON.stringify({response: "Events saved"}) );
		});

		// // Pre checking external events
		// for (var i = 0; i < req.body.length; i++) {
		// 	if(req.body[i].properties && req.body[i].properties.externalEvent) {
		// 		// Remove external events from request
		// 		var rest = req.body.splice(i + 1);
		// 		external.push(req.body.splice(i));
		// 		req.body = req.body.concat(rest);
		// 	}
		// }

		// console.log("REQ.BODY 2:");//xxx
		// console.log(req.body[i]);//xxx
		// console.log("EXTERNAL:");//xxx
		// console.log(external);//xxx

		// console.log("Is external event");
		// User.findOne({ external_user_id: req.body[i].extUserId}, function(err, result) {
		// 	if (err) {
		// 		console.log(err);
		// 		return res.send(err);
		// 	}
		// 	console.log("RESULT:");//xxx
		// 	console.log(result);//xxx
		// 	console.log("REQ.BODY:");//xxx
		// 	console.log(req.body[i]);//xxx

		// 	if (!result || (result && result.length <= 0) ) {
		// 		console.log("No matching alias for the gieven user id.");
		// 		return res.send({ err: "No matching alias for the gieven user id."});
		// 	}


		// 	// Add the obtained track_id to external event
		// 	req.body[i].track_id = result.track_id;

		// 				// Insert external event onto database
						

		// 			});

		// function createSimpleEvents (argument) {
		// 	Event.create(req.body[i], function(err, res) {
		// 		if (err) {
		// 			console.log(err);
		// 			return res.send(err);
		// 		}

		// 		console.log("Event saved:");//xxx
		// 		console.log(res);//xxx
				


		// 		// Saving the remaining normal events to server
		// 		if (req.body.length > 0) {
		// 			console.log("Saving normal event");//xxx
		// 			Event.create(req.body,function(err, doc) {
		// 				//ttt Validation? Some kind of?...
		// 				if (err) {
		// 					console.log(err);
		// 					return res.send('Server error, couldn\'t save events to server!');
		// 				}


		// 				console.log("DOC:");//xxx
		// 				console.log(doc);//xxx

		// 				res.send( JSON.stringify({ response: "All events has been saved into the Supertracker database."}) );
		// 			});
		// 		} else {
		// 			res.send( JSON.stringify({ response: "All events has been saved into the Supertracker database."}) );
		// 		}
		// 	});
		// }
	}

	function getNames(req, res) {
		var names;
		Event.find().distinct('name', function (err, names) {
	  		if (err) res.send(err);
	  		res.send(JSON.stringify(names));
		});
	}
};