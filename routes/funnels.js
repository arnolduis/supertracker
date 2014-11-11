var Funnel = require('../models/funnel');

module.exports.save = function(req, res) {

	// Saving to server
	Funnel.create(req.body,function(err) {
		if (err) {
			console.log(err);
			res.send('Server error, couldn\'t save funnel to server!');
		}
		
		res.send( "One funnel saved to ttt" );
	});
};