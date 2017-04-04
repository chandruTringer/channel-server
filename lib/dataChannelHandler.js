/****************************************************************************
* Data Channel functions
****************************************************************************/
Rtc.prototype.dataChannelCalls = function(pc, remoteUserId) {
      var tempObj = this;
      var channelName = tempObj.room.user.userId + "," + remoteUserId;
      tempObj.dataChannel[remoteUserId] = tempObj.peerConnection.createDataChannel("textMessages", tempObj.dataChannelOptions);
      tempObj.createDataChannelHandlers(tempObj.dataChannel[remoteUserId]);
};


Rtc.prototype.createDataChannelHandlers = function(dataChannelTemp) {
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
};

Rtc.prototype.handleChannelMsg = function(message) {
      var tempObj = this;
      tempObj.buildChatMsgs(message, "incoming");
};

Rtc.prototype.composeDataChannelMsgs = function(message, to, command) {
        // if((message.match(/\n/g)).length > 0){
        //     return;
        // }
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
};

Rtc.prototype.buildChatMsgs = function(msg, type) {
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
};
