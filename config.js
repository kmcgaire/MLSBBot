module.exports = (function(){
	var config = {
		MLSB_API_SEND_URL : process.env.MLSB_API_SEND_URL,
		MLSB_API_TOKEN    : process.env.MLSB_API_TOKEN,
		MLSB_API_USERNAME : process.env.MLSB_API_USERNAME,
		MLSB_SQL_HOST : process.env.MLSB_SQL_HOST,
		MLSB_SQL_USER : process.env.MLSB_SQL_USER,
		MLSB_SQL_PASSWORD : process.env.MLSB_SQL_PASSWORD,
		MLSB_SQL_DATABASE : process.env.MLSB_SQL_DATABASE
	};

	for(var key in config){
		if (!config[key]){
			return false
		}
	}

	return config;
})()
