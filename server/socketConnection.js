var User = require('../models/user');
var Request = require('request');
var EMPTY_VALUE = "@EMPTY_VALUE";
var APP_SERVER = "https://update6-dot-icrdemo-1327.appspot.com/_ah/api/channelservice/v1/channel"
var CONNECTION_STATE = (state, userId) => `/${state}/${userId}`;

module.exports = function (socket) {
  socket.on('disconnect',function(data){
    var _this = this;
    var socketId = _this.id;
    User.findUserIdBySocketId(socketId, function(err, user){
      if(err) throw err;
      if(user.length > 0){
        console.log("IN SOCKET DISCONNECTION",user[0].userId);
        user = user[0];
        var userId = user.userId;
        if(userId){
          var url = APP_SERVER+CONNECTION_STATE('disconnect', userId);
          console.log(url);
          Request.get(url)
            .on('response', function(response){
              console.log("DISCONNECTED",response.statusCode);
              User.removeUserByUserId(userId, function(err, success){
                if(err){
                  console.log("Exception: In Removing User");
                  throw err;
                }
                if(success){
                  console.log("Message: Deleted "+ userId);
                }
              });
            });
        } else {
          console.log("Unknow user id");
        }
      } else {
        console.log("Throw unknown user error");
      }
    });
  });
  socket.on('addUser', function(data, resolve) {
    if(data){
      var userId = (data.userId) ? data.userId : EMPTY_VALUE;
      var socketId = (data.socketId) ? data.socketId : EMPTY_VALUE;
      var channelToken = (data.channelToken) ? data.channelToken : EMPTY_VALUE;
      var url = APP_SERVER+CONNECTION_STATE('connect', userId);
      console.log(url);
      Request.get(url)
        .on('response', function(response){
          console.log("CONNECTED",response.statusCode);
        });
      User.findUserByUserId(userId,function(err, users){
        if(err){
          throw err;
        }
        if(users){
          // Authorized user
          var _updatedContent = {
            userId: userId,
            channelToken: channelToken,
            socketId: socketId
          };
          User.updateUser(userId,_updatedContent,{},function(err, successResponse){
            if(err) throw err;
            console.log(err);
            if(successResponse){
              console.log("Update User socketId: "+_updatedContent.socketId);
              resolve();
            }
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
  socket.on('removeUser', function(data,value) {
    console.log("DATA",data);
    var userId = (data.userId) ? data.userId : EMPTY_VALUE;
    var url = APP_SERVER+CONNECTION_STATE('disconnect', userId);
    console.log(url);
    if(userId !== EMPTY_VALUE){
      User.removeUserByUserId(userId, function(err, successResponse){
        if(err) throw err;
        if(successResponse){
          // console.log(successResponse);
          socket.disconnect();
          console.log("User Removed Successfully: "+userId);
        }
      });
      Request.get(url)
      .on('response', function(response){
        console.log("CONNECTED", response.statusCode);
      });
    }
  });
  socket.on('sendMessage', function(data){
    User.findUserByUserId(data.sendTo, function(err, user){
      if(err) throw err;
      if(user.length > 0){
        var sendTo = user[0].socketId;
        var message = data.message;
        console.log("IN SEND MESSAGE",
            "Sending To: "+user[0].userId, 
            "Sent By: "+message.userId,
            "Type :"+message.type);
        if(sendTo){
          socket.broadcast.to(sendTo).emit('message', message);
        } else {
          console.log("Unknow user id");
        }
      } else {
        console.log("Throw unknown user error");
      }
    });
  });
};
