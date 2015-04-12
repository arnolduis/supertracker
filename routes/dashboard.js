	// routes/dashboard.js
module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	app.get(stpath, mwAuth, renderDashboard);

	function renderDashboard(req,res) {
	  	res.render('../node_modules/supertracker/views/dashboard.ejs',{title: 'Dashboard', stpath: stpath}); //ttt ez retek eossz igy, kezdj vele valamit...
	}
};