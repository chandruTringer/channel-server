// Authentication module.
var auth = require('http-auth');
// var express = require('express');
var basic = auth.basic({
	realm: "Simon Area.",
	file: __dirname + "/htpasswd"
});


// Setup basic express server

var fs = require('fs');
var https = require('https');
var express = require('express');
var socketIO = require('socket.io');
var app = express();
var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};
// Application setup.
var app = express();
app.use(auth.connect(basic));
var server = https.createServer(options, app);
var io = socketIO(server);

var port = 443;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


var usersOnBoard = {};

io.on('connection', function (socket) {
  socket.on('addUser', function(data) {
    usersOnBoard[data.userId] = data.socketId;
    console.log(usersOnBoard);
  });
  socket.on('sendMessage', function(data){
    console.log(data);
    var sendTo = usersOnBoard[data.sendTo];
    var message = data.message;
    if(sendTo){
      console.log(sendTo);
      socket.broadcast.to(sendTo).emit('message', message);
    } else {
      console.log("Unknow user id");
    }
		socket.on('disconnect', function(data) {
			console.log(usersOnBoard[data.userId]);
			delete usersOnBoard[data.userId];
		});
		socket.on('error', function (err) {
			console.log("Socket.IO Error");
			console.log(err.stack);
		});
  });
});
