var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = {
	track_id: { type:String, required: true }, //ttt Mixed amig nem allitom be jol 
	date: { type: Date, default: Date.now },
	screen_windowX: Number,
	screen_windowY: Number,
	screen_screenX: Number,
	screen_screenY: Number,
	location_ip: String,
	location_country: String,
	location_region: String,
	location_city: String,
	ua_header: String,
	browser_full: String,
	browser_version: String,
	browser_family: String,
	browser_major: String,
	browser_minor: String,
	browser_patch: String,
	os_full: String,
	os_version: String,
	os_family: String,
	os_major: String,
	os_minor: String,
	os_patch: String,	
	device: String,
	referrer_header: String,
	referrer_known: Boolean,
	referrer_referer: String,
	referrer_medium: String,
	referrer_search_parameter: String,
	referrer_search_term: String,
	referrer_uri: String
};
mongoose.model('Session', sessionSchema);