// Setup basic express server

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

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
  socket.on('disconnect', function(data) {
    console.log(usersOnBoard[data.userId]);
    delete usersOnBoard[data.userId];
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
  });
});
