var request      = require('request');
var format       = require('util').format
var auth         = require('../lib/auth');
var utils        = require('../lib/utils');

var jokes = require('../lib/jokes.json');

var respond      = utils.respond;
var sendMessage  = utils.sendMessage;
var dateString   = utils.dateString;


module.exports = function (router, db){

	//Should be in DB but like w.e
	var states = {};

	router.post('/message', function (req, res){
		if (!auth.isCoreApiSignatureValid(req.rawBody, req.headers['x-kik-signature'])){
			respond(res, 400);
			return;
		}
		respond(res, 200);
		var data = req.body;
		var message = data.body;

		var whensMyGame = new RegExp('((what)|(who)|(when)|(where)|(next)).+((game)|(facing)|(play)|(field))', 'i');
		var playToday   = new RegExp('Do.+play.+today','i');

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
		} else if (states[data.from] && states[data.from].jokeState){
			sendJokes(data);
		} else if (playToday.test(data.body) || whensMyGame.test(data.body)){
			handleWhensMyNextGame(data);
		} else if (data.body.indexOf('fun') !== -1 || data.body.indexOf('count') !== -1){
			funMeter(data);
		} else if (data.body.indexOf('weather') !== -1){
			getWeather(data);
		} else if (data.body.indexOf('joke') !== -1){
			sendJokes(data);
		} else {
			handleNoMatch(data);
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
	};

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
		});
	};

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
		});
	};

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
				sendMessage(username, format("Successfully subscribed you to %s, I will update you at 7:45am any day you play baseball!", team));
			}
		});
	};

	function funMeter(data){
		var username = data.from;
		var options = {
			uri: 'http://mlsb.ca',
			method: 'GET'
		}
		sendMessage(username, "Calculating the amount of fun we are having beep boop....")

		request(options, function (error, response, body){
			if (error || response.statusCode !== 200) {
				sendMessage(username, "Sorry I was unable to determine the amount of fun we are having :(");
			} else {
				var html = body.split('data-start-value');
				html = html[1].split('\"');
				var fun = html[1];
				sendMessage(username, format("Looks like the fun meter is at %s/500", fun));
			}
		})
	};

	function getWeather(data){
		var username = data.from;
		var options = {
			uri: 'http://api.openweathermap.org/data/2.5/weather',
			method: 'GET',
			qs: { q: 'Waterloo,Can' },
			json: true
		};
		request(options, function (error, response, body){
			if (error || response.statusCode !== 200) {
				sendMessage(username, "Weather information is down :( look out the window?");
			} else {
				var weather = body.weather[0].description;
				var temp = parseInt(body.main.temp) - 273
				sendMessage(username, format("Temp: %d°C\n%s",temp,weather));
			}
		});
	};


	function handleNoMatch(data){
		sendMessage(data.from, "Thanks:) I think, not sure what you said");
	}

	function sendJokes(data){
		if (states[data.from] && states[data.from].jokeState){
			sendMessage(data.from, states[data.from].jokeResponse);
			states[data.from].jokeState = false;
			return;
		}
		var jokeIndex = Math.floor(Math.random()*jokes.length)
		var joke = jokes[jokeIndex][0];
		if (jokes[jokeIndex].length !== 1){
			var response = jokes[jokeIndex][1];
			states[data.from] = {
				jokeState: true,
				jokeResponse: response
			}
		}
		sendMessage(data.from, joke);
	}

}