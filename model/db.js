var mysql      = require('mysql');

module.exports = function(config){
	var connection = mysql.createConnection({
		host     : config.MLSB_SQL_HOST,
		user     : config.MLSB_SQL_USER,
		password : config.MLSB_SQL_PASSWORD,
		database : config.MLSB_SQL_DATABASE
	});

	return connection;
}