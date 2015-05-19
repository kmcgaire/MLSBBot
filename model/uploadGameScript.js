var Games = require('./games.json');
var format = require('util').format;
var config = require('../config');
var db = require('./db')(config);

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

for(var i = 0; i < Games.length; i++){
	var game = Games[i].split(',');
	game[0] = game[0].substring(4).split('/');
	var month = game[0][0];
	var day = game[0][1];
	var Time = game[1].substring(0, game[1].length - 3);
	var HomeTeam = game[2].replace(/\'/g,"").toLowerCase().trim();
	var AwayTeam = game[3].replace(/\'/g,"").toLowerCase().trim();
	var Field = game[4];
	var message = "%s vs. %s, at %s - %s"
	message = format(message, HomeTeam.toProperCase(), AwayTeam.toProperCase(), Time, Field);
	var date = new Date(2015, month-1, day);
	db.addGame(HomeTeam, AwayTeam, date, Time, Field, function(e){});
}