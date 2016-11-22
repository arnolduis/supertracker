var fs = require('fs');
var path = require("path");

module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	var result = null;
	
	try {
		result = fs.readFileSync(path.join(__dirname,'../public/javascripts/tracker.js'), 'utf8');
	}
	catch(e) {
		console.log(e);
	}
	
	if (result) {
		app.get(stpath+"/tracker", function (req,res) {

			result = result.replace(/%path%/g, stpath);
			// result = result.replace(/%userId%/g, req.supertracker.userId);
			result = result.replace(/%bufferSize%/g, bufferSize);
			result = result.replace(/%bufferTimeLimit%/g, bufferTimeLimit);

		    res.send(result);
		});
	}
};

