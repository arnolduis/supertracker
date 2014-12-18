var Event = require('../../models/event');
var Funnel = require('../../models/funnel');

module.exports = function(app, stpath) {

	app.get(stpath+"/viewmodels/dashboardVM", function (req,res) {
		var fs = require('fs');

		fs.readFile('node_modules/supertracker/public/viewmodels/dashboardVM.js', 'utf8', function (err,result) {
			if (err) console.log(err);

			Event.distinct('name', function (err, events) {//nnn talan asyncel kellene megoldani a callback hellt
			  	if (err) res.send(err);
				Funnel.find({userId: req.user.userId}, {userId:1, funnel:1, _id:0}, function (err, funnels) {
			  		if (err) res.send(err);
console.log(result);

					result = result.replace(/%path%/g, stpath);
					result = result.replace(/%userId%/g, req.user.userId);
					result = result.replace(/%events%/g, JSON.stringify(events));
					result = result.replace(/%funnels%/g, JSON.stringify(funnels));
			        res.send(result);
				});
			});
		});
	});	
};