module.exports = (function(){
	var config = {
		MLSB_API_SEND_URL : process.env.MLSB_API_SEND_URL,
		MLSB_API_TOKEN    : process.env.MLSB_API_TOKEN,
		MLSB_API_USERNAME : process.env.MLSB_API_USERNAME,
	};

	if (!config.MLSB_API_SEND_URL || !config.MLSB_API_TOKEN || !config.MLSB_API_USERNAME){
		return false;
	}

	if (process.env.SERVER_SOFTWARE === 'Production'){
		config.MONGODB_URL         = process.env.MONGODB_URL;
	} else {
		config.MONGODB_URL         = 'mongodb://localhost/MLSBBot';
	}
	if (process.env.NODE_ENV === 'test'){
		config.MONGODB_URL ='mongodb://localhost/MLSBBot-test'
	}

	return config;
})()
