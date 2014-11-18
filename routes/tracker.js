var fs = require('fs');

module.exports = function(path,bufferSize,bufferTimeLimit) {
	return function (req,res) {

		fs.readFile('node_modules/supertracker/public/javascripts/tracker.js', 'utf8', function (err,result) {
			if (err) {
				return console.log(err);
			}

			result = result.replace(/%path%/g, path);
			result = result.replace(/%bufferSize%/g, bufferSize);
			result = result.replace(/%bufferTimeLimit%/g, bufferTimeLimit);

	        res.send(result);
		});
	};
	
};

