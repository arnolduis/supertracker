var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = {
	userId: { type:Schema.ObjectId, required: true },
    date: { type: Date, default: Date.now },
	screen: {
		windowX: Number, 
		windowY: Number, 
		screenX: Number, 
		screenY: Number,		
	},
    location: {
    	ipAddress: String,
    	country: String, 
    	region: String, 
    	city: String,
    },
    userAgent: {
    	userAgentHeader: String,
    	ua: {
        	full: String,
        	version: String,
        	family: String,
        	major: String,
        	minor: String,
        	patch: String
        },
        os: {
        	full: String,
        	version: String,
        	family: String,
        	major: String,
        	minor: String,
        	patch: String    	
        },
    	device: String
    },
    referrer: {
    	referrerHeader: String,
    	known: Boolean,
    	referer: String,
    	medium: String,
    	search_parameter: String,
    	search_term: String,
    	uri: String
    }
    
};
module.exports = mongoose.model('Session', sessionSchema);