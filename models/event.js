var mongoose = require('mongoose');

var eventSchema = {
	userId: { type: String, required: true },
	sessionId: { type: String, required: true },
	referrer: String,
	name: { type: String, required: true },
	data: String,
  	date: { type: Date, default: Date.now },
	comments: String
};

module.exports = mongoose.model('Event', eventSchema);