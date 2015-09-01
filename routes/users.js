var cors = require('cors');

module.exports = function(app, options) {
	var User = options.db.model("User");

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;
	var corsOptions     = options.corsOptions;

	app.post(stpath+"/users", cors(corsOptions), postUsers); // put user to db

	// function getUsers(req, res) {
	// 	User.find({}, function (err, users) {
	//   		if (err) console.log(err);	  		
	//   		res.send(users);
	//   	});
	// }

	function postUsers(req, res){
	console.log(req.body);
		// Saving to server
		User.find({ track_is: req.body.track_id }, function(err, doc) {
			if (err) {
				console.log(err);
				res.send({err: "Couldnt save User tinto databse"});
				return;
			}
			if (doc.length >= 0) {
				res.send( JSON.stringify(req.body) );
				return;
			}
			User.create(req.body,function(err) {
				if (err) {
					console.log(err);
					res.send('Server error, couldn\'t save events to server!');
					return;
				}

				res.send( JSON.stringify(req.body) );
			});
		});
	}
};