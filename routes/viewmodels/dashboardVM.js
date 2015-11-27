var path = require('path');
var fs = require('fs');

module.exports = function(app, options) {
	var Event = options.db.model("Event", require("../../models/event"));
	var Funnel = options.db.model("Funnel");

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	app.get(stpath+"/viewmodels/dashboardVM", function (req,res) {

		fs.readFile(path.join(__dirname, '../../public/viewmodels/dashboardVM.js') , 'utf8', function (err,result) {
			if (err) res.send(err);

			Event.distinct('name', function (err, events) { //nnn talan asyncel kellene megoldani a callback hellt
			  	if (err) res.send(err);
				Funnel.find({userId: req.supertracker.userId}, {userId:1, funnel:1, _id:0}, function (err, funnels) {
			  		if (err) res.send(err);

			  		var options = {};

			  		var distinct = { distinct: []};

			  		options.scope = {distinct: distinct};

			  		options.map = function () {
			  			if (this.properties) {
			  				for (var i in this.properties) {
			  					emit(i, null);
			  				}
			  			}
			  		};

			  		options.reduce = function (key, values) {
			  			return null;
			  		};

			  		options.out = { inline: 1};

			  		Event.mapReduce(options, function (err, model, stats) {
			  			if (err) {
			  				console.log(err);
			  				return res.send({err: err});
			  			}
			  			var properties = [];
			  			for (var i = 0; i < model.length; i++) {
			  				properties.push(model[i]._id);
			  			}

			  			console.log("properties", properties);
			  			console.log("stats", stats);
						result = result.replace(/%path%/g, stpath);
						result = result.replace(/__properties__/g, JSON.stringify(properties));
						result = result.replace(/%userId%/g, req.supertracker.userId);
						result = result.replace(/%events%/g, JSON.stringify(events));
						result = result.replace(/%funnels%/g, JSON.stringify(funnels));
				        res.send(result);
			  		});

				});
			});
		});
	});	
};