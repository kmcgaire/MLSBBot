var http   = require('http');
var Router = require('node-simple-router');
var config = require('./config');

console.log('hello');

http.globalAgent.maxSockets = 30;

if (!config){
	console.error('You need the appropriate environment variables see README.md');
	process.exit();
}


var router = Router();

//require('./model/db')(config);

var app = http.createServer(function (req, res) {
	var chunks = [];
	req.on('data', function (chunk) {
		chunks.push(chunk);
	});
	req.on('end', function () {
		req.rawBody = chunks.join('');
	});
	return router.apply(this, arguments);
});


require('./api/message')(router);

app.listen(process.env.PORT || 8888, function(){
	console.log('Listening on ' + (process.env.PORT || 8888));
});

module.exports = app;