var path = require('path');

module.exports = function (app, stpath) {
	app.get([stpath+'/javascripts/*', stpath+'/stylesheets/*'], function (req, res) {
		// console.log("routes/statics: ");
		for(var i = 1; i < req.url.length; i++){//qqq jo, hogy igy parsolom?
			if (req.url[i] == '/') {
				//ttt itt at kell irnom ciklus nelkuli stpath.lengthesre
				return res.sendFile(path.join(__dirname, '../public') + req.url.slice(i, req.url.length));
			}
		}
	});
};