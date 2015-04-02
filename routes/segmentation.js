var Event = require('../models/event');
var Session = require('../models/session');
var async = require('async');
var MJ = require('mongo-fast-join');
var mongoJoin = new MJ();

module.exports = function(app, stpath, bufferSize, bufferTimeLimit, db) {


    app.post(stpath + "/segmentation/apply", function(req, res){
console.log(req.body);
    

        mongoJoin.query(
            db.collection("events"),
                {name: 'seg_event'},
                {_id:0}
        )
        .join({
            joinCollection: db.collection('sessions'),
            leftKeys: ['sessionId'],
            rightKeys: ['_id'],
            newKey: 'session'
        })
        .exec(function (err, items) {
            db.collection('joinedEventSession').drop();
            db.collection('joinedEventSession').insert(items, function (err) {
                if (err) return console.log(err);
console.log('obj');
            });
        });



//         Event.aggregate([
//             {
//                 $group: {
//                     _id: "$userId",
//                     count: { $sum: 1 }
//                 }
//             }
//         ], function (err, result) {
//             if (err) return console.log(err);
// console.log(result.length);
//             res.send({res: result.length});
//         });
    });
};