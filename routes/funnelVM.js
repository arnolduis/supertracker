var Event = require('../models/event');
var Funnel = require('../models/funnel');

module.exports = function(path) {

	return function (req,res) {
		var fs = require('fs');
		
		fs.readFile('node_modules/supertracker/public/viewmodels/funnelVM.js', 'utf8', function (err,result) {
			if (err) {
				return console.log(err);
			}

			Event.distinct('name', function (err, events) {//nnn talan asyncel kellene megoldani a callback hellt
			  	if (err) res.send(err);
				Funnel.find({userId: req.body.userId}, function (err, funnels) {
			  		if (err) res.send(err);


					result = result.replace(/%path%/g, path);
					result = result.replace(/%events%/g, JSON.stringify(events));
					result = result.replace(/%funnels%/g, JSON.stringify(funnels));

			        res.send(result);
				});

			});
		});
	};	
};