var util         = require('util');

var Auth         = require('../lib/auth');
var respond      = require('../lib/utils').respond;


module.exports = function (router, db){

	var format = util.format;

	router.get('/games', function (req, res){
		var data = req.body;

		function handleRes(games){
			if (games && games.length > 0){
				respond(res, 200, JSON.stringify(games));
				return;
			} else {
				respond(res, 400, "No games found");
				return;
			}
		};

		if (data.team){
			var team = decodeURIComponent(data.team);
			db.getGames(team, handleRes);
		} else {
			db.getGames(handleRes);
		}
	});

	//TODO multiple games in an array? or one by one
	router.put('/games', function (req, res){
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