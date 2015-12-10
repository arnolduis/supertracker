var async = require('async');
var MJ = require('mongo-fast-join');
var mongoJoin = new MJ();

module.exports = function(app, options) {

var Event = options.db.model("Event", require("../models/event"));
var Session = options.db.model("Session");
var User = options.db.model("User");

    var stpath          = options.stpath;
    var bufferSize      = options.bufferSize;
    var bufferTimeLimit = options.bufferTimeLimit;
    var db              = options.db;
    var mwAuth          = options.mwAuth;

    app.get(stpath+"/userPaths", function(req, res) {

    	console.log('routes/userPaths.post');
    	// console.log(req.body);

    	User.find({},{track_id:1, external_user_id: 1},{}, function(err, users) { //qqq Ez Restful? Mert update es create kulon van
    		if (err) {
    			console.log(err);
    			res.send(err);	
    			return;
    		}

    		var dict = {}; // track_id => external_user_id
    		var userTrackIds = [];
    		var l = users.length;
    		var i;

    		for (i = 0; i < l; i++) {
    			if (!dict[users[i].track_id]) {
    				userTrackIds.push(users[i].track_id);
    				dict[users[i].track_id] = users[i].external_user_id;
    			}
    		}

    		Event.aggregate([
			    {
			        $match: {
			            track_id: {$in: userTrackIds}
			        }
			    },
			    {
			        $group: {
			            _id: {
			                track_id: "$track_id",
			                session_id: "$session_id"
			            },
			            events: {$push: "$name"},
			            dates: {$push: "$date"}
			        }
			    }, 
			    {
			        $sort: {"dates": 1}
			    }
			], function (err, aggregation) {
				if (err) {
					console.log(err);
					res.send(err);	
					return;
				}


				for (var i = 0; i < aggregation.length; i++) {
					aggregation[i]._id.track_id = dict[aggregation[i]._id.track_id];
					// console.log(aggregation[i]._id.track_id, dict[aggregation[i]._id.track_id]);
				}

				Event.find({external_user_id: { $exists: true}}, function (err, extEvents) {
					if (err) {
						console.log(err);
						res.send(err);
						return;
					}

					for (var i = 0; i < extEvents.length; i++) {
						aggregation.push({
							_id: {
								track_id: extEvents[i].external_user_id,
								session_id: "external"
							},
							events: [extEvents[i].name],
							dates: [extEvents[i].date]
						});
					}

					var shrink = {};
					var l = aggregation.length;
					for(i = 0; i < l; i++) {
						var tmp = shrink[aggregation[i]._id.track_id];
						if (!tmp) {
							tmp = [];
						}
						tmp.push({
							name: aggregation[i]._id.session_id, 
							events: aggregation[i].events,
							dates: aggregation[i].dates
						});
						shrink[aggregation[i]._id.track_id] = tmp;
					}

					var output = [];
					l = aggregation.length;
					for (i in shrink) {
						output.push({
							name: i,
							sessions: shrink[i]
						});	
					}

					for (i = 0; i < 1; i++) {
						output[i].sessions.sort(function (a,b) {
							if (a.dates[0] === b.dates[0]) {
								return 0;
							}
							if (a.dates[0] < b.dates[0]) {
								return -1;
							}
							if (a.dates[0] > b.dates[0]) {
								return 1;
							}
						});
					}


					res.send(output);
					
				});


				

				// res.writeHead(200, {'Content-Type': 'application/json'});
			});
    	});	
    });


};