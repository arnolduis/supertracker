var Funnel = require('../models/funnel');

module.exports.post = function(req, res) {

	// console.log(JSON.parse(req.body));
	console.log(JSON.parse(req.body));
	//Saving to server
	// Funnel.create(JSON.parse(req.body),function(err) {
	// 	if (err) res.send(err);		
	// 	res.send( "One funnel saved to ttt" );
	// });
};