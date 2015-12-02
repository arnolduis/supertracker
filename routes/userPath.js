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

    	User.distinct("track_id", function(err, users) { //qqq Ez Restful? Mert update es create kulon van
    		if (err) {
    			console.log(err);
    			res.send(err);	
    			return;
    		}

    		Event.aggregate([
			    {
			        $match: {
			            track_id: {$in: users}
			        }
			    },
			    {
			        $group: {
			            _id: {
			                track_id: "$track_id",
			                session_id: "$session_id"
			            },
			            events: {$push: "$name"}
			        }
			    }
			], function (err, aggregation) {
				if (err) {
					console.log(err);
					res.send(err);	
					return;
				}
				return	res.send( { response: aggregation} );

				var output = [];
				for(var i = 0; i < aggregation.length; i++) {
				    var row = output[aggregation[i]._id.track_id] || {};
				    row[aggregation[i]._id.session_id] = aggregation[i].events;
				    output[aggregation[i]._id.track_id] = row;
				}

				// res.writeHead(200, {'Content-Type': 'application/json'});
			});
    	});	
    });


};