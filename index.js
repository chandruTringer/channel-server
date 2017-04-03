// Setup basic express server

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


var mongoose = require('mongoose');
var User = require('./models/user.js');


// Constant values which are all used globally in other locations

var EMPTY_VALUE = "@EMPTY_VALUE";
var USER = 'root';
var PASS = 'high5';
var HOST = '104.155.137.246';
var PORT = '27017';

var URI = `mongodb://${USER}:${PASS}@${HOST}:${PORT}`;

// Connecting to mongodb

var connection = mongoose.connect(`${URI}/admin`);

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
          };
          console.log(_updatedContent);
          User.updateUser(_query,_updatedContent,{},function(err, successResponse){
            if(err) throw err;
            console.log("successResponse", successResponse);
          });
        } else {
          // Error
          // Throw Unauthorized user error
        }
      });

    } else {
      // Error unable to add user
    }
  });
  socket.on('disconnect', function(data) {
    // delete usersOnBoard[data.userId];
  });
  socket.on('sendMessage', function(data){
    User.findUserByUserId(data.sendTo, function(user){
      console.log(user[0].sessionId);
      var sendTo = user[0].sessionId;
      var message = data.message;
      if(sendTo){
        console.log(sendTo);
        socket.broadcast.to(sendTo).emit('message', message);
      } else {
        console.log("Unknow user id");
      }
    })
  });
});
