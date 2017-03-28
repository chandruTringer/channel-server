// Setup basic express server

var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Constant values which are all used globally in other locations

var EMPTY_VALUE = "@EMPTY_VALUE";

// Connecting to mongodb

mongoose.connect('mongodb://localhost/users');

var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

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

io.on('connection', function (socket) {
  socket.on('addUser', function(data) {
    if(data){
      var userId = (data.userId) ? data.userId : EMPTY_VALUE;
      var socketId = (data.socketId) ? data.socketId : EMPTY_VALUE;
      var channelToken = (data.channelToken) ? data.channelToken : EMPTY_VALUE;

      User.findUserByUserId(userId,function(err, users){
        if(err){
          throw err;
        }
        if(users){
          // Authorized user
          var _query = {userId: userId};
          var _updatedContent = {
            userId: userId,
            channelToken: channelToken,
            socketId: socketId
          }
          User.updateUser(userId,_updatedContent)
        } else {
          // Error
          // Throw Unauthorized user error
        }
      })

    } else {
      // Error unable to add user
    }
  });
  socket.on('disconnect', function(data) {
    delete usersOnBoard[data.userId];
  });
  socket.on('sendMessage', function(data){
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
