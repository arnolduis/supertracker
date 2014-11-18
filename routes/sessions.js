module.exports.post = ( function(req, res) {
	var searchEngine, keyword;
	var utmSource;


	var refererParser = require('referer-parser');
	var uaParser = require('ua-parser');

	var referer = new refererParser(req.headers.referer);
	var ua = uaParser.parse(req.headers['user-agent']);

	console.log(ua.device.toString());

	// req.user.ua = ua.ua.toString();
	// req.user.os = ua.os.toString();
	// req.user.device = ua.device.toString();

	res.send({ok: "ok"});
});