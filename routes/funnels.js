var Funnel = require('../models/funnel');
var Event = require('../models/event');

module.exports = function(app, options) {

	var stpath          = options.stpath;
	var bufferSize      = options.bufferSize;
	var bufferTimeLimit = options.bufferTimeLimit;
	var db              = options.db;
	var mwAuth			= options.mwAuth;

	// upsert funnel
	app.post(stpath+"/funnels", function(req, res) {

		console.log('routes/funnels.post');
		console.log(req.body.funnel.name);

		Funnel.findOneAndUpdate({'funnel.name': req.body.funnel.name}, req.body, {upsert: true}, function(err) { //qqq Ez Restful? Mert update es create kulon van
			if (err) return res.send(err);
			res.send( { response:"One funnel saved to ttt"} );
		});	
	});

	/* 
	 *  Delete funnel
	 */
	app.delete(stpath+"/funnels/:userId/:funnelName", function(req, res) {
		console.log('userId: '+req.params.userId);
		console.log('funnelName: '+req.params.funnelName);
		Funnel.find({ userId:req.params.userId, 'funnel.name': req.params.funnelName }).remove( function(err) {
			if (err) res.send(err);
			res.send('Funnel '+req.params.funnelName+' deleted.');
		} );
	});

	/*
	 * Applyfunnel
	 */
	app.post(stpath+"/funnels/apply", function (req, res) {
		/// ddd reszletezd a gondolatmenetet
		var events = [];
		var funnel = {steps: []};
		var debug = {steps:[]};
		for (var i = 0; i < req.body.funnel.steps.length; i++) {
			events.push(req.body.funnel.steps[i].event);
		    funnel.steps[i] = 0;
		}
		var map = function(){
		    emit(this.sessionId,this.name);
		};
		var reduce = function(key, values) {
		    for (var j = 0; j < values.length; j++) {
		        var k = 0;
		        while( (j+k) < values.length && values[j+k] == events[k]) {
		            funnel.steps[k]++;
		            k++;
		        }
		    }

		    return funnel;
		};
		var finalize = function(key, redValues) {
		    if(typeof redValues === 'string'){
		        funnel.steps[0]++;
		    }
		    return funnel;
		};
		var options = {
		        scope: {events: events, funnel:funnel, debug: debug},
		        query: { name: {$in: events}},
		        sort: {sessionId:1, date:1 },
		        finalize: finalize,
		        out: "funnelResult",
		            
		};
		

		Event.mapReduce({
			map      : map,
			reduce   : reduce,
			scope    : options.scope,
			query    : options.query,
			sort     : options.sort,
			finalize : options.finalize,	
			out      : options.out
		}, function (err, model, stats) {
		  model.find().exec(function (err, docs) {
		  	if (err) return console.log(err);
// console.log(JSON.stringify(docs));	
		    res.send(docs[docs.length-1].value.steps);
		  });
		});

	});
};