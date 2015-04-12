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

        var segFrom = new Date(req.body.segFrom);
        var segTimeInt = req.body.segTimeInt;
        var segTo = null;
        var segEvent = req.body.segEvent;
        var segGrpBy = req.body.segGrpBy;
        var responseLength = null;

        var group1 = {};

        if (segGrpBy === '') {
            res.send('ures a segGrpBy');
        }

console.log(req.body);
        // Prepare variables
        switch (segTimeInt) {
            case '30 days':
                segTo = plusXDay(segFrom, 30);
                group1 = {
                    year: { $year: '$date' },
                    period: { $dayOfYear: "$date" },
                    grpBy: prop_mongo[segGrpBy].field
                };
                responseLength = 30;
                break; 

            case '24 weeks':
                segTo = plusXDay(segFrom, 168);
                group1 = {
                    year: { $year: '$date' },
                    period: { $week: "$date" },
                    grpBy: prop_mongo[segGrpBy].field
                };
                responseLength = 24;
                break; 

            case '12 months':
                segTo = plusXMonth(segFrom, 12);
                group1 = {
                    year: { $year: '$date' },
                    period: { $month: "$date" },
                    grpBy: prop_mongo[segGrpBy].field
                };
console.log('group1:');
console.log(group1);
                responseLength = 12;
                break; 

            default: 
                segTo = plusXDay(segFrom, 30);
                group1 = {
                    year: { $year: '$date' },
                    period: { $dayOfYear: "$date" },
                    grpBy: prop_mongo[segGrpBy].field
                };
                responseLength = 30;
        }


// console.log('');
// console.log('');
// console.log(segEvent);
// console.log('');
// console.log(segFrom);   
// console.log(segFrom.toISOString());
// console.log(strftime('%U',segFrom));
// console.log(segTo);
// console.log(segTo.toISOString());
// console.log('');
// console.log(group1);
// console.log('');
// console.log('');
  
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
            leftKeys: ['sessionId'],
            rightKeys: ['_id'],
            newKey: 'session'
        })  
        .exec(function (err, items) {
                if (err) return console.log(err);
// console.log(items); // ttt nem kapom meg a gomb 5 sessionoket
            db.collection('joinedEventSession').drop();
            db.collection('joinedEventSession').insert(items, function (err) {
                db.collection('joinedEventSession').aggregate(
                    [
                    {
                        $group : {
                            _id: group1, // defined in the above switch
                            count: { $sum: 1 }
                        }
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
                  ],
                  function (err, items) {


                    if (err) 
                        return console.log(err);

                    var response = []; // {grpBy: 'opera', data:[1,2,3...]}
                    for (var i = 0; i < items.length; i++) { // browserenkent

console.log(items[i]);

                        // building up hash
                        var hash = {};
                        for (var j = 0; j < items[i].data.length; j++) {
                            if (!hash[items[i].data[j].year])
                                hash[items[i].data[j].year] = {};
                            hash[items[i].data[j].year][items[i].data[j].period] = items[i].data[j].count;
                        }


// console.log(hash);
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
// console.log('items[' + i +']');
// console.log(items[i]);
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
console.log('Response:');
console.log(JSON.stringify(response));
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
        'Browser'                  : { tag: 'browser', 'field': '$session.userAgent.ua.full'}, //ttt
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