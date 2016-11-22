var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
	track_id         : { type: String },
	session_id       : { type: Schema.ObjectId, ref: 'Session' },
	external_user_id : { type: String, default: null},
	name             : { type: String, required: true },
	referrer         : String,
	current_url      : String,
	properties       : Object, //ttt mixed type
	date             : { type: Date, default: Date.now },
	comments         : String
});

// mongoose.model('Event', eventSchema);
module.exports = eventSchema;