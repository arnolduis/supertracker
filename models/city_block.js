var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cityBlockSchema = {
	network : { type:Number, index: true },
	geoname_id: Number,
	registered_country_geoname_id: Number,
	represented_country_geoname_id: Number,
	is_anonymous_proxy: Number,
	is_satellite_provider: Number,
	postal_code: String,
	latitude: Number,
	longitude: Number
};

mongoose.model('city_block', cityBlockSchema);