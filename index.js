// Setup basic express server
var fs = require('fs');
var auth = require('http-auth');
var https = require('https');
var express = require('express');
var socketIO = require('socket.io');
var socketConnection = require('./server/socketConnection');

// Authentication module.
var basic = auth.basic({
	realm: "tringapps Inc.",
	file: __dirname + "/htpasswd"
});

// Setup basic express server

var app = express();
var options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
};
// Application setup.
app.use(auth.connect(basic));
var server = https.createServer(options, app);
var io = socketIO(server);

var port = 443;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var User = require('./models/user.js');


// Routing
app.use(express.static(__dirname + '/public'));

app.get('/_api/user/create/:_id', ( request, response ) => {
  var id = request.params._id;
  console.log(id);
  User.addUser({userId : id}, (err, successResponse) => {
    console.log(err);
		if(err){
			throw err;
		}
		response.json(successResponse);
	});
});

io.on('connection', socketConnection);
