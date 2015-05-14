var Auth         = require('../lib/auth');
var config       = require('../config');
var respond      = require('../lib/utils').respond;


var isAuthenticatedService  = Auth.isAuthenticatedService;
var isCoreApiSignatureValid = Auth.isCoreApiSignatureValid;


module.exports = function (router){


	var WHITELIST = [
		'kmcgaire',
	]

	router.post('/message', function (req, res){
		var body =  JSON.parse(req.rawBody);
		console.log(req.headers);
		return;
	});
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