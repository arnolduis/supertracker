module.exports = function(app, path) {

	var dashboard = require('../routes/dashboard');
	var track = require('../routes/track');
	
	// routes
	app.get(path+"/dashboard",dashboard);
	app.get(path+"/track",track);
}

module.exports.auth = function (userlevel) {

	if(userlevel == 1) {
		console.log("Authenticated");
		return true;
	}
	console.log("Not authenticated");
	return false;
}

module.exports.hello = function() {
	console.log("hello");
}