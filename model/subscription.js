var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;


module.exports = (function(){
	var SubscriptionSchema = new Schema({
	});

	var Subscription = mongoose.model('User', SubscriptionSchema);

	return Subscription;
})()