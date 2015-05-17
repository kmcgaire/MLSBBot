var utils  = require('../lib/utils');
var format = require('util').format

var respond      = utils.respond;
var sendMessage  = utils.sendMessage;

module.exports = function(router,
		 db){

	//TODO remove
	router.post('/notifications', function (req,res){
		notifySubscribers();
		respond(res, 200);
	});

	var millisecondInDay = 60*60*24*1000;
	var now = new Date();
	var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
	if (millisTill10 < 0) {
	     millisTill10 += millisecondInDay; // it's after 10am, try 10am tomorrow.
	}

	setReminders();

	function setReminders(){
		console.log('Setting reminders for ' + new Date(now.getTime() + millisTill10));
		setTimeout(function(){
			notifySubscribers();
			setInterval(function(){
				notifySubscribers();
			}, millisecondInDay);
		}, millisTill10);
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
				var message = "Good morning! You have a game today: \n\n %s vs. %s, at %s - %s \n\n Best of luck!"
				message = format(message, game.HomeTeam.toProperCase(), game.AwayTeam.toProperCase(), game.Time, game.Field);
				sendMessage(game.Username, message);
			}
		});
	}
};
