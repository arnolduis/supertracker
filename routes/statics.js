var path = require('path');
var nconf = require('nconf');

nconf.argv()
	 .env()
	 .file('user','config-user-supertracker.json')
	 .file('default','node_modules/supertracker/config/config-default-supertracker.json');

module.exports = function (req, res) {
	for(var i = 1; i < req.url.length; i++){//qqq jo, hogy igy parsolom?
		if (req.url[i] == '/') {
			// console.log(i);
			// console.log(nconf.get('stpath').length);
			//ttt itt at kell irnom ciklus nelkuli stpath.lengthesre
			return res.sendFile(path.join(__dirname, '../public') + req.url.slice(i, req.url.length));
		}
	}
};
