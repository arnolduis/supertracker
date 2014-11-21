var express = require('express');
var router = express.Router();
var nconf = require('nconf');

nconf.argv()
	 .env()
	 .file('user','config-user-supertracker.json');

/* GET home page. */
router.get('/', function(req, res) {
	console.log(req.app.stpath);
  res.render('index', { title: 'Tracked site', userId: req.user.userId, stpath: nconf.get('stpath') });
});

module.exports = router;
