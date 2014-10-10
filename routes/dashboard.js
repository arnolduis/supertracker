var Event = require('../models/event');

module.exports = function(req, res) {

		Event.find({}, function (err, events) {

	  		if (err) console.log(err);
	  		
	  		res.send(events);
	  	});
};
