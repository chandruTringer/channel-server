var User = require('../models/user');
module.exports = function (socket) {
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
          var _updatedContent = {
            userId: userId,
            channelToken: channelToken,
            socketId: socketId
          };
          console.log(_updatedContent);
          User.updateUser(userId,_updatedContent,{},function(err, successResponse){
            if(err) throw err;
            if(successResponse){
              console.log("Throw entity not get updated Exception");
              console.log("successResponse", successResponse);
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
  socket.on('disconnect', function(data) {
    // delete usersOnBoard[data.userId];
  });
  socket.on('sendMessage', function(data){
    User.findUserByUserId(data.sendTo, function(err, user){
      if(err) throw err;
      if(user.lenght > 0){
        console.log(user);
        console.log(user[0].sessionId);
        var sendTo = user[0].sessionId;
        var message = data.message;
        if(sendTo){
          console.log(sendTo);
          socket.broadcast.to(sendTo).emit('message', message);
        } else {
          console.log("Unknow user id");
        }
      } else {
        // Throw unknown user error
        console.log("Throw unknown user error");
      }
    });
  });
};
