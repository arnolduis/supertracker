var mongoose = require('mongoose');

var sessionSchema = {
	// Session data
	userId: { type:String, required: true },
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
    referer: {
    	refererHeader: String,
    	known: Boolean,
    	referer: String,
    	medium: String,
    	search_parameter: String,
    	search_term: String,
    	uri: String
    }
    
};
module.exports = mongoose.model('Session', sessionSchema);