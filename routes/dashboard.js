// routes/dashboard.js
var path = require("path")
;
module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;
	var cors			= options.cors;

	// app.get(stpath, renderDashboard);
	app.get(stpath, mwAuth, renderDashboard);

	function renderDashboard(req,res) {
	  	res.render(path.join(__dirname, '../views/dashboard.ejs'),{title: 'Dashboard', stpath: stpath}); //ttt ez retek eossz igy, kezdj vele valamit...
	}
};