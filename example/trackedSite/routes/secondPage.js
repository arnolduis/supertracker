var express = require('express');
var router = express.Router();
var nconf = require('nconf');

nconf.argv()
	 .env()
	 .file('user','config-user-supertracker.json');

/* GET home page. */
router.get('/secondPage', function(req, res) {
  res.render('secondPage', { title: 'Second Page', stpath: nconf.get('stpath')});
});

module.exports = router;
