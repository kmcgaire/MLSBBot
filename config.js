module.exports = (function(){
	var config = {
		MLSB_API_SEND_URL : process.env.MLSB_API_SEND_URL,
		MLSB_API_TOKEN    : process.env.MLSB_API_TOKEN,
		MLSB_API_USERNAME : process.env.MLSB_API_USERNAME,
		MLSB_SQL_CONFIG : {
			host : process.env.MLSB_SQL_HOST,
			user : process.env.MLSB_SQL_USER,
			password : process.env.MLSB_SQL_PASSWORD,
			database : process.env.MLSB_SQL_DATABASE
		}
	};

	for(var key in config){
		if (!config[key]){
			return false
		}
	}

	return config;
})()
