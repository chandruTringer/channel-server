// Setup basic express server

var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Connecting to mongodb

mongoose.connect('mongodb://localhost/users');

var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

app.get('/api/user/create/:_id', ( request, response ) => {
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

// io.on('connection', function (socket) {
//   socket.on('addUser', function(data) {
//     usersOnBoard[data.userId] = data.socketId;
//   });
//   socket.on('disconnect', function(data) {
//     delete usersOnBoard[data.userId];
//   });
//   socket.on('sendMessage', function(data){
//     var sendTo = usersOnBoard[data.sendTo];
//     var message = data.message;
//     if(sendTo){
//       console.log(sendTo);
//       socket.broadcast.to(sendTo).emit('message', message);
//     } else {
//       console.log("Unknow user id");
//     }
//   });
// });
