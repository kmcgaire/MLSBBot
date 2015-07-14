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
	var domusLeader;
	var sentryLeader;

	var fields = [];


	var hour = 60*60*1000;
	var minute = 1000*60;

	var whitelisted = [
		'plleras'
	]

	updateDomusLeader();
	updateSentryLeader();
	fieldConditions();
	setInterval(function(){
		updateDomusLeader();
		updateSentryLeader();
	}, hour);

	setInterval(function(){
		fieldConditions();
	}, 15 * minute);

	router.post('/message', function (req, res){
		if (!auth.isCoreApiSignatureValid(req.rawBody, req.headers['x-kik-signature'])){
			respond(res, 400);
			return;
		}
		respond(res, 200);
		var body = req.body;
		if (body.messages && Array.isArray(body.messages)){
			body.messages.forEach(function (data){
				parseMessage(data);
			});
		} else {
			//Backwards Compatiable
			parseMessage(body);
		}

	});

	function parseMessage(data){
			var message = data.body;

			var whensMyGame = new RegExp('((what)|(who)|(when)|(where)|(next)).+((game)|(facing)|(play)|(field))', 'i');
			var playToday   = new RegExp('Do.+play.+today','i');

			var lock = false;

			if (data.type !== 'text'){
				return;
			}
			if (whitelisted.indexOf(data.from) !== -1 && data.body.substring(0,5).toLowerCase() === 'blast'){
				sendBlast(data);
			} else {
				data.body = data.body.toLowerCase();
				data.body = data.body.replace("sportzone", "sportszone");
				if (data.body.substring(0,13) === 'subscriptions'){
					showSubscriptions(data);
				} else if (data.body.substring(0,9) === 'subscribe'){
					handleSubscribe(data);
				} else if (data.body.substring(0,11) === 'unsubscribe'){
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
				} else if (data.body.indexOf('domus') !== -1){
					handleDomusLeader(data);
				} else if (data.body.indexOf('sentry') !== -1){
					handleSentryLeader(data);
				} else if (data.body.indexOf('field conditions') !== -1){
					handleFieldConditions(data);
				} else  {
					handleNoMatch(data);
				}
			}
			return;
		}

	function sendBlast(data){
		var index = 6;
		if (data.body[5] === ":"){
			index++;
		}
		var blastUsername = data.from;
		var message = data.body.substring(index);
		console.log('Want to blast all users with' + message);
		db.getAllUsernames(function(data){
			if (data.err || !data.results || data.results.length === 0){
				sendMessage(blastUsername, "Blast failed talk to kevin");
			} else {
				sendMessage(blastUsername, "Blasting users with: ");
				sendMessage(blastUsername, message);
				var usernames = data.results;
				usernames.forEach(function(userData){
					var username = userData.username;
					sendMessage(username, message);
				})
			}
		})
	}

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

	function updateSentryLeader(callback){
		var options = {
			uri: 'http://www.mlsb.ca/index.php/sentry-singles-competition/',
			method: 'GET'
		}
		request(options, function (error, response, body){
			if (error || response.statusCode !== 200) {
				callback && callback(false);
			} else {
				html = body.split('row-2 even')[1].split(">");
				var name = html[2].split("<")[0];
				var hits = html[6].split('<')[0];
				sentryLeader = {
					name: name,
					hits: hits
				}
				console.log(format("Sentry Leader Leader is :%s with %s singies", name, hits));
				callback && callback(true);
			}
		});
	}

	function fieldConditions(callback){
		var options = {
			uri: 'http://www.waterloo.ca/en/living/fieldsandballdiamonds.asp',
			method: 'GET'
		}
		request(options, function (error, response, body){
			if (error || response.statusCode !== 200) {
				callback && callback(false);
			} else {
				for (var i = 0; i < 4; i++){
					fields[i] = body.split('Waterloo Park Diamond ' + (i + 1))[1].split(";")[1].split('<')[0];
				}
				for (var i = 0; i < 4; i++){
					console.log("Field WP" + (i+1) + ": " + fields[i]);
				}
				callback && callback(true);
			}
		});
	}

	function updateDomusLeader(callback){
		var options = {
			uri: 'http://www.mlsb.ca/index.php/race-for-the-domus-cup/',
			method: 'GET'
		}
		request(options, function (error, response, body){
			if (error || response.statusCode !== 200) {
				callback && callback(false);
			} else {
				html = body.split('row-2 even')[1].split(">");
				var name = html[2].split("<")[0];
				var runs = html[6].split('<')[0];
				domusLeader = {
					name: name,
					runs: runs
				}
				console.log(format("Domus Leader is :%s with %s HRs", name, runs));
				callback && callback(true);
			}
		});
	}

	function handleSentryLeader(data){
		var username = data.from;
		if (!sentryLeader || !sentryLeader.name || !sentryLeader.hits){
			sendMessage(username, "The Sentry leader is......");
			updateSentryLeader(function (status){
				if (status){
					sendSentryMessage();
				} else {
					sendMessage(username, "Sorry the website is being to slow:(");
				}
			});
		} else {
			sendSentryMessage();
		}

		function sendSentryMessage(){
			sendMessage(username, format("The Sentry leader is %s with %s singies",sentryLeader.name, sentryLeader.hits));
		};
	}

	function handleDomusLeader(data){
		var username = data.from;
		if (!domusLeader || !domusLeader.name || !domusLeader.runs){
			sendMessage(username, "The domus leader is......");
			updateDomusLeader(function (status){
				if (status){
					sendDomusMessage();
				} else {
					sendMessage(username, "Sorry the website is being to slow:(");
				}
			});
		} else {
			sendDomusMessage();
		}

		function sendDomusMessage(){
			sendMessage(username, format("The Domus leader is %s with %s HRs",domusLeader.name, domusLeader.runs));
		};
	}

	function handleFieldConditions(data){
		var username = data.from;
		var response = "";
		for (var i = 0; i < 4; i++){
			response = response + "WP" + (i +1) + ": " + fields[i] + "\n";
		}
		sendMessage(username, response);
	}

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