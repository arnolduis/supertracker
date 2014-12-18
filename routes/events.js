var Event = require('../models/event');

module.exports = function(app, stpath) {

	app.get(stpath+"/events",  function(req, res) {
			Event.find({}, function (err, events) {
		  		if (err) console.log(err);	  		
		  		res.send(events);
		  	});
	});

	app.post(stpath+"/events", function(req, res){
		// Saving to server
		Event.create(req.body,function(err) {
			if (err) {
				console.log(err);
				res.send('Server error, couldn\'t save events to server!');
			}

			// Creating server response
			var response = [];

			for (var i = 0 ; i < req.body.length; i++) {

				response.push(req.body[i].name);
			}

			res.send( JSON.stringify(response) );
		});
	});

	app.get(stpath+"/events/getNames", function (req, res) {
		var names;
		Event.find().distinct('name', function (err, names) {
	  		if (err) res.send(err);
	  		res.send(JSON.stringify(names));
		});
	});


};