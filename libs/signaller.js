var store = require('./store/fluxiRTCStore').appStore;
var dispatcher = require('./fluxiRTCDispatcher');
module.exports = class signaller{
  constructor(){
    // For starting WebRTC functions both these have to be true
    this.channelReady = false;

    // Channel storage
    this.socket = null;
  }
  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }
  _openChannel(channelToken) {
    var tempObj = this;
    var socket = io('/');
    socket.on('connect', function(){
      tempObj.onChannelOpened.call(tempObj);
      socket.emit('addUser',{
        userId: store.room.user.userId,
        socketId: socket.id,
        channelToken: channelToken
      });
      socket.on('message', function(message){
        tempObj.onChannelMessage.call(tempObj, message);
      });
    });
    socket.close = function(){
      socket.emit('removeUser',{
        userId: store.room.user.userId
      });
      tempObj.socket = null;
    };
    tempObj.socket = socket;
  }
  onChannelMessage (message) {
    var tempObj = this;
    dispatcher.dispatch(message);
  }
  sendMessage(message) {
    var tempObj = this;
    console.log("Sent :", message);
    tempObj.socket.emit('sendMessage',{
      sendTo: message.sendTo,
      message: message
    });
  }
  onChannelOpened() {
    var tempObj = this;
    var media = fluxiRTC.media;
    var hasPreviousConnection = store.room.user.previousConnectionsDetail;
    tempObj.channelReady = true;
    tempObj.trace("Server", "Message", "Channel Opened for signalling.");

    if(
      tempObj.channelReady &&
      media.mediaReady &&
      !store.room.user.agent &&
      !store.room.user.waiting) {
        tempObj.sendMessage({
          type: "inRoom",
          userId: store.room.user.userId,
          firstName: store.room.user.firstName,
          lastname: store.room.user.lastName,
          email: store.room.user.email,
          sendTo: store.room.hostId
        });
        tempObj.trace("Client", "Message", "In room message sent.");
      } else if(
        !store.room.user.agent &&
        store.room.user.waiting){
          fluxiRTC.showWaitingStatus({
            userId: store.room.roomId,
            firstName: store.room.roomName
          }, fluxiRTC);
        }

        if(hasPreviousConnection){
          var hasCustomer = (store.room.user.previousConnectionsDetail.sendTo);
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
        document.removeEventListener("afterOpeningChannel", fluxiRTC.eventHandlrs.afterOpeningChannel);
        document.addEventListener("afterOpeningChannel", fluxiRTC.eventHandlrs.afterOpeningChannel);
        var afterOpeningChannel = new CustomEvent("afterOpeningChannel", {
          detail: {
            channelReady: true
          }
        });
        document.dispatchEvent(afterOpeningChannel);

      }
    }
