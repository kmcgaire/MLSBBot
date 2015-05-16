var crypto = require('crypto');
var config = require('../config');


module.exports = (function(){
	var auth = {
		isCoreApiSignatureValid : isCoreApiSignatureValid
	}
	return auth;

	function isCoreApiSignatureValid(body, signature) {
		console.log(body);
		if (!signature){
			return false;
		}

		var signatureToLowerCase = signature.toLowerCase();
		var expected = crypto.createHmac('sha1', config.MLSB_API_TOKEN).update(new Buffer(body, 'utf-8')).digest('hex').toLowerCase();

		if (expected !== signatureToLowerCase) {
			console.log('expected: ' + expected + ', actual: ' + signatureToLowerCase);
		}
		return expected === signatureToLowerCase;
	}
})()

