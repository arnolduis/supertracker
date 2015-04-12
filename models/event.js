var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = {
	userId: { type: String, required: true },
	sessionId: { type: Schema.ObjectId, ref: 'Session', required: true },
	name: { type: String, required: true },
	referrer: String,
	data: String,
  	date: { type: Date, default: Date.now },
	comments: String
};

module.exports = mongoose.model('Event', eventSchema);