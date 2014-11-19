var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/secondPage', function(req, res) {
  res.render('secondPage', { title: 'Second Page'});
});

module.exports = router;
