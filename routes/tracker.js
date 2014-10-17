module.exports = function(path) {

	return function (req,res) {
		var fs = require('fs');
		fs.readFile('node_modules/supertracker/public/javascripts/tracker.js', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(/%=path%/g, path);

			  // fs.writeFile(someFile, result, 'utf8', function (err) {
			  //    if (err) return console.log(err);
			  // });

	        res.send(result);
		});
	};
	
};