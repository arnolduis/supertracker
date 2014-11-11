var mongoose = require('mongoose');

var funnelSchema = {
	userId: { type: String, required: true },
	funnel: String
};

module.exports = mongoose.model('Funnel', funnelSchema);