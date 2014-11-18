var mongoose = require('mongoose');

var sessionSchema = {
	// Session data
	sessionId: { type: String, required: true },//ttt
	userId: { type: String, required: true },
	// Screen
    windowX: { type: String}, 
    windowY: { type: String}, 
    screenX: { type: String}, 
    screenY: { type: String},
    // Geography
    country: { type: String}, 
    region: { type: String}, 
    city: { type: String},
    // User Agent
    userAgent: {
    	userAgentHeader: { type: String},
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
    	device: { type: String}
    },
    // Referrer
    referer: {
    	refererHeader: { type: String},
    	known: String,
    	referer: String,
    	medium: String,
    	search_parameter: String,
    	search_term: String,
    	uri: String
    }
    
};

module.exports = mongoose.model('Session', sessionSchema);