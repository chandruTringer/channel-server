module.exports = {
  handleInRoom: function handleInRoom(tempMsg){
    var storeRoom = this.appStore.room;
    var currentCaller  = storeRoom.user;
    var isAgent = currentCaller.agent;
    var isFirstCaller = currentCaller.isFirstCaller;
    var isBusy = !  !currentCaller.isBusyWith;
    var messageFromCurrentPeer = (currentCaller.isBusyWith === tempMsg.userId);
    var isCallAccepted = (isAgent && !isBusy) || (isAgent && messageFromCurrentPeer);

    if( isAgent && isFirstCaller ){
      showIncomingCaller(tempMsg,fluxiRTC);
      currentCaller.isFirstCaller = false;
    } else if(isCallAccepted){
      fluxiRTC.afterCallAccepted(tempMsg);
    } else if(storeRoom.user.agent){
      // Keep in wait
      fluxiRTC.afterCallDeclined(tempMsg);
    } else{
      console.log("Discarding incoming call from other users");
    }
  },
  handleReconnect: function handleReconnect(tempMsg){
    var storeRoom = this.appStore.room;
    if(tempMsg.userId){
      var videoDomSelector = "div-"+tempMsg.userId;
      try{
        videoDom = document.getElementById(videoDomSelector);
        videoDom.parentNode.removeChild(videoDom);
        // storeRoom.connections = {};
      }catch(e){
        console.log(e.stack);
      }
      window.OverlayObject && OverlayObject.hideOverlay();
    }
    if(storeRoom.user.agent){
      storeRoom.user.isBusyWith = null;
      fluxiRTC.afterCallAccepted(tempMsg);
    } else {
      fluxiRTC.signaller.sendMessage({
        type: "inRoom",
        userId: storeRoom.user.userId,
        firstName: storeRoom.user.firstName,
        lastname: storeRoom.user.lastName,
        email: storeRoom.user.email,
        sendTo: tempMsg.userId,
        command: "reconnect"
      });
    }
  },
  handleWait: function handleWait(tempMsg){
    var tempObj = this;
    var storeRoom = tempObj.room;
    if(tempMsg.previousAgentId){
      var videoDomSelector = "div-"+tempMsg.previousAgentId;
      try{
        videoDom = document.getElementById(videoDomSelector);
        videoDom.parentNode.removeChild(videoDom);
        storeRoom.connections = {};
      }catch(e){
        console.log(e.stack);
      }
      window.OverlayObject && OverlayObject.hideOverlay();
    }
    fluxiRTC.showWaitingStatus(tempMsg, fluxiRTC);
    trace("Client", "Message","Waiting for agent: "+tempMsg.firstName);
  },
  handleOffer: function handleOffer(tempMsg){
    var tempObj = this;
    var storeRoom = tempObj.appStore.room;
    if(document.getElementsByClassName("material-dialog").length > 0){
      document.getElementsByClassName("material-dialog")[0].style.display = "none";
    }
    storeRoom.user.callStage++; // Moving to offer received stage
    trace("Client", "Message", ("Offer from user: " + tempMsg.userId));
    fluxiRTC.webRTC.createPeerConnection(tempMsg, "answer");
    storeRoom.user.connections[tempMsg.userId].peerConnection.ondatachannel = function(event) {
      fluxiRTC.webRTCDataChannel.receiveChannel[tempMsg.userId] = event.channel;
      fluxiRTC.webRTCDataChannel.createDataChannelHandlers(fluxiRTC.webRTCDataChannel.receiveChannel[tempMsg.userId]);
    };
    fluxiRTC.webRTC.setRemote(tempMsg.description, tempMsg.userId);
    fluxiRTC.webRTC.doAnswerTo(tempMsg.userId);
    storeRoom.user.connections[tempMsg.userId].callAttendTime = new Date();
    storeRoom.user.isBusyWith = tempMsg.userId;
    storeRoom.user.callStage++; // Moving to answer sent stage

    // Creating and setting an custom event
    document.removeEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
    document.addEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
    var afterReceivingOffer = new CustomEvent("afterReceivingOffer", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        currentConnections: storeRoom.user.connections
      }
    });
    document.dispatchEvent(afterReceivingOffer);
    window.OverlayObject && OverlayObject.hideOverlay();
  },
  handleAnswer: function handleAnswer(tempMsg){
    var storeRoom = this.appStore.room;
    storeRoom.user.callStage++;
    trace("Client", "Message", ("Answer from user: " + tempMsg.userId));
    fluxiRTC.webRTC.setRemote(tempMsg.description, tempMsg.userId);
    storeRoom.user.connections[tempMsg.userId].connected = true;
    storeRoom.user.connections[tempMsg.userId].callAttendTime = new Date();

    // Creating and setting an custom event
    document.removeEventListener("afterReceivingAnswer", fluxiRTC.eventHandlrs.afterReceivingAnswer);
    document.addEventListener("afterReceivingAnswer", fluxiRTC.eventHandlrs.afterReceivingAnswer);
    var afterReceivingAnswer = new CustomEvent("afterReceivingAnswer", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        currentConnections: storeRoom.user.connections
      }
    });
    document.dispatchEvent(afterReceivingAnswer);
    window.OverlayObject && OverlayObject.hideOverlay();
  },
  handleCandidate: function handleCandidate(tempMsg){
    var _this = this;
    var appStore = _this.appStore;
    var storeRoom = appStore.room;
    if(typeof storeRoom.user.connections[tempMsg.userId] == 'undefined') {
        storeRoom.user.connections[tempMsg.userId] = {};
    };
    if(typeof storeRoom.user.connections[tempMsg.userId].answered == 'undefined') {
          storeRoom.user.connections[tempMsg.userId].answered = false;
    };
    if((storeRoom.user.connections[tempMsg.userId].peerConnection) && (storeRoom.user.connections[tempMsg.userId].answered == true)) {
          var candidate = new RTCIceCandidate({
                sdpMLineIndex : tempMsg.label,
                candidate : tempMsg.candidate
          });
          storeRoom.user.connections[tempMsg.userId].peerConnection.addIceCandidate(candidate);
    } else {
          if(!storeRoom.user.connections[tempMsg.userId].candidatesReceived) {
                storeRoom.user.connections[tempMsg.userId].candidatesReceived = [];
          }
          storeRoom.user.connections[tempMsg.userId].candidatesReceived.push(tempMsg);
    };
  },

  handleAudioToggle: function handleAudioToggle(tempMsg){
    // Creating and setting an custom event
    var storeRoom = this.appStore.room;
    document.removeEventListener("afterAudioToggle", fluxiRTC.eventHandlrs.afterAudioToggle);
    document.addEventListener("afterAudioToggle", fluxiRTC.eventHandlrs.afterAudioToggle);
    var afterAudioToggle = new CustomEvent("afterAudioToggle", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[userId].firstName,
        callAttendTime: storeRoom.user.connections[userId].callAttendTime,
        state: tempMsg.state
      }
    });
    document.dispatchEvent(afterAudioToggle);
  },
  handleVideoToggle: function handleVideoToggle(tempMsg){
    // Creating and setting an custom event
    var storeRoom = this.appStore.room;
    document.removeEventListener("afterVideoToggle", fluxiRTC.eventHandlrs.afterVideoToggle);
    document.addEventListener("afterVideoToggle", fluxiRTC.eventHandlrs.afterVideoToggle);
    var afterVideoToggle = new CustomEvent("afterVideoToggle", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        callAttendTime: storeRoom.user.connections[tempMsg.userId].callAttendTime,
        state: tempMsg.state
      }
    });
    document.dispatchEvent(afterVideoToggle);
  },
  handleSwitchRoom: function handleSwitchRoom(tempMsg){
    var storeRoom = this.appStore.room;
    var userIds = tempMsg.userIds;
    var newRoomId = tempMsg.roomId;
    var user;
    for(user in userIds){
      fluxiRTC.signaller.sendMessage({
        type: "connect",
        userId: storeRoom.user.userId,
        sendTo: userIds[user],
        newRoomId: newRoomId
      });
    }
  },
  handleConnect: function handleConnect(tempMsg){
    var storeRoom = this.appStore.room;
    if(tempMsg.newRoomId){
      storeRoom.roomId = tempMsg.newRoomId;
    }
    fluxiRTC.signaller.sendMessage({
      type: "inRoom",
      userId: storeRoom.user.userId,
      firstName: storeRoom.user.firstName,
      lastname: storeRoom.user.lastName,
      email: storeRoom.user.email,
      sendTo: tempMsg.userId
    });
    var videoDomSelector = "div-"+storeRoom.hostId;
    try{
      videoDom = document.getElementById(videoDomSelector);
      videoDom.parentNode.removeChild(videoDom);
      storeRoom.connections = {};
      storeRoom.hostId = tempMsg.userId;
    }catch(e){
      console.log(e.stack);
    }
    storeRoom.connections = [];
  },
  handleSwitchAgent: function handleSwitchAgent(tempMsg){
    var storeRoom = this.appStore.room;
    fluxiRTC.signaller.sendMessage({
      type: "inRoom",
      userId: storeRoom.user.userId,
      firstName: storeRoom.user.firstName,
      lastname: storeRoom.user.lastName,
      email: storeRoom.user.email,
      sendTo: tempMsg.userId
    });
    var videoDomSelector = "div-"+tempMsg.agentId;
    try{
      videoDom = document.getElementById(videoDomSelector);
      videoDom.parentNode.removeChild(videoDom);
      storeRoom.connections = {};
    }catch(e){
      console.log(e.stack);
    }
  },
  handleTerminate: function handleTerminate(tempMsg){
    fluxiRTC.closeAllConnections(
      null,
      true
    );
    alert(tempMsg.info);
  },
  handleBye: function handleBye(tempMsg){
    var storeRoom = this.appStore.room;
    if (tempMsg.isHost) {

      /********************************************************

      This flow will stop the connection between both the
      Agent and customer

      *********************************************************/

      alert("Sorry! The host has closed this session.");
      tempObj.closeAllConnections();
    }


    if(tempMsg.userId == storeRoom.user.isBusyWith) {
      tempObj.deleteCurrentCustomer(tempMsg);
      tempObj.isWatingToConnect = true;
    } else {
      return;
    }
  }
};
