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
		db.getSubscriptions(data.username, function (subscriptions){
			if (subscriptions && subscriptions.length > 0){
				respond(res, 200, JSON.stringify(subscriptions));
				return;
			} else {
				respond(res, 400, "No subscriptions found");
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
		db.addSubscription(data.team, data.username, function (err){
			if (err){
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