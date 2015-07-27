var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = {
	track_id: { type: String, required: true },
	external_user_id: { type: String, required: true },
	external_flag: String
};

module.exports = mongoose.model('User', userSchema);