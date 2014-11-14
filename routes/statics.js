fs = require('fs');
module.exports.stylesheets = function (req, res) {
	res.sendFile('./node_modules/supertracker/public/javascripts/' + req.params[0],{root: '.'}); //ttt ezzel keseobb kezdj valamit
};
module.exports.javascripts = function (req, res) {
	res.sendFile('./node_modules/supertracker/public/javascripts/' + req.params[0],{root: '.'}); //ttt ezzel keseobb kezdj valamit
};