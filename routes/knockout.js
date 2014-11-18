module.exports = function (req, res) {
	fs = require('fs');

	fs.readFile('node_modules/supertracker/public/javascripts/knockout-3.1.0.js', 'utf8', function (err,result) {
		if (err) return console.log(err);
		res.send(result);
	});
};