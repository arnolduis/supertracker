var mongoose = require('mongoose');

var eventSchema = {
	user_id: { type: String, required: true },
	name: { type: String, required: true },
	data: String,
  	date: { type: Date, default: Date.now },
	comments: String
};

module.exports = mongoose.model('Event', eventSchema);