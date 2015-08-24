var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
	track_id: { type: String, required: true },
	session_id: { type: Schema.ObjectId, ref: 'Session', required: true },
	name: { type: String, required: true },
	referrer: String,
	properties: String, //ttt mixed type
  	date: { type: Date, default: Date.now },
	comments: String
});

// mongoose.model('Event', eventSchema);
module.exports = eventSchema;