console.log("st/st.js");
module.exports = function(app, path) {

	dashboard = require('../routes/dashboard');
	track = require('../routes/track');

	// Routes
	app.get(path+"/dashboard",dashboard);
	app.get(path+"/track",track.get);
	app.post(path+"/track",track);

	
};

module.exports.auth = function (userlevel) {

	if(userlevel == 1) {
		console.log("Authenticated");
		return true;
	}
	console.log("Not authenticated");
	return false;
};

module.exports.hello = function() {
	console.log("hello");
};