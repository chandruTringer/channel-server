Rtc.prototype.afterCallAccepted = function(tempMsg){
	var tempObj = this;
  var currentUser = tempObj.room.user;
  var isAgent = currentUser.agent;
  var isNewCustomer = (!currentUser.connections[tempMsg.userId] && isAgent);
  var isReconnection = (tempMsg.command === "reconnect" || tempMsg.type === "reconnect");
	if(isNewCustomer || isReconnection) {
        tempObj.trace("Client", "Message", ("User in room: " + tempMsg.userId));
        tempObj.createPeerConnection(tempMsg, "offer");
        if(!currentUser.isBusyWith || isReconnection) {
              tempObj.dataChannelCalls(currentUser.connections[tempMsg.userId].peerConnection, tempMsg.userId);
              tempObj.doCallTo(tempMsg.userId);
              currentUser.connections[tempMsg.userId].makeCall = true;
              currentUser.isBusyWith = tempMsg.userId;
              currentUser.callStage++;
        } else {

        }
  } else {
      tempObj.trace("Client","Message","Neglecting multiple inRoom message from server");
      tempObj.trace("Client","Message","Neglecting inRoom message to customer");
  }

  // Creating and setting an custom event
  document.removeEventListener("afterUserInRoom", tempObj.afterUserInRoom);
  document.addEventListener("afterUserInRoom", tempObj.afterUserInRoom);
  var afterUserInRoom = new CustomEvent("afterUserInRoom", {
        detail: {
              userId: tempMsg.userId,
              firstName: currentUser.connections[tempMsg.userId].firstName
        }
  });
  document.dispatchEvent(afterUserInRoom);

};

Rtc.prototype.afterCallDeclined = function(tempMsg){
  var tempObj = this;
  tempObj.deleteCurrentCustomer(tempMsg);
  tempObj.sendMessage({
    type: "terminate",
    sendTo: tempMsg.userId,
    info: "Your call was disconnected by the agent."
  });
  if(OverlayObject){
    OverlayObject.hideOverlay();
  }
};

Rtc.prototype.showWaitingStatus = function(tempMsg, tempObj){
  // Creating and setting a custom event
  document.removeEventListener("madeToWait", tempObj.madeToWait);
  document.addEventListener("madeToWait", tempObj.madeToWait);
  var madeToWait = new CustomEvent("madeToWait", {
        detail: {
              userId: tempMsg.userId,
              firstName: tempMsg.firstName
        }
  });

  document.dispatchEvent(madeToWait);
};

Rtc.prototype.afterDeletingCurrentCustomer = function(tempMsg, responseData){
	var tempObj = this;
    var userId = tempMsg.userId;
    var firstName = tempObj.room.user.connections[userId].firstName;
    var type = tempMsg.type;
      if(responseData !== undefined){
            tempObj.trace("Server", "Message", "User successfully deleted.");
            tempObj.trace("Client", "Message", ("User in room: " + responseData));


            if(type == "bye"){
              var callAttendTime = tempObj.room.user.connections[tempMsg.userId].callAttendTime;
              tempObj.currentConnections = tempObj.currentConnections - 1;

              tempObj.dataChannel[tempMsg.userId].close();
              delete tempObj.room.user.connections[tempMsg.userId];
              delete tempObj.dataChannel[tempMsg.userId];
              // Creating and setting an custom event
              document.removeEventListener("afterRemoteLeaving", tempObj.afterRemoteLeaving);
              document.addEventListener("afterRemoteLeaving", tempObj.afterRemoteLeaving);
              var afterRemoteLeaving = new CustomEvent("afterRemoteLeaving", {
                detail: {
                  userId: userId,
                  firstName: firstName,
                  callAttendTime: callAttendTime,
                  userDetails: tempObj.room.user
                }
              });
              document.dispatchEvent(afterRemoteLeaving);
            } else if(type == "inRoom"){
              // Do nothing
              // It means call was not picked by the agent
            } else {
              tempObj.currentConnections = tempObj.currentConnections - 1;

              tempObj.dataChannel[tempMsg.userId].close();
              delete tempObj.room.user.connections[tempMsg.userId];
              delete tempObj.dataChannel[tempMsg.userId];
            }
            if(!tempObj.room.user.connections[responseData]){
              tempObj.sendMessage({
                type: "connect",
                userId: tempObj.room.user.userId,
                sendTo: responseData
              });
            } else {
              tempObj.dataChannelCalls(tempObj.room.user.connections[responseData].peerConnection, responseData);
              tempObj.doCallTo(responseData);
              tempObj.room.user.connections[responseData].makeCall = true;
              tempObj.room.user.isBusyWith = responseData;
              tempObj.room.user.callStage++;
            }

            document.removeEventListener("afterUserInRoom", tempObj.afterUserInRoom);
            document.addEventListener("afterUserInRoom", tempObj.afterUserInRoom);
            var afterUserInRoom = new CustomEvent("afterUserInRoom", {
                  detail: {
                        userId: tempMsg.userId,
                        firstName: firstName
                  }
            });
            document.dispatchEvent(afterUserInRoom);
      } else {
            // Flow to remove the last customer
            tempObj.currentConnections = tempObj.currentConnections - 1;

            tempObj.dataChannel[tempMsg.userId].close();
            delete tempObj.room.user.connections[tempMsg.userId];
            delete tempObj.dataChannel[tempMsg.userId];

            // Creating and setting an custom event
            document.removeEventListener("afterRemoteLeaving", tempObj.afterRemoteLeaving);
            document.addEventListener("afterRemoteLeaving", tempObj.afterRemoteLeaving);
            var afterRemoteLeavingEvent = new CustomEvent("afterRemoteLeaving", {
                  detail: {
                        userId: userId,
                        firstName: firstName,
                        callAttendTime: callAttendTime,
                        userDetails: tempObj.room.user
                  }
            });
            document.dispatchEvent(afterRemoteLeavingEvent);
            mze().makeToast({
                  textMessage: "Waiting for Customers to join",
                  position: "top-left"
            });
      }
};

Rtc.prototype.deleteCurrentCustomer = function(tempMsg){
	var tempObj = this;
	tempObj.room.user.callStage = 0;
    tempObj.room.user.isBusyWith = null;
    var url = tempObj.apiBaseUrl + "user/remove/" + tempObj.room.roomId + "/" + tempMsg.userId;
    tempObj.trace("Client", "Delete Request", tempObj.room.roomId);
    tempObj.hitServer(url)
      .get(tempObj.room.user.userId)
      .then(function (responseData) {
      	tempObj.afterDeletingCurrentCustomer(tempMsg,responseData);
      })
      .catch(function () {
          tempObj.trace("Server", "Error", "Delete user failed.");
      });
};

/****************************************************************************
* Closing connections
****************************************************************************/
Rtc.prototype.closeConnection = function(isAsync) {
      clearInterval(window.heartBeatTimer);
      isAsync = isset(isAsync) ? isAsync : true;
      var tempObj = this;
      var empty = {};
      tempObj.localStream.getAudioTracks()[0].stop();
      tempObj.localStream.getVideoTracks()[0].stop();
      tempObj.localStream = null;
      tempObj.sendMessage({
            type: "bye",
            userId: tempObj.room.user.userId,
            isHost: tempObj.room.user.host,
            isAgent: tempObj.room.user.agent,
            sendTo: tempObj.room.user.isBusyWith
      });

      tempObj.socket.close();
      if(rtc.room.user.agent || rtc.room.user.waiting){
        var url = tempObj.apiBaseUrl + "user/remove/" + tempObj.room.roomId + "/" + tempObj.room.user.userId;
        tempObj.hitServer(url, isAsync)
        .get(tempObj.room.user.userId)
        .then(function () {
          tempObj.trace("Server", "Message", "User successfully deleted.");

          // Flow for switching to the next user in queue

        })
        .catch(function () {
        tempObj.trace("Server", "Error", "Delete user failed.");
        });

        tempObj.currentConnections = 1;

        tempObj.afterClosingConnections.call(empty);
      }
};

Rtc.prototype.closeAllConnections = function(isAsync, isTerminated) {
      isAsync = isset(isAsync) ? isAsync : true;
      var tempObj = this;
      for(var key in tempObj.room.user.connections) {
            if(tempObj.room.user.connections[key].peerConnection) {
                  tempObj.room.user.connections[key].peerConnection.close();
            }
            delete tempObj.room.user.connections[key];
            // TODO:datachannelclose tempObj.dataChannel[key].close();
      }
      tempObj.localStream.getAudioTracks()[0].stop();
      tempObj.localStream.getVideoTracks()[0].stop();
      tempObj.localStream = null;
      if(!isTerminated && (rtc.room.user.agent || rtc.room.user.waiting)){

        // sendMessage({
        //   command: "message",
        //   url: tempObj.apiBaseUrl + "user/remove/" + tempObj.room.roomId + "/" + tempObj.room.user.userId
        // }).then(log, error).catch(error);

        var url = tempObj.apiBaseUrl + "user/remove/" + tempObj.room.roomId + "/" + tempObj.room.user.userId;
        tempObj.hitServer(url, isAsync)
        .get(tempObj.room.user.userId)
        .then(function () {
          tempObj.trace("Server", "Message", "User successfully deleted.");
        })
        .catch(function () {
          tempObj.trace("Server", "Error", "Delete user failed.");
        });

        tempObj.currentConnections = 1;
      }

      if(!isTerminated){
        tempObj.sendMessage({
          type: "bye",
          userId: tempObj.room.user.userId,
          isHost: tempObj.room.user.host,
          isAgent: tempObj.room.user.agent,
          sendTo: tempObj.room.user.isBusyWith
        });
      }


      tempObj.socket.close();

      // Creating and setting an custom event
      document.removeEventListener("afterClosingConnections", tempObj.afterClosingConnections);
      document.addEventListener("afterClosingConnections", tempObj.afterClosingConnections);
      var afterClosingConnections = new CustomEvent("afterClosingConnections", {
            detail: {
                  active: false
            }
      });
      document.dispatchEvent(afterClosingConnections);
      tempObj = null;
      try{
        OverlayObject.hideOverlay();
      } catch(e){
        console.log(e.stack);
      }
};

/****************************************************************************
* Toggle video/Audio functions
****************************************************************************/
Rtc.prototype.videoToggleHandler = function() {
      var tempObj = this;
      var state;

      document.getElementById(tempObj.videoToggleButton).classList.toggle("inactive");
      if(document.getElementById(tempObj.videoToggleButton).classList.contains("inactive")) {
            state = "off";
      } else {
            state = "on";
      }

      for(var key in tempObj.room.user.connections) {
            // For getting peer connection's streams
            var peerConnStreams = tempObj.room.user.connections[key].peerConnection.getLocalStreams()[0];
            var videoTracks = peerConnStreams.getVideoTracks();
            var i;
            if (tempObj.isVideoMuted) {
                  for ( i = 0; i < videoTracks.length; i++) {
                        videoTracks[i].enabled = true;
                        tempObj.sendMessage({
                              userId: tempObj.room.user.userId,
                              type: "videoToggle",
                              state: "on"
                        });
                  }
                  state = "on";
            } else {
                  for ( i = 0; i < videoTracks.length; i++) {
                        videoTracks[i].enabled = false;
                        tempObj.sendMessage({
                              userId: tempObj.room.user.userId,
                              type: "videoToggle",
                              state: "off"
                        });
                  }
                  state = "off";
            }
      }

      // For finding time
      var tempCallTime = tempObj.room.user.callAttendTime;

      // Creating and setting an custom event
      document.removeEventListener("afterVideoMute", tempObj.afterVideoMute);
      document.addEventListener("afterVideoMute", tempObj.afterVideoMute);
      var afterVideoMute = new CustomEvent("afterVideoMute", {
            detail: {
                  userId: tempObj.room.user.userId,
                  firstName: tempObj.room.user.firstName,
                  callAttendTime: tempCallTime,
                  state: state
            }
      });
      document.dispatchEvent(afterVideoMute);

      tempObj.isVideoMuted = !tempObj.isVideoMuted;
};

Rtc.prototype.audioToggleHandler = function() {
      var tempObj = this;
      var state;

      document.getElementById(tempObj.audioToggleButton).classList.toggle("inactive");

      // Checking for all pper connections
      for(var key in tempObj.room.user.connections) {
            // For getting peer connection's streams
            var peerConnStreams = tempObj.room.user.connections[key].peerConnection.getLocalStreams()[0];
            var audioTracks = tempObj.peerConnStreams.getAudioTracks();
            var i;
            if (isAudioMuted) {
                  for ( i = 0; i < audioTracks.length; i++) {
                        audioTracks[i].enabled = true;
                        tempObj.sendMessage({
                              userId: tempObj.room.user.userId,
                              type: "AudioToggle",
                              state: "on"
                        });
                        state = "on";
                  }
            } else {
                  for ( i = 0; i < audioTracks.length; i++) {
                        audioTracks[i].enabled = false;
                        tempObj.sendMessage({
                              userId: tempObj.room.user.userId,
                              type: "AudioToggle",
                              state: "off"
                        });
                        state = "off";
                  }
            }
      }

      // Creating and setting an custom event
      document.removeEventListener("afterAudioMute", tempObj.afterAudioMute);
      document.addEventListener("afterAudioMute", tempObj.afterAudioMute);
      var afterAudioMute = new CustomEvent("afterAudioMute", {
            detail: {
                  userId: tempObj.room.user.userId,
                  firstName: tempObj.room.user.firstName,
                  state: state
            }
      });
      document.dispatchEvent(afterAudioMute);

      tempObj.isAudioMuted = !tempObj.isAudioMuted;

};
