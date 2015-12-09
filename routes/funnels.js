var mongoose = require("mongoose");
ObjectId = mongoose.Types.ObjectId;
var MJ = require("mongo-fast-join"),
    mongoJoin = new MJ();
var async = require("async");

module.exports = function(app, options) {
var Funnel = options.db.model("Funnel");
var Event = options.db.model("Event", require("../models/event"));
var Session = options.db.model("Session");


	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	// Upsert funnel
	app.post(stpath+"/funnels", function(req, res) {

		console.log('routes/funnels.post');
		console.log(req.body);

		Funnel.findOneAndUpdate({'funnel.name': req.body.funnel.name}, req.body, {upsert: true}, function(err) { //qqq Ez Restful? Mert update es create kulon van
			if (err) {
				console.log(err);
				res.send(err);	
				return;
			}
			res.send( { response:"One funnel saved to ttt"} );
		});	
	});

	/* 
	 *  Delete funnel
	 */
	app.delete(stpath+"/funnels/:userId/:funnelName", function(req, res) {
		console.log('userId: '+req.params.userId);
		console.log('funnelName: '+req.params.funnelName);
		Funnel.find({ userId:req.params.userId, 'funnel.name': req.params.funnelName }).remove( function(err) {
			if (err) res.send(err);
			res.send('Funnel '+req.params.funnelName+' deleted.');
		} );
	});

	/*
	 * Applyfunnel
	 */
	app.post(stpath+"/funnels/apply", function (req, res) {

		console.log(req.body.funnel);
		var sessionProperties = JSON.parse(req.body.funnel.sessionProperties);

		var dateFrom = new Date(req.body.funnel.dateFrom);
		var dateTo = new Date(req.body.funnel.dateTo);


		var events = [];
		var funnel = {steps: []};
		var debug = {steps:[]};

		for (var i = 0; i < req.body.funnel.steps.length; i++) {
			events.push(req.body.funnel.steps[i].event);
		    funnel.steps[i] = 0;
		}

		var options = {
			scope    : { events: events, funnel:funnel, debug: debug},
			query    : {
				name: {$in: events}
			}, 
			sort     : { date: 1 },
			out      : { inline: 1},
		};

		// Function choices
		// Map
		function sessionwiseMap () {
			emit( this.session_id, this.name );
		}
		function userwiseMap () {
			emit( this.track_id, this.name );
		}
		// Reduce
		function linearReduce (key, values) {
			print("linear reduce");
			var funnelLength = 0;
			var i;
			for (i = 0; i < values.length; i++) {
				if(events[funnelLength] === values[i]) {
					funnelLength++;
				}
				if (events.length === funnelLength) {
					break;
				}
			}
			for (i = 0; i < funnelLength; i++) {
				funnel.steps[i]++;	
			}
			return funnel;
		}
		function allfunnelReduce (key, values) {
			print("allfunnel reduce");
			// print(values);
			// print(JSON.stringify(values));
			// print("reduce  ", JSON.stringify(values));
		    for (var j = 0; j < values.length; j++) {
		        var k = 0;
		        while( (j+k) < values.length && values[j+k] == events[k]) {
		            funnel.steps[k]++;
		            k++;
		        }
		    }
		    return funnel;
		}
		function longestFunnelReduce (key, values) {
			print("Longest reduce");
			// print(values);
			// print(JSON.stringify(values));
			// print("reduce  ", JSON.stringify(values));
			funnelLength = 0;
		    for (var j = 0; j < values.length; j++) {
		        var k = 0;
		        while( (j+k) < values.length && values[j+k] == events[k]) {
		            k++;
		        }
		        if (k > funnelLength) {
		        	funnelLength = k;
		        }
		    }
		    for (var i = 0; i < funnelLength; i++) {
		    	funnel.steps[i]++;	
		    }
		    return funnel;
		}



		// map
		options.map = sessionwiseMap;
		// reduce
		options.reduce = allfunnelReduce;
		// finalize
		options.finalize = function(key, redValues) {
			// print("finalize", events[0] == redValues);
		    if(redValues == events[0]){
		        funnel.steps[0]++;
		    }
		    return funnel;
		};
		//Userwise matching
		if (req.body.funnel.options && req.body.funnel.options.userwise) {
			options.map = userwiseMap;
		} 
		// Exact funnel matching
		if (req.body.funnel.options && req.body.funnel.options.exact) {
			delete options.query.name;
		}
		// First users
		if (req.body.funnel.options && req.body.funnel.options.newUsers) {
			sessionProperties.first_session = true;
		} 
		// Longest funnel
		if (req.body.funnel.options && req.body.funnel.options.longestFunnel) {
			options.reduce = longestFunnelReduce;
		} 
		// Linear funnel
		if (req.body.funnel.options && req.body.funnel.options.linearFunnel) {
			options.reduce = linearReduce;
		} 

		process.stdout.write("Map function:    ");
		console.log(options.map);
		process.stdout.write("Reduce function: ");
		console.log(options.reduce);

		// Search for the needed sessions
		sessionProperties.date = { $gte: dateFrom, $lt: dateTo };
		Session.find(sessionProperties,{session_id: 1, track_id: 1},{}, function (err, goodPropSessions) {
			if (err) {
				console.log(err); 
				res.send(err); 
				return;
			}

			var goodPropSessionIds = [];

			for (var i = 0; i < goodPropSessions.length; i++) {
				goodPropSessionIds.push(goodPropSessions[i]._id);
			}

			// console.log(goodPropSessionIds);
			// console.log("goodPropSessions count:", goodPropSessions.length);

			options.query.session_id = { $in:  goodPropSessionIds };

			// console.log(goodPropSessionIds);
			mapreduce(options);
		});


		function mapreduce (options) {
			Event.mapReduce(options, function (err, model, stats) {
				if (err) {
					console.log(err);
					return res.send({err: err});
				}
				if (model.length > 0) {
					res.send(model[model.length-1].value.steps);
				} else {
					res.send({});
				}
			});
		}
	});
};