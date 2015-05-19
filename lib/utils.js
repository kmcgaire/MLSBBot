var request = require('request');
var config  = require('../config')
var format = require('util').format;

module.exports = (function(){
	var utils = {
		sendMessage : sendMessage,
		mlsbCard    : mlsbCard,
		respond     : respond,
		dateString  : dateString
	};

	return utils;

	function respond(res, code, message) {
		res.writeHead(code);
		res.end(message);
	}

	function dateString(date){
		var str = date.toString();
		str = str.split(' ');
		return format("%s %s %s", str[0], str[1], str[2]);
	}


	function sendMessage(username, msg, callback){
		console.log(format('Sending message to %s with message: %s', username, msg));
		var message = [{
			type      : 'text',
			to        : username,
			body      : msg,
			delay     : 500,
			typeTime  : 1000
		}];
		var options = {
			uri     : config.MLSB_API_SEND_URL,
			body    : { 'messages': message },
			json    : true,
			method  : 'POST',
			headers: {
				'Authorization': 'Basic ' + new Buffer(config.MLSB_API_USERNAME + ':' + config.MLSB_API_TOKEN).toString('base64')
			}
		};

		request(options, function (error, response, body){
			if (error) {
				callback && callback();
				console.error(String(error));
				return;
			}

			var status = response.statusCode;
			callback && callback(status);

			if (status !== 200){
				console.error('Responded with an unknown statusCode: ' + status);
			}
		})
	}

	function mlsbCard(username, data){
		return {
			type      : 'kik-optimized-web',
			to        : username,
			title     : 'MLSB',
			text      : 'Go to MLSB site',
			appName   : 'MLSB',
			url       : 'https://mlsb.ca',
			//picUrl    : 'https://mlsb.ca/img/about-logo.png',
			//iconUrl   : 'https://mlsb.ca/img/icon-square.png',
			big       : true,
			noForward : true,
			extras    : {
				"open-popup" : true
			},
			data      : data || {}
		}
	}
})()
