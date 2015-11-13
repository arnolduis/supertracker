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
		console.log(req.body.funnel.name);

		Funnel.findOneAndUpdate({'funnel.name': req.body.funnel.name}, req.body, {upsert: true}, function(err) { //qqq Ez Restful? Mert update es create kulon van
			if (err) return res.send(err);
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

		function hexDecrement(str, carry) {
		    var hex = str.match(/[0-9a-f]/gi);
		    var digit = hex.length;

		    while (digit-- && carry) {
		        var dec = parseInt(hex[digit], 16) - carry;
		        console.log(dec);
		        if (dec < 0) {
		            carry = 1;
		            dec = 15;
		        } else {
		            carry = 0;
		        }
		        hex[digit] = dec.toString(16);
		    }
		    return(hex.join(""));
		}

		function hexIncrement(str, carry) {
		    var hex = str.match(/[0-9a-f]/gi);
		    var digit = hex.length;

		    while (digit-- && carry) {
		        var dec = parseInt(hex[digit], 16) + carry;
		        // console.log(dec);
		        carry = Math.floor(dec / 16);
		        dec %= 16;
		        hex[digit] = dec.toString(16);
		    }
		    return(hex.join(""));
		}

		Event.find({}, function (err, docs) {
			var matches = 0;

			async.each(docs, function (doc, callback) {
				if (!doc.session_id) {
					// console.log(docs[i]._id, docs[i].name);
					return;
				}
				// console.log(doc.session_id); 

				var plusOne = hexIncrement(doc.session_id.toString(), 1);
				// console.log(doc.session_id.toString());
				// console.log(plusOne);
				Session.find({_id: ObjectId(plusOne)}, function (err, session) {
					matches++;
					callback();
				},
				function (err) {
					if (err) {
						console.log(err);
					}
					console.log("Matches:", matches);
				});
			});
			// console.log("Events:  ", docs.length);
			// console.log("Matches: ", matches);
		});











		// Session.find({},{_id: 1, track_id: 1}, function(err, docs){
		// 	// console.log(docs);
		// 	onSessionsArrived(docs);
		// });

		// function onSessionsArrived(docs) {
		// 	var buffer = {};
		// 	for (var i = 0; i < docs.length; i++) {
		// 		// console.log(new ObjectId(docs[i]._id).c());
		// 		buffer._id = docs[i]._id;
		// 		buffer.track_id = docs[i].track_id;
		// 		buffer.timestamp =  new ObjectId(docs[i]._id).getTimestamp();

		// 		// console.log(buffer);
		// 	}
		// 	mongoJoin
		// 	    .query(
		// 	      //say we have sales records and we store all the products for sale in a different collection
		// 	      db.collection("events"),
		// 	        {}, //query statement
		// 	        {}, //fields
		// 	        {} // options
		// 	    )
		// 	    .join({
		// 	        joinCollection: db.collection("sessions"),
		// 	        //respects the dot notation, multiple keys can be specified in this array
		// 	        leftKeys: ["track_id"],
		// 	        //This is the key of the document in the right hand document
		// 	        rightKeys: ["track_id"],
		// 	        //This is the new subdocument that will be added to the result document
		// 	        newKey: "session"
		// 	    })
		// 	    //Call exec to run the compiled query and catch any errors and results, in the callback
		// 	    .exec(function (err, items) {
		// 	    	var matches = 0;
		// 		    var itemsTrimmed = [];
		// 		    console.log("items Length", items.length);
		// 	        for (var i = 0; i < items.length; i++) {
		// 				var itemTrimmed = {
		// 					_i: items[i]._id,
		// 					session_id: items[i].session_id
		// 				};

		// 		        if ( Array === items[i].session.constructor) {
		// 		        	for (var j = 0; j < items[i].session.length; j++) {
		// 		        		if (ObjectId(items[i].session[j]._id).getTimestamp().toString() == ObjectId(items[i].session_id).getTimestamp().toString()) {
		// 		        			itemTrimmed["sessionRid_" + j] = items[i].session[j]._id;
		// 		        			matches++;
		// 		        		}
		// 		        	}
		// 		        }
		// 		        else if("object" === typeof items[i].session) {
		// 		        	itemTrimmed.sessionRid = items[i].session._id;
		// 		        	matches++;
		// 		        }
		// 		        if(itemTrimmed.sessionRid_0 && itemTrimmed.sessionRid_1) {
		// 		        	console.log(itemTrimmed);
		// 		        }
		// 		        itemsTrimmed.push(itemTrimmed);
		// 	        }
		// 	        // console.log(JSON.stringify(items));
		// 	        // console.log(itemsTrimmed);
		// 	        console.log(items.length);
		// 	        console.log(matches);
		// 	    });
		// }


















		// console.log(req.body);
		// var events = [];
		// var funnel = {steps: []};
		// var debug = {steps:[]};

		// for (var i = 0; i < req.body.funnel.steps.length; i++) {
		// 	events.push(req.body.funnel.steps[i].event);
		//     funnel.steps[i] = 0;
		// }

		// var options = {
		// 	scope    : { events: events, funnel:funnel, debug: debug},
		// 	query    : {
		// 		date: {
		// 	        $gte: new Date(req.body.funnel.from + "T00:00:00.000Z"),
		// 			$lt: new Date(req.body.funnel.to + "T23:59:59.999Z")
		// 		}
		// 	}, 
		// 	sort     : { date: 1 },
		// 	out      : "funnelResult",
		// };

		// // map
		// if (req.body.funnel.options && req.body.funnel.options.userwise) {
		// 	options.map = function(){
		// 	    emit( this.track_id, this.name );
		// 	};
		// } else {
		// 	options.map = function(){
		// 	    emit( this.session_id, this.name );
		// 	};
		// }

		// // reduce
		// options.reduce = function(key, values) {
		//     for (var j = 0; j < values.length; j++) {
		//         var k = 0;
		//         while( (j+k) < values.length && values[j+k] == events[k]) {
		//             funnel.steps[k]++;
		//             k++;
		//         }
		//     }

		//     return funnel;
		// };

		// // finalize
		// options.finalize = function(key, redValues) {
		//     if(typeof redValues === 'string'){
		//         funnel.steps[0]++;
		//     }
		//     return funnel;
		// };
		
		// // Exact funnel matching
		// if (req.body.funnel.options && !req.body.funnel.options.exact) {
		// 	options.query.name = {$in: events};
		// }

		// // First users
		// // if (req.body.funnel.options && req.body.funnel.options.newUsers) {
		// // 	options.query.first_session = true;
		// // }

		// // New Users
		// // Session.find({first_session: true}, {_id: 1}, function (err, docs) {
		// // 	if (err) {
		// // 		console.log(err);
		// // 		return res.send(err);
		// // 	}

		// // 	var firstSessions = [];
		// // 	for (var i = 0; i < docs.length; i++) {
		// // 		firstSessions.push(docs[i]._id);
		// // 	}

		// // 	console.log(firstSessions);

		// // 	options.query.session_id = { $in: firstSessions };

		// // 	Event.mapReduce(options, function (err, model, stats) {
		// // 		if (err) {
		// // 			console.log(err);
		// // 			return res.send({err: err});
		// // 		}
		// // 	  model.find().exec(function (err, docs) {
		// // 	  	if (err) return console.log(err);
		// // 	  	if (docs.length > 0) {
		// // 	    	res.send(docs[docs.length-1].value.steps);
		// // 	  	} else {
		// // 	  		res.send({});
		// // 	  	}
		// // 	  });
		// // 	});
		// // });
		// // return;

		// Event.mapReduce(options, function (err, model, stats) {
		// 	if (err) {
		// 		console.log(err);
		// 		return res.send({err: err});
		// 	}
		//   model.find().exec(function (err, docs) {
		//   	if (err) return console.log(err);
		//   	if (docs.length > 0) {
		//     	res.send(docs[docs.length-1].value.steps);
		//   	} else {
		//   		res.send({});
		//   	}
		//   });
		// });

	});
};