var util         = require('util');

var Auth         = require('../lib/auth');
var config       = require('../config');
var respond      = require('../lib/utils').respond;


module.exports = function (router, db){

	var format = util.format;

	router.get('/subscriptions', function (req, res){
		var data = req.body;
		if (!data || !data.username){
			respond(res, 404, "username required");
			return;
		}
		db.getSubscriptions(data.username, function (data){
			if (data.results && data.results.length > 0){
				respond(res, 200, JSON.stringify(data.results));
				return;
			} else {
				respond(res, 200, "No subscriptions found");
				return;
			}
		});
	});

	router.put('/subscriptions', function (req, res){
		var data = req.body;
		console.log(req);
		if (!data || !data.team || !data.username){
			respond(res, 404, "username and team required");
			return;
		}
		db.addSubscription(data.team, data.username, function (data){
			if (data.err){
				console.log('could not put ')
				respond(res, 500, "");
				return;
			} else {
				respond(res, 200, format("Added username=%s team=%s",username, team));
				return;
			}
		});
	});

}