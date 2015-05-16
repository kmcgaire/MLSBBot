var http   = require('http');
var Router = require('node-simple-router');
var config = require('./config');


http.globalAgent.maxSockets = 30;

if (!config){
	console.error('You need the appropriate environment variables see README.md');
	process.exit();
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


var router = Router();

var db = require('./model/db')(config);

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


require('./api/message')(router, db);
require('./api/subscriptions')(router, db);
require('./api/games')(router, db);
require('./api/notifications')(router,db);

app.listen(process.env.PORT || 8888, function(){
	console.log('Listening on ' + (process.env.PORT || 8888));
});

module.exports = app;