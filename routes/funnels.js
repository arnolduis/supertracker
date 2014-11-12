var Funnel = require('../models/funnel');

module.exports.post = function(req, res) {

	console.log('route funnels');
	console.log(req.body.funnel.steps[0].operation_type.operators);
	//Saving to server
	Funnel.create(req.body,function(err) {
		if (err) res.send(err);		
		res.send( { response:"One funnel saved to ttt"} );
	});
};