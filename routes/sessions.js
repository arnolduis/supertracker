var cors = require("cors");

module.exports = function (app, options) {
	var Session = options.db.model("Session");
	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;
	var corsOptions     = options.corsOptions;

	app.post(stpath+"/sessions", cors(corsOptions), function(req, res) {

		var refererParser = require('referer-parser');
		var uaParser = require('ua-parser');

		var r = new refererParser(req.headers.referer, req.protocol + '://' + req.get('host') + req.originalUrl);
		var u = uaParser.parse(req.headers['user-agent']);

		req.body.location_ip = iptonum(req.ip);
		req.body.ua_header = req.headers['user-agent'];
	    req.body.browser_full = u.ua.toString();
	    req.body.browser_version = u.ua.toVersionString();
	    req.body.browser_family = u.ua.family;
	    req.body.browser_major = u.ua.major;
	    req.body.browser_minor = u.ua.minor;
	    req.body.browser_patch = u.ua.patch;
	    req.body.os_full = u.os.toString();
	    req.body.os_version = u.os.toVersionString();
	    req.body.os_family = u.os.family;
	    req.body.os_major = u.os.major;
	    req.body.os_minor = u.os.minor;
	    req.body.os_patch = u.os.patch;
		req.body.device = u.device.family;
    	req.body.referrer_header = req.headers.referer;
    	req.body.referrer_known = r.known;
    	req.body.referrer_referer = r.referer;
    	req.body.referrer_medium = r.medium;
    	req.body.referrer_search_parameter = r.search_parameter;
    	req.body.referrer_search_term = r.search_term;
    	req.body.referrer_uri = JSON.stringify(r.uri);

		var session = new Session(req.body);

		Session.create(req.body, function (err) {
			if(err) {
				console.log(err);
				return res.send({err: "Couldnt save session"});
			}
			res.send({sessionId: session._id});
		});
	});

	function iptonum(IPaddress) {
	    var ip = IPaddress.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	    if(ip) {
	        return (+ip[1]<<24) + (+ip[2]<<16) + (+ip[3]<<8) + (+ip[4]);
	    }
	    // else ... ?
	    return null;
	}
};