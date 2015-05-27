var utils  = require('../lib/utils');
var format = require('util').format

var respond      = utils.respond;
var sendMessage  = utils.sendMessage;

module.exports = function(router,
		 db){

	// router.post('/notifications', function (req,res){
	// 	notifySubscribers(function(){});
	// 	respond(res, 200);
	// });

	var millisecondInDay = 60*60*24*1000;
	var now = new Date();
	var millisTill745 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 45, 0, 0) - now;
	if (millisTill745 < 0) {
	     millisTill745 += millisecondInDay; // it's after 7:45am, try 7:45 tomorrow.
	}

	setReminders();

	function setReminders(){
		console.log('Setting reminders for ' + new Date(now.getTime() + millisTill745));
		setTimeout(function(){
			notifySubscribers();
			setInterval(function(){
				console.log('Setting reminders for ' + new Date(now.getTime() + millisecondInDay));
				notifySubscribers();
			}, millisecondInDay);
		}, millisTill745);
	}



	function notifySubscribers(callback){
		db.getSubscriptionsForDate(new Date(), function(data){
			if (!data || data.err || !data.results || data.results.length === 0){
				callback && callback(false);
				return;
			}
			for (var i = 0; i < data.results.length; i++){
				console.log(data.results[i]);
				var game = data.results[i];
				var message = "Good morning! You have a game today:\n\n%s vs. %s, at %s - %s \n\nBest of luck!"
				message = format(message, game.HomeTeam.toProperCase(), game.AwayTeam.toProperCase(), game.Time, game.Field);
				sendMessage(game.Username, message);
			}
		});
	}
};
