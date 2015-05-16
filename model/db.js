var mysql = require('mysql');
var util  = require('util');



var createTeamsTable = "CREATE TABLE Teams (Team VARCHAR(100), PRIMARY KEY(Team))";
var createSubscriptionTable = "CREATE TABLE Subscriptions (Team VARCHAR(100),Username VARCHAR(100),PRIMARY KEY(Team, Username), FOREIGN KEY (Team) REFERENCES Teams(Team))";
var createGamesTable = "CREATE TABLE Games (HomeTeam VARCHAR(100),AwayTeam VARCHAR(100),Date DATETIME, Time VARCHAR(100), Field VARCHAR(100), PRIMARY KEY(HomeTeam, AwayTeam, Date), FOREIGN KEY (HomeTeam) REFERENCES Teams(Team), FOREIGN KEY (AwayTeam) REFERENCES Teams(Team))";

var dropTeamsTable = "DROP TABLE Teams";
var dropSubscriptionTable = "DROP TABLE Subscriptions";
var dropGamesTable = "DROP TABLE Games";

module.exports = function(config){

	var format = util.format;
	var connection = mysql.createConnection(config.MLSB_SQL_CONFIG);

	handleDisconnect();

	return {
		getGames           : getGames,
		addSubscription    : addSubscription,
		removeSubscription : removeSubscription,
		getSubscriptions   : getSubscriptions,
		addGame            : addGame,
		addTeam            : addTeam
	};

	function executeSQL(queryString, callback){
		var results = [];
		var err = false;
		console.log("EXECUTING SQL: " + queryString);
		connection.query(queryString).on('error', function(e){
			if (JSON.stringify(e).indexOf("ER_DUP_ENTRY") !== -1){
				err = true;
			}
			console.log(e);
		}).on('result', function (row){
			results.push(row);
		}).on('end', function (){
			if (err){
				callback && callback(false);
			} else {
				callback && callback(results);
			}
		});
	};

	function normalizeTeam(team){
		return team.replace(/\'/g,"").toLowerCase().trim();
	}

	function addTeam(team, callback){
		team = normalizeTeam(team);
		var queryString = format("INSERT INTO Teams (`Team`) Values(%s)", mysql.escape(team));
		executeSQL(queryString, callback);
	}

	function getSubscriptionsForDate(team, date, callback){
		team = normalizeTeam(team);
		date.setHours(0,0,0,0);
		var	queryString = format("SELECT * FROM Games inner join Subscriptions on Subscriptions.team=Games.HomeTeam or Subscriptions.team=Games.awayTeam WHERE Subscriptions.team=%s and date=%s",
							 mysql.escape(team), mysql.escape(date));
		executeSQL(queryString, callback);
	}

	function getSubscriptions(username, callback){
		var queryString = format("SELECT * FROM Subscriptions WHERE Subscriptions.username=%s",
								 mysql.escape(username));

		executeSQL(queryString, callback);
	}

	function removeSubscription(team, username, callback){
		team = normalizeTeam(team);;
		var queryString = format("DELETE FROM Subscriptions WHERE Subscriptions.Team=%s and Subscriptions.username=%s",
								mysql.escape(team), mysql.escape(username));

		executeSQL(queryString, callback);
	}

	function addSubscription(team, username, callback) {
		team = normalizeTeam(team);;
		var queryString = format("INSERT INTO Subscriptions (`Team`, `Username`) Values(%s ,%s)",
								mysql.escape(team), mysql.escape(username));

		executeSQL(queryString, callback);
	}


	function addGame(homeTeam, awayTeam, date, time, field, callback){
		homeTeam = normalizeTeam(homeTeam)
		homeTeam = normalizeTeam(awayTeam);
		date.setHours(0,0,0,0);
		if(['11:45', '12:45', '1:45'].indexOf(time) == -1){
			console.lerror(format('Invalid time %s for adding a game', time));
			callback && callback();
			return;			db.getGames(data.team, handleRes)

		}
		if(['WP1', 'WP2', 'WP3', 'WP4'].indexOf(field) == -1){
			console.error(format('Invalid field for adding a game'));
			callback && callback();
			return;
		}
		var queryString = format("INSERT INTO Games \
							(`HomeTeam`, `AwayTeam`, `Date`, `Time`, `Field`) Values(%s,%s,%s,%s,%s)",
							mysql.escape('kik'), mysql.escape('sportszone'),
							mysql.escape(new Date().setHours(0,0,0,0)),
							mysql.escape(time), mysql.escape(field));

		executeSQL(queryString, callback);
	}

	function getGames(team, callback){
		if (!callback){
			callback = team;
			team = null;
		}
		var queryString;
		if (team){
			team = normalizeTeam(team);;
			queryString = format("SELECT * FROM Games WHERE Games.HomeTeam = %s or Games.AwayTeam =%s",
					   	    mysql.escape(team),
					   	    mysql.escape(team));
		} else {
			queryString = "SELECT * FROM GAMES"
		}

		executeSQL(queryString, callback);

	}

	//stolen from the internets
	function handleDisconnect() {
		connection = mysql.createConnection(config.MLSB_SQL_CONFIG); // Recreate the connection, since
		                                          // the old one cannot be reused.

		connection.connect(function(err) {              // The server is either down
			if(err) {                                     // or restarting (takes a while sometimes).
				console.log('error when connecting to db:', err);
				setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
			}                                     // to avoid a hot loop, and to allow our node script to
		});                                     // process asynchronous requests in the meantime.
		                                  // If you're also serving http, display a 503 error.
		connection.on('error', function(err) {
			console.log('db error', err);
			if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
				console.log('handlingDisconnectAgain');
				handleDisconnect();                         // lost due to either server restart, or a
			} else {                                      // connnection idle timeout (the wait_timeout
				throw err;                                  // server variable configures this)
			}
		});
	}
}