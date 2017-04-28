var store = require('./store/fluxiRTCStore').appStore;
module.exports = class webRTCDataChannelStore{
  constructor(){
    // Data channel
    this.dataChannel = {};
    this.receiveChannel = {};
    this.dataChannelOptions = {
      ordered: true, // do not guarantee order
      maxRetransmits: 4 // retry attempts
    };

    // To avoid redundant msg through channel
    this.previousMessageToken = null;
  }

  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }

  /****************************************************************************
  * Data Channel functions
  ****************************************************************************/
  dataChannelCalls(pc, remoteUserId){
    var tempObj = this;
    var channelName = store.room.user.userId + "," + remoteUserId;
    tempObj.dataChannel[remoteUserId] = pc.createDataChannel("textMessages", tempObj.dataChannelOptions);
    tempObj.createDataChannelHandlers(tempObj.dataChannel[remoteUserId]);
  }
  createDataChannelHandlers(dataChannelTemp){
    var tempObj = this;
    dataChannelTemp.onerror = (function (error) {
      this.trace("Client", "Error", "Data Channnel error.");
    }).bind(this);
    dataChannelTemp.onmessage = (function (event) {
      var data = JSON.parse(event.data);
      this.trace("Client", "Message", "Data Channnel message");
      this.handleChannelMsg(event.data);

    }).bind(this);
    dataChannelTemp.onopen = (function (event) {
      this.trace("Client", "Message", "Data Channnel opened.");
    }).bind(this);
    dataChannelTemp.onclose = (function (event) {
      this.trace("Client", "Message", "Data Channnel closed.");
    }).bind(this);
  }
  handleChannelMsg(message) {
    var tempObj = this;
    tempObj.buildChatMsgs(message, "incoming");
  }
  composeDataChannelMsgs(message, to, command) {
    var tempObj = this;
    var msg = {};
    msg.userId = tempObj.room.user.userId;
    msg.userName = tempObj.room.user.firstName;
    msg.email = tempObj.room.user.email;
    msg.message = message;
    var date = new Date();
    msg.date = date;
    if(command){
      msg.command = command;
    }
    if (to !== "" || to === null) {
      msg.type = "personal";
    } else {
      msg.type = "all";
    }
    if (msg.type == "personal") {
      if(tempObj.room.user.connections[to].makeCall === true) {
        tempObj.dataChannel[to].send(JSON.stringify(msg));
      } else {
        tempObj.receiveChannel[to].send(JSON.stringify(msg));
      }
    } else {
      var key;
      for ( key in tempObj.dataChannel) {
        if(tempObj.room.user.connections[key].makeCall === true)
        tempObj.dataChannel[key].send(JSON.stringify(msg));
      }
      for ( key in tempObj.receiveChannel) {
        if(tempObj.room.user.connections[key].makeCall === false)
        tempObj.receiveChannel[key].send(JSON.stringify(msg));
      }
    }
    if(msg.command !== "ping"){
      tempObj.buildChatMsgs(JSON.stringify(msg), "outgoing");
    }
  }
  buildChatMsgs(msg, type) {
    var tempObj = this;

    // Creating and setting an custom event
    document.removeEventListener("afterTextMessage", tempObj.afterTextMessage);
    document.addEventListener("afterTextMessage", tempObj.afterTextMessage);
    var afterTextMessage = new CustomEvent("afterTextMessage", {
      detail: {
        message: msg,
        type: type
      }
    });
    document.dispatchEvent(afterTextMessage);
  }
}
