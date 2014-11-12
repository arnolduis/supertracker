var mongoose = require('mongoose');

var funnelSchema = {
	userId: { type: String, required: true },
	funnel: {
		name: String,
		steps: [{
			event: String,
			operation_type: {
				name: String,
				operators: [{
					name: String,
					value: String
				}],
				operator: String,
				property: String,
				value: String
			}
		}]
	}
};

module.exports = mongoose.model('Funnel', funnelSchema);