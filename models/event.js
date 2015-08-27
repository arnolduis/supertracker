var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
	track_id: { type: String, required: true },
	session_id: { type: Schema.ObjectId, ref: 'Session' },
	name: { type: String, required: true },
	referrer: String,
	current_url: String,
	properties: Object, //ttt mixed type
  	date: { type: Date, default: Date.now },
	comments: String
});

// eventSchema.pre('validate', function(next) {
// 	console.log("Pre validate");
// 	if(this.properties && this.properties.externalEvent) {
// 		console.log("External event");//xxx
// 		User.findOne({ external_user_id: this.extUserId}, function(err, result) {
// 			if (err) {
// 				console.log(err);
// 				return res.send(err);
// 			}

// 			if (!result || (result && result.length <= 0) ) {
// 				console.log("No matching alias for the gieven user id.");
// 				return res.send({ err: "No matching alias for the gieven user id."});
// 			}

// 			console.log("RESULT:");//xxx
// 			console.log(result);//xxx
// 			this.track_id = result.track_id;
  			
//   			next();
// 		});
// 	} else {
// 		console.log("non external event");
// 		next();
// 	}
  
// });

// mongoose.model('Event', eventSchema);
module.exports = eventSchema;