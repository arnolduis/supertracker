var Event = require('../models/event');

module.exports = function(path,bufferSize,bufferTimeLimit) {

	return function (req,res) {
		var fs = require('fs');
		
		fs.readFile('node_modules/supertracker/public/viewmodels/funnelVM.js', 'utf8', function (err,result) {
			if (err) {
				return console.log(err);
			}

			Event.find().distinct('name', function (err, names) {
		  		if (err) res.send(err);
				result = result.replace(/%path%/g, path);
				result = result.replace(/%events%/g, JSON.stringify(names));
				// result = result.replace(/%bufferTimeLimit%/g, bufferTimeLimit);

		        res.send(result);
			});
		});
	};	
};