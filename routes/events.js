var Event = require('../models/event');

module.exports = function(req, res) {

		Event.find({}, function (err, events) {
	  		if (err) console.log(err);	  		
	  		res.send(events);
	  	});
};

module.exports.getNames = function (req,res) {
	var names;
	Event.find().distinct('name', function (err, names) {
  		if (err) res.send(err);
  		res.send(JSON.stringify(names));
	});
};
