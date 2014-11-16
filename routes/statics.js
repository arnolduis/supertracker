var path = require('path');
module.exports = function (req, res) {
	for(var i = 1; i < req.url.length; i++){//qqq jo, hogy igy parsolom?
		if (req.url[i] == '/') {
			res.sendFile(path.join(__dirname, '../public') + req.url.slice(i, req.url.length));
			return;
		}
	}
};
