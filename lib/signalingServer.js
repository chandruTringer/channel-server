/****************************************************************************
* Channel functions
****************************************************************************/
//sending signal to other users
Rtc.prototype.sendMessage = function(message) {
    var tempObj = this;
    console.log("Sent :", message);
    tempObj.socket.emit('sendMessage',{
      sendTo: message.sendTo,
      message: message
    });
};


Rtc.prototype._openChannel = function(channelToken) {

      var tempObj = this;
      var socket = io('/');
      socket.on('connect', function(){
        tempObj.onChannelOpened.call(tempObj);
        socket.emit('addUser',{
          userId: tempObj.room.user.userId,
          socketId: socket.id,
          channelToken: channelToken
        });
        socket.on('message', function(message){
          tempObj.onChannelMessage.call(tempObj,message);
        });
      });
      socket.close = function(){
        tempObj.socket = null;
      };
      tempObj.socket = socket;
};

Rtc.prototype.onChannelOpened = function() {
      var tempObj = this;
      var hasPreviousConnection = tempObj.room.user.previousConnectionsDetail;
      tempObj.channelReady = true;
      tempObj.trace("Server", "Message", "Channel Opened for signalling.");

      if(
        tempObj.channelReady &&
        tempObj.mediaReady &&
        !tempObj.room.user.agent &&
        !tempObj.room.user.waiting) {
            tempObj.sendMessage({
                  type: "inRoom",
                  userId: tempObj.room.user.userId,
                  firstName: tempObj.room.user.firstName,
                  lastname: tempObj.room.user.lastName,
                  email: tempObj.room.user.email,
                  sendTo: tempObj.room.hostId
            });
            tempObj.trace("Client", "Message", "In room message sent.");
      } else if(
        !tempObj.room.user.agent &&
        tempObj.room.user.waiting){
          tempObj.showWaitingStatus({
            userId: tempObj.room.roomId,
            firstName: tempObj.room.roomName
          }, tempObj);
      }

      if(hasPreviousConnection){
        var hasCustomer = (tempObj.room.user.previousConnectionsDetail.sendTo);
        if(hasCustomer){
          tempObj.sendMessage(hasPreviousConnection);
        }
        tempObj.sendMessage({
          type: "terminate",
          sendTo: hasPreviousConnection.agentId,
          info: "Your session has been carried over in some other device. we are closing your current session over here"
        });
      }

      // Creating and setting an custom event
      document.removeEventListener("afterOpeningChannel", tempObj.afterOpeningChannel);
      document.addEventListener("afterOpeningChannel", tempObj.afterOpeningChannel);
      var afterOpeningChannel = new CustomEvent("afterOpeningChannel", {
            detail: {
                  channelReady: true
            }
      });
      document.dispatchEvent(afterOpeningChannel);

};

Rtc.prototype.onChannelMessage = function(message) {
      var tempObj = this;
      if( message.type === "candidate" ){
        window.candidateCount += 1;
      }
      tempObj.handleMessage(message);
      // console.log(message);
};

Rtc.prototype.onChannelError = function() {
      var tempObj = this;
      tempObj.trace("Server", "Error", "Channel error.");
};

Rtc.prototype.onChannelClosed = function() {
      var tempObj = this;
      tempObj.trace("Server", "Error", "Channel closed.");
};
