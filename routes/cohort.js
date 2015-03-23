var Event = require('../models/event');

module.exports = function(app, stpath) {

	/* 
	 *  Delete funnel
	 */
	// app.delete(stpath+"/funnels/:userId/:funnelName", function(req, res) {
	// 	console.log('userId: '+req.params.userId);
	// 	console.log('funnelName: '+req.params.funnelName);
	// 	Funnel.find({ userId:req.params.userId, 'funnel.name': req.params.funnelName }).remove( function(err) {
	// 		if (err) res.send(err);
	// 		res.send('Funnel '+req.params.funnelName+' deleted.');
	// 	} );
	// });

	app.post(stpath + "/cohort/apply", function(req, res){
		var cohortArray = [];
		var cohort_from = new Date(req.body.cohort_from + "T00:00:00Z");
		// var cohort_from_plus =  plusXDay(cohort_from, 1);
        var cohort_to   = new Date(req.body.cohort_to + "T00:00:00Z");
        // var cohort_to_plus   = plusXDay(cohort_to, 1);
        var cohortEvent = req.body.cohortEvent;
        var returnEvent = req.body.returnEvent;

        // Event.find({
	       //      "name": cohortEvent,
	       //      "date": {
	       //          "$gte": new Date("2014-01-01T00:00:00Z"),
	       //          "$lt": new Date("2014-01-02T00:00:00Z")
	       //      }
	       //  }).distinct('userId', function(error, cohort) {
            	


        // });

        var cohort = cohortCreate(cohortEvent, cohort_from, cohort_to, cohortTestPeriod);
	});


	function cohortCreate(event, dateFrom, dateTo, callback) {
        Event.find({
	            "name": event,
	            "date": {
	                "$gte": dateFrom,
	                "$lt": dateTo
	            }
	        }).distinct('userId', function(error, cohort) {
        		if (callback) {
        			callback();
        		}
        });
	}

	function plusXDay(date, x){
		var newday = new Date(date.toISOString());
		newday.setDate(date.getDate() + x);
		return newday;
	}


	// function cohortCreate(event, dateFrom, dateTo, callback) {
	//     var cohort = db.runCommand({
	//         "distinct": "events",
	//         "query": {
	//             "name": event,
	//             "date": {
	//                 "$gte": dateFrom,
	//                 "$lt": dateTo
	//             }
	//         },
	//         "key": "userId"
	//     }).values;
	//     return cohort;
	// }

	function cohortTestPeriod(cohort, event, dateFrom, dateTo){
	    return db.runCommand({
	        "distinct": "events",
	        "query": {
	            "userId": { $in: cohort},
	            "name": event,
	            "date": {
	                "$gte": dateFrom,
	                "$lt": dateTo
	            }
	        },
	        "key": "userId"
	    }).values.length;   
	}

	function cohortAnalyse() {
		
	}


	// var cohort = cohortCreate("Subscribe", ISODate("2014-01-01T00:00:00Z"), ISODate("2014-01-02T00:00:00Z"));
	// for(var i = 0; i < 12; i++) {
	//     cohortAnalyse( cohort, "Return", ISODate("2014-01-02T00:00:00Z"), ISODate("2014-01-03T00:00:00Z"));
	// }


};