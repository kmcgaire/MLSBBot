var utils        = require('../lib/utils');
var respond      = utils.respond;

module.exports = function (router){
	router.get('/health' , function (req, res){
		respond(res, 200);
	})
}