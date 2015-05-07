var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = {
	userId: { type: Schema.ObjectId, required: true },
	sessionId: { type: Schema.ObjectId, ref: 'Session', required: true },
	name: { type: String, required: true },
	referrer: String,
	data: String, //ttt mixed type
  	date: { type: Date, default: Date.now },
	comments: String
};

module.exports = mongoose.model('Event', eventSchema);