var util         = require('util');

var Auth         = require('../lib/auth');
var respond      = require('../lib/utils').respond;


module.exports = function (router, db){

	var format = util.format;

	router.get('/games', function (req, res){
		var data = req.body;

		function handleRes(data){
			var games = data.results;
			if (games && games.length > 0){
				respond(res, 200, JSON.stringify(games));
				return;
			} else {
				respond(res, 200, "No games found");
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
}