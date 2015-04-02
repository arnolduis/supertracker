var Event = require('../models/event');
var async = require('async');

module.exports = function(app, stpath) {


	app.post(stpath + "/cohort/apply", function(req, res){
		var retentionDates = [];
		var cohortArray = [];
		var cohortFrom = new Date(req.body.cohort_from + "T00:00:00Z");
        var cohortTo   = new Date(req.body.cohort_to + "T00:00:00Z");
        var cohortEvent = req.body.cohortEvent;
        var cols = req.body.cols;
        var rows = req.body.rows;
        var returnEvent = req.body.returnEvent;
        var testIntervalInDays = daysBetween(cohortFrom, cohortTo);


        // for (var j = 0; j < rows; j++) {
	       //  for (var i = 0; i <= cols; i++) {
	       //  	retentionDates.push({ 
	       //  		i: i,
	       //  		j: j,
	       //  		from: plusXDay(cohortFrom, (j+i) * testIntervalInDays).toISOString(), 
	       //  		to: plusXDay(cohortTo, (j+i) * testIntervalInDays).toISOString()
	       //  	});
	       //  }
        // }

        for (var i = 0; i <= cols; i++) {
        	retentionDates.push({ 
        		i: i,
        		from: plusXDay(cohortFrom, (i) * testIntervalInDays).toISOString(), 
        		to: plusXDay(cohortTo, (i) * testIntervalInDays).toISOString()
        	});
        }

        cohortAnalyse(res, cohortArray, cohortEvent, returnEvent, retentionDates);


	});

	app.post(stpath + "/cohort/getRetentionMatrix", function(req, res){
		var cohortFrom = new Date(req.body.cohort_from + "T00:00:00Z");
        var cohortTo   = new Date(req.body.cohort_to + "T00:00:00Z");
        var cohortEvent = req.body.cohortEvent;
        var returnEvent = req.body.returnEvent;
        var cols = req.body.cols;
        var rows = req.body.rows;
        var testIntervalInDays = daysBetween(cohortFrom, cohortTo);

		var retentionDates = [];
		var retentionMatrix = [[]];
		var cohortDates = [];

		

		for (var i = 0; i < rows; i++) {
			retentionMatrix[i] = [];
			retentionDates[i] = [];
			for (var j = 0; j < cols; j++) {
				retentionDates[i][j] = {
					iRow: i,
					iCol: j,
					from: plusXDay(cohortFrom, (i + j) * testIntervalInDays).toISOString(),
					to: plusXDay(cohortTo, (i + j) * testIntervalInDays).toISOString()
				};

				if (j === 0) {
					cohortDates.push(retentionDates[i][j]);
				}
			}
		}

		retentionAnalyse(res, retentionMatrix, cohortEvent, returnEvent, cohortDates, retentionDates);


	});

	function retentionAnalyse(res, retentionMatrix, cohortEvent, returnEvent, cohortDates, retentionDates) {

		async.each(cohortDates, function (cohortDate, callback) {
	        Event.find({
		            "name": cohortEvent,
		            "date": {
		                "$gte": cohortDate.from,
		                "$lt": cohortDate.to
		            }
	        }).distinct('userId', function(err, cohort) {
	        	if (err) console.log(err);
	        	retentionMatrix[cohortDate.iRow][0] = cohort.length;


	    		async.each(retentionDates[cohortDate.iRow].splice(1,retentionDates[cohortDate.iRow].length), function (retentionDate, callback) {

			        Event.find({
				            "name": returnEvent,
				            "date": {
				                "$gte": retentionDate.from,
				                "$lt": retentionDate.to
				            },
				            userId: { $in: cohort}
				        }).distinct('userId', function(error, returned) {
				        	retentionMatrix[retentionDate.iRow][retentionDate.iCol] = returned.length;
			        		callback();
			        	});
	    		},
	    		function (err) {
	    			if (err) return console.log(err);
	    			callback();
	    		});
	        });
			
		},
		function (err) {
			if (err) return console.log(err);
console.log(retentionMatrix);
			res.send(retentionMatrix);
		});
	}


	function plusXDay(date, x){
		var newday = new Date(date.toISOString());
		newday.setDate(date.getDate() + x);
		return newday;
	}

	function daysBetween ( date1, date2 ) {
		//Get 1 day in milliseconds
		var one_day=1000*60*60*24;

		// Convert both dates to milliseconds
		var date1_ms = date1.getTime();
		var date2_ms = date2.getTime();

		// Calculate the difference in milliseconds
		var difference_ms = Math.abs(date2_ms - date1_ms);

		// Convert back to days and return
		return Math.round(difference_ms/one_day); 
	}


// 	function cohortAnalyse(res, cohortMatrix, cohortEvent, returnEvent, retentionDates) {

//         Event.find({
// 	            "name": cohortEvent,
// 	            "date": {
// 	                "$gte": retentionDates[0].from,
// 	                "$lt": retentionDates[0].to
// 	            }
//         }).distinct('userId', function(error, cohort) {

//         	cohortArray[0] = cohort.length;

//     		async.each(retentionDates.splice(1,retentionDates.length), function (retentionDate, callback) {

// 		        Event.find({
// 			            "name": returnEvent,
// 			            "date": {
// 			                "$gte": retentionDate.from,
// 			                "$lt": retentionDate.to
// 			            },
// 			            userId: { $in: cohort}
// 			        }).distinct('userId', function(error, returned) {
// 			        	cohortArray[retentionDate.i] = returned.length;
// 		        		callback();
// 		        	});

//     		},
//     		function (err) {
//     			if (err) return console.log(err);
// console.log(JSON.stringify(cohortArray));
// 				res.send(cohortArray);
// 				// res.send(JSON.stringify(cohortArray));
//     		});
//         });
// 	}

	// function cohortTestPeriod (argument) {
	// 	// body...
	// }


	// function cohortCreate(event, dateFrom, dateTo) {
 //        Event.find({
	//             "name": event,
	//             "date": {
	//                 "$gte": dateFrom,
	//                 "$lt": dateTo
	//             }
	//         }).distinct('userId', function(error, cohort) {

        		
 //        });
	// }

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

	// function cohortTestPeriod(cohort, event, dateFrom, dateTo){
	//     return db.runCommand({
	//         "distinct": "events",
	//         "query": {
	//             "userId": { $in: cohort},
	//             "name": event,
	//             "date": {
	//                 "$gte": dateFrom,
	//                 "$lt": dateTo
	//             }
	//         },
	//         "key": "userId"
	//     }).values.length;   
	// }




	// var cohort = cohortCreate("Subscribe", ISODate("2014-01-01T00:00:00Z"), ISODate("2014-01-02T00:00:00Z"));
	// for(var i = 0; i < 12; i++) {
	//     cohortAnalyse( cohort, "Return", ISODate("2014-01-02T00:00:00Z"), ISODate("2014-01-03T00:00:00Z"));
	// }


};