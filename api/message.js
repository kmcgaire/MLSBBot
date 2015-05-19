var format       = require('util').format
var Auth         = require('../lib/auth');
var utils        = require('../lib/utils');

var respond      = utils.respond;
var sendMessage  = utils.sendMessage;
var dateString   = utils.dateString;


module.exports = function (router, db){

	router.post('/message', function (req, res){
		if (!Auth.isCoreApiSignatureValid(req.rawBody, req.headers['x-kik-signature'])){
			respond(res, 400);
			return;
		}
		respond(res, 200);
		var data = req.body;
		var message = data.body;

		var whensMyGame = new RegExp('(when)|(where)|(who).* game.*', 'i');

		if (data.type !== 'text'){
			sendMessage(username, 'I only know how to handle text :(');
			return;
		}
		data.body = data.body.toLowerCase();
		data.body = data.body.replace("sportzone", "sportszone");
		if (data.body.substring(0,13).toLowerCase() === 'subscriptions'){
			showSubscriptions(data);
		} else if (data.body.substring(0,9).toLowerCase() === 'subscribe'){
			handleSubscribe(data);
		} else if (data.body.substring(0,11).toLowerCase() === 'unsubscribe'){
			handleUnsubscribe(data);
		} else if (whensMyGame.test(data.body)){
			handleWhensMyNextGame(data);
		} else {
			sendMessage(data.from, "Someone has crossed my wires... I don't understand what you are saying");
		}
		return;
	});

	function handleWhensMyNextGame(data){
		var username = data.from;
		db.nextGame(username, function (data){
			if (data.err || !data.results || data.results.length === 0){
				sendMessage(username, "You have no games, maybe you aren't subscribed :(");
			} else {
				var game = data.results;
				var message = "Your next game is %s:\n\n%s vs. %s, at %s - %s"
				message = format(message, dateString(new Date(game.Date)), game.HomeTeam.toProperCase(), game.AwayTeam.toProperCase(), game.Time, game.Field);
				sendMessage(username, message);
			}
		});
	}

	function showSubscriptions(data){
		var username = data.from;
		db.getSubscriptionsForUsername(username, function (data){
			console.log(JSON.stringify(data));
			if (data.err || !data.results || data.results.length === 0){
				sendMessage(username, "You aren't subscribed to any teams :(");
			} else {
				var teams = [];
				for (var i = 0; i < data.results.length; i++){
					teams.push(data.results[i].Team.toProperCase());
				}
				sendMessage(username, format("You are subscribed to: %s", teams.join(", ")));
			}
		})
	}

	function handleUnsubscribe(data){
		var username = data.from;
		var message = data.body;
		var index = 12;
		if (message.indexOf(":") !== -1){
			index++;
		}
		var team = message.substring(index);
		db.removeSubscription(team, username, function (data){
			team = team.toProperCase();
			if (!data){
				sendMessage(username, format("You werent subscribed to %s. Ensure you are subscribed and you typed in the name correctly", team));
			} else {
				sendMessage(username, format("Successfully unsubscribed you to %s :(", team));
			}
		})
	}

	function handleSubscribe(data){
		var username = data.from;
		var message = data.body;
		var index = 10;
		if (message.indexOf(":") !== -1){
			index++;
		}
		var team = message.substring(index);
		db.addSubscription(team, username, function (data){
			team = team.toProperCase();
			if (data.err){
				sendMessage(username, format("Couldn't add subscription for %s ensure you typed name in correctly", team));
			} else if (data.dup){
				sendMessage(username, format("Already subscribed to %s", team));
			} else {
				sendMessage(username, format("Successfully subscribed you to %s, I will update you at 10am any day you play baseball!", team));
			}
		})
	}
}