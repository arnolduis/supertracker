var Session = require('../models/session');

module.exports.post = ( function(req, res) {


	var refererParser = require('referer-parser');
	var uaParser = require('ua-parser');

	var r = new refererParser(req.headers.referer, req.protocol + '://' + req.get('host') + req.originalUrl);
	var u = uaParser.parse(req.headers['user-agent']);

    req.body.userAgent = {
		userAgentHeader: req.headers['user-agent'],
		ua: {
	    	full: u.ua.toString(),
	    	version: u.ua.toVersionString(),
	    	family: u.ua.family,
	    	major: u.ua.major,
	    	minor: u.ua.minor,
	    	patch: u.ua.patch
	    },
	    os: {
	    	full: u.os.toString(),
	    	version: u.os.toVersionString(),
	    	family: u.os.family,
	    	major: u.os.major,
	    	minor: u.os.minor,
	    	patch: u.os.patch    	
	    },
		device: u.device.family
    };

	req.body.referer = {
    	refererHeader: req.headers.referer,
    	known: r.known,
    	referer: r.referer,
    	medium: r.medium,
    	search_parameter: r.search_parameter,
    	search_term: r.search_term,
    	uri: r.uri
    };

	var session = new Session(req.body);
	session.save(function (err) {
		if(err) res.send("Couldnt save session");
		res.send({sessionId: session._id});
	});
});