var fs = require('fs');

module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;


	app.get(stpath+"/tracker", function (req,res) {

		fs.readFile('node_modules/supertracker/public/javascripts/tracker.js', 'utf8', function (err,result) {
			if (err) {
				return console.log(err);
			}

			result = result.replace(/%path%/g, stpath);
			// result = result.replace(/%userId%/g, req.supertracker.userId);
			result = result.replace(/%bufferSize%/g, bufferSize);
			result = result.replace(/%bufferTimeLimit%/g, bufferTimeLimit);

	        res.send(result);
		});
	});
};

