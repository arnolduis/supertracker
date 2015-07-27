var Event = require('../models/event');
var Session = require('../models/session');
var async = require('async');
var MJ = require('mongo-fast-join');
var mongoJoin = new MJ();
var strftime = require('strftime');

module.exports = function(app, options) {

    var stpath          = options.stpath;
    var bufferSize      = options.bufferSize;
    var bufferTimeLimit = options.bufferTimeLimit;
    var db              = options.db;
    var mwAuth          = options.mwAuth;
    

    app.post(stpath + "/segmentation/apply", mwAuth, applySegmentation); 


    function applySegmentation(req, res){
        var t1 = (new Date()).getTime();

        var segFrom = new Date(req.body.segFrom);
        var segTimeInt = req.body.segTimeInt;
        var segTo = null;
        var segEvent = req.body.segEvent;
        var segGrpBy = req.body.segGrpBy;
        var responseLength = null;


        switch (segTimeInt) {
            case '30 days':
                segTo = plusXDay(segFrom, 30);
                responseLength = 30;
                break; 

            case '24 weeks':
                segTo = plusXDay(segFrom, 168);
                responseLength = 24;
                break; 

            case '12 months':
                segTo = plusXMonth(segFrom, 12);
                responseLength = 12;
                break; 

            default: 
                segTo = plusXDay(segFrom, 30);
                responseLength = 30;
        }  


        mongoJoin.query(
            db.collection("events"),
                {
                    'name': segEvent,
                    'date': {
                        '$gte': segFrom,
                        '$lt': segTo
                    }
                }, // match condition
                {_id:0} // gotten fields
        )
        .join({
            joinCollection: db.collection('sessions'),
            leftKeys: ['session_id'],
            rightKeys: ['_id'],
            newKey: 'session'
        })  
        .exec(function (err, items) {
                if (err) return console.log(err);
            // ttt nem kapom meg a gomb 5 sessionoket
            db.collection('joinedEventSession').drop();
            db.collection('joinedEventSession').insert(items, function (err) {

                // Building the grouping condition
                var group1 = {
                            _id: {}, 
                            count: { $sum: 1 }
                        };


                // Prepare group1 periods,
                switch (segTimeInt) {
                    case '30 days':
                        group1._id.year    = { $year: '$date' };
                        group1._id.period  = { $dayOfYear: "$date" };
                        break; 

                    case '24 weeks':
                        group1._id.year = { $year: '$date' };
                        group1._id.period = { $week: "$date" };
                        break; 

                    case '12 months':
                        group1._id.year = { $year: '$date' };
                        group1._id.period = { $month: "$date" };
                        break; 

                    default: 
                        group1._id.year = { $year: '$date' };
                        group1._id.period = { $dayOfYear: "$date" };
                }   

                //  Prepare final aggregation, and add grpby
                var aggregation = [];

                if (segGrpBy.length > 0) {
                    group1._id.grpBy = prop_mongo[segGrpBy].field;
                    aggregation = [
                        {
                            $group : group1
                        },
                        {
                            $sort: { '_id.year': 1, '_id.period': 1}
                        },
                        {
                            $group: {
                                _id: {
                                    grpBy: '$_id.grpBy'
                                },
                                data: {
                                    $push: {
                                        year: '$_id.year',
                                        period: '$_id.period',
                                        count: '$count'
                                    } 
                                }
                            }
                        },
                        {
                          $project: {
                              _id: 0,
                              grpBy: '$_id.grpBy',
                              data: '$data'
                          }
                      }
                      ];
                }
                else {
                    aggregation = [
                        {
                            $group : group1
                        },
                        {
                            $sort: { '_id.year': 1, '_id.period': 1}
                        },
                        {
                            $group: {
                                _id: null,
                                data: {
                                    $push: {
                                        year: '$_id.year',
                                        period: '$_id.period',
                                        count: '$count'
                                    } 
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                grpBy: { $literal: 'count'},
                                data: '$data'
                            }
                        }
                      ];
                }

// console.log(JSON.stringify(aggregation));
                // Applying the aggregation
                db.collection('joinedEventSession').aggregate( aggregation, function (err, items) {
                    if (err) 
                        return console.log(err);

// console.log(JSON.stringify(items));
                    var response = []; // {grpBy: 'opera', data:[1,2,3...]}
                    for (var i = 0; i < items.length; i++) { // browserenkent

                        // building up hash
                        var hash = {};
                        for (var j = 0; j < items[i].data.length; j++) {
                            if (!hash[items[i].data[j].year])
                                hash[items[i].data[j].year] = {};
                            hash[items[i].data[j].year][items[i].data[j].period] = items[i].data[j].count;
                        }


                        var responseData = []; // [1,2,3 0,0,0,0...]
                        var iDate = new Date(+segFrom);

                        switch (segTimeInt) {
                            case '30 days':
                                // response feltoltese
                                for (var j = 0; j < responseLength; j++) { 
                                    responseData[j] = 0;
                                    if (hash[iDate.getFullYear()]) {
                                        if (hash[iDate.getFullYear()][dayOfYear(iDate)]) {
                                            responseData[j] = hash[iDate.getFullYear()][dayOfYear(iDate)];
                                        }
                                    }
                                    iDate.setDate(iDate.getDate() + 1);
                                }
                                var responseItem = {grpBy: items[i].grpBy, data: responseData};
                                response.push(responseItem);
                                break;

                            case '24 weeks':
                                
                                // response feltoltese
                                for (var j = 0; j < responseLength; j++) { 
                                    responseData[j] = 0;
                                    if (hash[iDate.getFullYear()]) {
                                        if (hash[iDate.getFullYear()][Number(strftime('%U', iDate))]) {
                                            responseData[j] = hash[iDate.getFullYear()][Number(strftime('%U', iDate))];
                                        }
                                    }
                                    iDate.setDate(iDate.getDate() + 7);
                                }
                                var responseItem = {grpBy: items[i].grpBy, data: responseData};
                                response.push(responseItem);
                                break; 

                            case '12 months':
                                for (var j = 0; j < responseLength; j++) { 
                                    responseData[j] = 0;
                                    if (hash[iDate.getFullYear()]) {
                                        if (hash[iDate.getFullYear()][iDate.getMonth()]) {
                                            responseData[j] = hash[iDate.getFullYear()][iDate.getMonth()];
                                        }
                                    }
                                    iDate.setMonth(iDate.getMonth() + 1);
                                }
                                var responseItem = {grpBy: items[i].grpBy, data: responseData};
                                response.push(responseItem);
                                break; 

                            default: 
                        }
                    }
// console.log(response);
                    var t2 = (new Date()).getTime();
                    console.log('>>> Elapsed time: ' + (t2-t1)/1000 + 'ms');
                    res.send(response);
                });
                
            });
        });
    }


    ///////////////////////////////////////////
    //          UTILITY FUNCTIONS            


    function plusXDay(date, x){
        var newday = new Date(date.toISOString());
        newday.setDate(date.getDate() + x);
        return newday;
    }

    function plusXMonth(date, x){
        var newday = new Date(date.toISOString());
        newday.setMonth(date.getMonth() + x);
        return newday;
    }
    function dayOfYear (date) {
        var start = new Date(date.getFullYear(), 0, 0);
        var diff = date - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);
        return day;
    }

    function weakOfYear (date) {
        var target = new Date(+date);
        var dayNr = (target + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }

    var prop_mongo = {
        '': null,
        'Browser'                  : { tag: 'browser', 'field': '$session.userAgent.ua.family'}, //ttt
        'City'                     : { tag: 'city', 'field': '$session.location.city'},
        'Country'                  : { tag: 'country', 'field': '$session.location.country'},
        'Initial Referrer'         : { tag: 'ireferer', 'field': '$session.referrer.referer'}, //ttt
        'Initial referring domain' : { tag: 'irefererdomain', 'field': '$session.referrer.country'}, //ttt
        'Operating System'         : { tag: 'os', 'field': '$session.userAgent.os.family'},
        'Referrer'                 : { tag: 'referrer', 'field': '$referrer'},
        'Region'                   : { tag: 'screenY', 'field': '$session.location.region'},
        'Screen Height'            : { tag: 'screenX', 'field': '$session.screen.screenX'},
        'Screen Width'             : { tag: 'country', 'field': '$session.screen.screenY'}
    };
};