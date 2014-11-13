var Funnel = require('../models/funnel');

module.exports.post = function(req, res) {

	console.log('routes/funnels.post');
	console.log(req.body.funnel.name);

	Funnel.findOneAndUpdate({'funnel.name': req.body.funnel.name}, req.body, {upsert: true}, function(err) { //qqq Ez Restful? Mert update es create kulon van
		if (err) return res.send(err);
		res.send( { response:"One funnel saved to ttt"} );
	});	
};

module.exports.delete = function(req, res) {
	console.log('userId: '+req.params.userId);
	console.log('funnelName: '+req.params.funnelName);
	Funnel.find({ userId:req.params.userId, 'funnel.name': req.params.funnelName }).remove( function(err) {
		if (err) res.send(err);
		res.send('Funnel '+req.params.funnelName+' deleted.');
	} );
};