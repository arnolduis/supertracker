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

		var sessionProperties = JSON.parse(req.body.funnel.sessionProperties);

		var dateFrom = new Date(req.body.funnel.dateFrom);
		var dateTo = new Date(req.body.funnel.dateTo);

		// console.log(JSON.stringify(req.body));

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
				date: {
			        $gte: dateFrom,
					$lt: dateTo
				}
			}, 
			sort     : { date: 1 },
			out      : "funnelResult",
		};



		// map
		if (req.body.funnel.options && req.body.funnel.options.userwise) {
			options.map = function(){
			    emit( this.track_id, this.name );
			};
		} else {
			options.map = function(){
			    emit( this.session_id, this.name );
			};
		}

		// reduce
		options.reduce = function(key, values) {
		    for (var j = 0; j < values.length; j++) {
		        var k = 0;
		        while( (j+k) < values.length && values[j+k] == events[k]) {
		            funnel.steps[k]++;
		            k++;
		        }
		    }

		    return funnel;
		};

		// finalize
		options.finalize = function(key, redValues) {
		    if(typeof redValues === 'string'){
		        funnel.steps[0]++;
		    }
		    return funnel;
		};
		

		// Exact funnel matching
		if (req.body.funnel.options && !req.body.funnel.options.exact) {
			options.query.name = {$in: events};
		}

		// First users
		if (req.body.funnel.options && req.body.funnel.options.newUsers) {
			sessionProperties.first_session = true;
		} 

		// Decide if Session examination needed, or not
		if (req.body.funnel.options && req.body.funnel.options.newUsers ||
			Object.keys(sessionProperties).length > 0) {

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

				console.log(goodPropSessionIds);
				console.log("goodPropSessions count:", goodPropSessions.length);

				options.query.session_id = { $in:  goodPropSessionIds };

				// console.log(goodPropSessionIds);
				mapreduce(options);
			});
		} else {
			mapreduce(options);
		}

		function mapreduce (options) {
			Event.mapReduce(options, function (err, model, stats) {
				if (err) {
					console.log(err);
					return res.send({err: err});
				}
				model.find().exec(function (err, docs) {
					if (err) return console.log(err);
					if (docs.length > 0) {
						res.send(docs[docs.length-1].value.steps);
					} else {
						res.send({});
					}
				});
			});
		}
	});
};