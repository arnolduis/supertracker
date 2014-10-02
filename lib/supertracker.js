console.log("st/st.js");
module.exports = function(app, path, url) {

	dashboard = require('../routes/dashboard');
	track = require('../routes/track');

	// Routes
	app.get(path+"/dashboard",dashboard);
	app.get(path+"/track",track.get);
	app.post(path+"/track",track);
	
};

module.exports.init = function() {
	nconf = require('nconf');
	fs = require('fs');

	nconf.argv()
	     .env()
	     .file({ file: '../config.json' });

	nconf.set('database:host', 'localhost');
	nconf.set('database:port', 27017);

	nconf.save(function (err) {
		fs.readFile('../config.json', function (err, data) {
			console.dir(JSON.parse(data.toString()))
		});
	});
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