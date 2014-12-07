var Funnel = require('../models/funnel');
var Event = require('../models/event');

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

module.exports.apply = function (req, res) {
	var events = [];
	// , date: {$gt: req.body.funnel.from, $lt: req.body.funnel.to}
	console.log(req.body.funnel);
	for (var i = 0; i < req.body.funnel.steps.length; i++) {
		events.push(req.body.funnel.steps[i].event);
	}
	var o = {};

	//ttt reszletezd a doksiban a gondolatmenetet
	o.map = function() {
	    emit(1,this.name);
	};
	//ttt sessionkeveredes
	o.reduce = function(key, values) {
	    var funnel = {steps: []};
	    for (var i = 0; i < events.length; i++) {
	        funnel.steps[i] = 0;
	    }
	    for (var j = 0; j < values.length; j++) {
	        var k = 0;
	        while( (j+k) < values.length && values[j+k] == events[k]) {
	            funnel.steps[k]++;
	            k++;
	        }
	    }

	    return funnel;
	};

    o.scope = {events: events};
    o.query = { name: {$in: events}};
    o.sort = {sessionId:1, date:1 };
    o.out = "funnelResult";
	

	Event.mapReduce(o, function (err, model, stats) {
	  model.find().exec(function (err, docs) {
	  	console.log(err);
	    console.log(docs);
	    res.send(docs[0].value.steps);
	  });
	});

};