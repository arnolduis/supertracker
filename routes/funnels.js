var Funnel = require('../models/funnel');

module.exports.post = function(req, res) {

	console.log('routes/funnels.post');
	console.log(req.body.funnel.name);

	Funnel.findOneAndUpdate({'funnel.name': req.body.funnel.name}, req.body, {upsert: true}, function(err) {
		if (err) return res.send(err);
		res.send( { response:"One funnel saved to ttt"} );
	});	

	//Saving to server
	// Funnel.create(req.body,function(err) {
	// 	if (err) res.send(err);		
	// });
};