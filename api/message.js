var format       = require('util').format

var Auth         = require('../lib/auth');
var utils        = require('../lib/utils');
var Auth         = require('../lib/auth');

var respond      = utils.respond;
var sendMessage  = utils.sendMessage;


var isCoreApiSignatureValid = Auth.isCoreApiSignatureValid;


module.exports = function (router, db){

	router.post('/message', function (req, res){
		//TODO authenticate
		respond(res, 200);
		var data = req.body;
		var message = data.body;
		isCoreApiSignatureValid(req.rawBody, req.headers['x-kik-signature']);
		if (data.type !== 'text'){
			sendMessage(username, 'I only know how to handle text :(');
			return;
		}
		if (data.body.substring(0,9).toLowerCase() === 'subscribe'){
			handleSubscribe(data);
		}
		if (data.body.substring(0,11).toLowerCase() === 'unsubscribe'){
			handleUnsubscribe(data);
		}
		return;
	});

	function handleUnsubscribe(data){
		var username = data.from;
		var message = data.body;
		var index = 10;
		if (message.indexOf(":") !== -1){
			index++;
		}
		var team = message.substring(index);
		db.removeSubscription(team, username, function (success){
			if (!success){
				sendMessage(data.from, format("You werent subscribed to %s. Ensure you are subscribed and you typed in the name correctly", team));
			} else {
				sendMessage(data.from, format("Successfully unsubscribed you to %s :(", team));
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
		db.addSubscription(team, username, function (success){
			if (!success){
				sendMessage(data.from, format("Couldn't add subscription for %s ensure you typed name in correctly", team));
			} else {
				sendMessage(data.from, format("Successfully subscribed you to %s, I will update you at 10am any day you play baseball!", team));
			}
		})
	}

	// 	if (isCoreApiSignatureValid(req.rawBody, req.headers['x-kik-signature'])) {
	// 		var messages = body.messages;
	// 		if (!(messages && Array.isArray(messages) && messages.length !== 0)) {
	// 			respond(res, 400, 'No Messages given');
	// 			return;
	// 		}
	// 		respond(res, 200);
	// 		messages.forEach(function (msg, index, array) {
	// 			if (msg.readReceiptRequested) {
	// 				sendReadReceipt(msg.from, msg.id);
	// 			}
	// 			var notMessages = ['is-typing', 'delivery-receipt', 'push-receipt'];
	// 			//Should we include read receipts?
	// 			if (notMessages.indexOf(msg.type) !== -1 || !msg.from){
	// 				return;
	// 			}
	// 			var username = msg.from.toLowerCase();
	// 			var userData = {
	// 				username  : username,
	// 				message   : msg.body,
	// 				firstChat : false
	// 			}

	// 			//TODO remove these logs for production??
	// 			console.log('/message called with');
	// 			console.log('id: ' + msg.id);
	// 			console.log('msg: ' + msg.body);
	// 			console.log('username: ' + username);
	// 			console.log('type:' + msg.type);
	// 			User.findOne({ username: username }, function (err, user) {
	// 				if (err || !user) {
	// 					user               = new User({username: username});
	// 					user.hasChatted    = true;
	// 					userData.firstChat = true;
	// 					user.save();
	// 					console.log('Creating new user: ' + username);
	// 				} else if (!user.hasChatted){
	// 					user.hasChatted    = true;
	// 					userData.firstChat = true;
	// 					user.save();
	// 				}
	// 				switch (msg.type){
	// 					case 'text':
	// 						if (WHITELIST.indexOf(msg.from) === -1){
	// 							sendMessage(username, 'Kik Points bot is still assembling its parts, come back soon!');
	// 						} else if (BLACKLIST.indexOf(msg.from) === -1){
	// 							messageGenerator(userData, function (data){
	// 								if (!data){
	// 									sendBrokenMessage(username);
	// 									return;
	// 								}
	// 								if (data.card){
	// 									sendCard(data.card.name, username, data.card.data);
	// 								}
	// 								if (data.message){
	// 									sendMessage(username, data.message);
	// 								}
	// 							})
	// 						}
	// 					break;
	// 				}
	// 			})
	// 		});
	// 	} else if (isAuthenticatedService(req.rawBody, req.headers['x-kik-points-bot-signature'])){
	// 		var msg = body;
	// 		if (!msg.username || !(msg.message || msg.content)) {
	// 			respond(res, 400, 'Incorrect data provided, need a username and either content or a message');
	// 		} else {
	// 			if (msg.content) {
	// 				sendCard('points', msg.username, msg.data);
	// 			}
	// 			if (msg.message) {
	// 				sendMessage(msg.username, msg.message);
	// 			}
	// 			respond(res, 200);
	// 		}
	// 	} else {
	// 		respond(res, 403);
	// 	}
	// });
}