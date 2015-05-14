var mongoose = require('mongoose');

module.exports = function(config){
	var db = mongoose.connect(config.MONGODB_URL);
}