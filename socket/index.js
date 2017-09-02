const User = require('../models/user');
const Request = require('request');
const moment = require('moment');
const now = () => moment().utcOffset(330).format();

const EMPTY_VALUE = "@EMPTY_VALUE";
const APP_SERVER = "https://test-p1-dot-tring-handl.appspot.com/handlr/v1/channel/";
const CONNECTION_STATE = 
  (state, smbId, channelToken) => `notification/${smbId}/${channelToken}/${state}`;

const makeDisconnectRequest = (userId, channelToken) => {
  let url = APP_SERVER+CONNECTION_STATE('disconnect', userId, channelToken);
    console.log(now()+" : Disconnected : userId "+userId+" : channelToken : "+channelToken);
    Request.get(url)
      .on('response', function(response){
        console.log(now()+" : DISCONNECTED", response.statusCode);
      });
};

const makeConnectRequest = (userId, channelToken) => {
  let url = APP_SERVER+CONNECTION_STATE('connect', userId, channelToken);
    console.log(now()+" : Connected : userId "+userId+" : channelToken : "+channelToken);
      Request.get(url)
        .on('response', function(response){
          console.log(now()+" : CONNECTED",response.statusCode);
        });
};

const onDisconnect = (data, socket) => {
  var _this = this;
  var socketId = socket.id;
  console.log("socketId", socket.id);
  User.updateUserBySocketId(socketId,{active: false},{"returnNewDocument": true})
    .subscribe(
      (successResponse) => {
        if(successResponse){
          console.log(now()+" : Updated User status: "+successResponse.channelToken);
          makeDisconnectRequest(successResponse.userId, successResponse.channelToken);
        }
      },
      (err) => console.log(err)
    );
};

// onAddUser Handler will be called during initial 
// Connection Establishment and during the refresh scenarios
const onAddUser = (data, socket, resolve) => {
  if(data){
    console.log(data);
    var { 
      userId = EMPTY_VALUE, 
      socketId = EMPTY_VALUE, 
      channelToken = EMPTY_VALUE, 
      room = EMPTY_VALUE
    } = data;
    makeConnectRequest(userId, channelToken);

    // Read Operation to check the users credibility
    User.findUserByChannelToken(channelToken)
      .subscribe(
        (user) => {
            if(user){
                // Authorized user
                var _updatedConent = { userId, socketId, channelToken, active: true }
                console.log("Authorized User: "+userId);
                // Updating the users socketId
                User.updateUser(channelToken,_updatedConent,{"returnNewDocument": true})
                  .subscribe(
                    (successResponse) => {
                      if(successResponse){
                        console.log(now()+" : Updated User socketId: "+successResponse.socketId);
                        if(room !== EMPTY_VALUE) socket.join(room);
                        if(resolve) resolve(successResponse);
                      }
                    },
                    (err) => console.log(err)
                  );
            } else {
              console.log("Unauthorized User: "+userId);
            }
        }
      );

  } else {
    console.log("No Data Found! Unable to add the user");
  }
};


module.exports = function (socket) {
  var _socket = socket;
  socket.on('disconnect', function(data){
    onDisconnect(data, _socket);
  });
  socket.on('addUser', function(data, resolve){
    onAddUser(data, _socket, resolve);
  });
};
