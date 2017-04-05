// define the class
var Rtc = function() {
  'use strict';
      this.localStream = "";
      this.localPeerConnection = "";
      this.remotePeerConnection = "";
      this.heartBeat = false;
      this.isWatingToConnect = false;
      Object.defineProperty(this,"heartBeating",{
        get: function(){
          console.log("called");
          return this.heartBeat;
        },
        set: function(value){
          console.log("set",value);
          this.heartBeat = value;
          return value;
        }
      });
      this.heartBeatInitiated = false;
      this.configuration = {
            'iceServers': [{
                  'url': 'stun:stun1.l.google.com:19302'
            }]
      };
      this.room = {};
      // For starting WebRTC functions both these have to be true
      this.channelReady = false;
      this.mediaReady = false;

      // Channel storage
      this.socket = null;

      // My peer connection object
      this.peerConnection = null;

      // Constraint variables
      this.pcConstraints = {
        "optional": [
          {
            "googImprovedWifiBwe": true
          },
          {
            "DtlsSrtpKeyAgreement": true
          }
        ]
      };

      this.sdpConstraints = {
            'mandatory' : {
                  'OfferToReceiveAudio' : true,
                  'OfferToReceiveVideo' : true
            }
      };

      this.offerConstraints = {
        "optional": [],
        "mandatory":{}
      };

      // Message queue for each user
      this.msgQueue = {};

      // Number of connections in room for user
      this.currentConnections = 0;

      // Data channel
      this.dataChannel = {};
      this.receiveChannel = {};
      this.dataChannelOptions = {
            ordered: true, // do not guarantee order
            maxRetransmits: 4 // retry attempts
      };

      // To avoid redundant msg through channel
      this.previousMessageToken = null;

      // To keep track of audio/video muted
      this.isVideoMuted = false;
      this.isAudioMuted = false;
      this.callStages = ["Free", "Offer", "Answer", "Connected Successfully"];
};

Rtc.prototype.init = function(params) {
      var tempObj = this;
      try {

            params = (typeof params === 'undefined') ? {} : params;
            tempObj.callButton = (typeof params.callButton === 'undefined') ? "callButtonRtc" : params.callButton;
            tempObj.hangupButton = (typeof params.hangupButton === 'undefined') ? "hangupButtonRtc" : params.hangupButton;
            tempObj.videoToggleButton = (typeof params.videoToggleButton === 'undefined') ? "videoToggleButtonRtc" : params.videoToggleButton;
            tempObj.audioToggleButton = (typeof params.audioToggleButton === 'undefined') ? "audioToggleButtonRtc" : params.audioToggleButton;
            tempObj.apiBaseUrl = (typeof params.apiBaseUrl === 'undefined') ? "" : params.apiBaseUrl;
            tempObj.roomAndUserUrl = (typeof params.roomAndUserUrl === 'undefined') ? "" : params.roomAndUserUrl;
            tempObj.messageUrl = (typeof params.messageUrl === 'undefined') ? "" : params.messageUrl;
            tempObj.roomAndUserUrl = tempObj.apiBaseUrl + tempObj.roomAndUserUrl;
            tempObj.messageUrl = tempObj.apiBaseUrl + tempObj.messageUrl;
            tempObj.formId = (typeof params.formId === 'undefined') ? "" : params.formId;
            tempObj.chat = (typeof params.chat === 'undefined') ? false : params.chat;
            tempObj.chatField = (typeof params.chatField === 'undefined') ? "" : params.chatField;

            if(document.getElementById(tempObj.formId)) {

            } else {
                  throw "Form not specified or Form element does not exist.";
            }

            if(tempObj.chat === true) {
                  if(tempObj.chatField === "")
                  {
                        throw "When chat parameter is set to true, chatField cannot be empty.";
                  } else {
                        if(document.getElementById(tempObj.chatField)) {
                              document.getElementById(tempObj.chatField).onkeyup = function(e) {
                                    var chatType = document.getElementById(tempObj.chatField);
                                    e = e || event;
                                    if (e.keyCode === 13 && !e.ctrlKey) {
                                          var textAreaMsg = chatType.value;
                                          chatType.value = "";
                                          tempObj.composeDataChannelMsgs(textAreaMsg, "");
                                    }
                                    return true;
                              };
                        } else {
                              throw "chatField element does not exist.";
                        }
                  }
            }

            // Handlers initiation
            tempObj.afterGettingUser = (typeof params.afterGettingUser === 'undefined') ? tempObj.emptyFunction : params.afterGettingUser;
            tempObj.afterGettingMedia = (typeof params.afterGettingMedia === 'undefined') ? tempObj.emptyFunction : params.afterGettingMedia;
            tempObj.afterOpeningChannel = (typeof params.afterOpeningChannel === 'undefined') ? tempObj.emptyFunction : params.afterOpeningChannel;
            tempObj.afterUserInRoom = (typeof params.afterUserInRoom === 'undefined') ? tempObj.emptyFunction : params.afterUserInRoom;
            tempObj.afterReceivingOffer = (typeof params.afterReceivingOffer === 'undefined') ? tempObj.emptyFunction : params.afterReceivingOffer;
            tempObj.afterReceivingAnswer = (typeof params.afterReceivingAnswer === 'undefined') ? tempObj.emptyFunction : params.afterReceivingAnswer;
            tempObj.afterAudioToggle = (typeof params.afterAudioToggle === 'undefined') ? tempObj.emptyFunction : params.afterAudioToggle;
            tempObj.afterVideoToggle = (typeof params.afterVideoToggle === 'undefined') ? tempObj.emptyFunction : params.afterVideoToggle;
            tempObj.afterAudioMute = (typeof params.afterAudioMute === 'undefined') ? tempObj.emptyFunction : params.afterAudioMute;
            tempObj.afterVideoMute = (typeof params.afterVideoMute === 'undefined') ? tempObj.emptyFunction : params.afterVideoMute;
            tempObj.afterTextMessage = (typeof params.afterTextMessage === 'undefined') ? tempObj.emptyFunction : params.afterTextMessage;
            tempObj.afterClosingConnections = (typeof params.afterClosingConnections === 'undefined') ? tempObj.emptyFunction : params.afterClosingConnections;
            tempObj.afterReceivingStream = (typeof params.afterReceivingStream === 'undefined') ? tempObj.emptyFunction : params.afterReceivingStream;
            tempObj.afterRemoteLeaving = (typeof params.afterRemoteLeaving === 'undefined') ? tempObj.emptyFunction : params.afterRemoteLeaving;
            tempObj.madeToWait = (typeof params.madeToWait === 'undefined') ? tempObj.emptyFunction : params.madeToWait;

            if((typeof tempObj.afterGettingUser === "function") || (typeof tempObj.afterGettingMedia === "function") || (typeof tempObj.afterOpeningChannel === "function") || (typeof tempObj.afterUserInRoom === "function") ||
            (typeof tempObj.afterReceivingOffer === "function") || (typeof tempObj.afterReceivingAnswer === "function") || (typeof tempObj.afterAudioToggle === "function") || (typeof tempObj.afterVideoToggle === "function") ||
            (typeof tempObj.afterTextMessage === "function") || (typeof tempObj.afterClosingConnections === "function") || (typeof tempObj.afterReceivingStream === "function") || (typeof tempObj.madeToWait === "function") || (typeof tempObj.afterVideoMute === "function")|| (typeof tempObj.afterAudioMute === "function")) {

            } else {
                  throw "Handlers should always be functions.";
            }

            if(tempObj.formId !== "") {
                  document.getElementById(tempObj.callButton).onclick = function(event) {
                        event.preventDefault();
                        var formData = new FormData(document.getElementById(tempObj.formId));

                    var server = tempObj.hitServer(tempObj.roomAndUserUrl);
                        server.post(formData)
                        .then(function (responseData) {
                              var roomData = responseData;
                              var isAgentSwitched = (responseData.previousAgentId);
                              if(roomData.roomId && roomData.userDetail) {
                                    tempObj.room.roomId = roomData.roomId;
                                    tempObj.room.roomName = roomData.roomName;
                                    tempObj.room.user = roomData.userDetail;
                                    tempObj.room.user.callAttendTime = new Date();
                                    tempObj.room.user.connections = {}; // Holding all users peer connections
                                    // tempObj.room.user.isBusyWith = false;
                                    if(tempObj.room.user.agent){
                                      tempObj.room.user.isFirstCaller = true;
                                      tempObj.room.hostId = roomData.userDetail.userId;
                                    } else {
                                      tempObj.room.hostId = roomData.roomHostUserId;
                                    }
                                    tempObj.room.user.callStage = 0;
                                    tempObj.currentConnections = tempObj.currentConnections + 1;
                                    if(isAgentSwitched){
                                      tempObj.room.user.previousConnectionsDetail = {
                                        type: "switchAgent",
                                        agentId: responseData.previousAgentId,
                                        firstName: responseData.userDetail.firstName,
                                        lastname: responseData.userDetail.lastName,
                                        email: responseData.userDetail.email,
                                        userId: tempObj.room.user.userId
                                      };
                                      if(responseData.callerDetails){
                                        tempObj.room.user.previousConnectionsDetail.sendTo = responseData.callerDetails[0].userId;
                                      }
                                    }
                                    tempObj.trace("Client", "Message", "User hosting chat room.");

                                    tempObj.startWebrtcSteps();
                                    // Creating and setting an custom event
                                    document.removeEventListener("afterGettingUser", tempObj.afterGettingUser);
                                    document.addEventListener("afterGettingUser", tempObj.afterGettingUser);
                                    var afterGettingUser = new CustomEvent("afterGettingUser", {
                                          detail: {
                                                roomDetails: tempObj.room
                                          }
                                    });
                                    document.dispatchEvent(afterGettingUser);

                              } else {
                                    tempObj.trace("Server", "Error", "There seeems to be no room or user data in response.");
                              }
                        })
                        .catch(function (responseData) {
                              tempObj.trace("Server", "Error", "Room creation failed! Retry after sometime.");
                        });
                  };
            } else {
                  tempObj.trace("Client", "Warning", "There seems to be no form data. No connection will be established.");
            }

            document.getElementById(tempObj.videoToggleButton).onclick = (tempObj.videoToggleHandler).bind(this);
            document.getElementById(tempObj.audioToggleButton).onclick = (tempObj.audioToggleHandler).bind(this);

            window.onunload = function(e) {
              e.preventDefault();
              e.stopPropagation();
                  if(tempObj.currentConnections > 1) {
                        var lveMsg = "Leaving this page will end current call due to security reasons";
                        e.returnValue = lveMsg;
                        tempObj.closeAllConnections(false);
                        return lveMsg;
                  } else {
                        tempObj.closeConnection(false);
                  }
            };

            document.getElementById(tempObj.hangupButton).onclick = function() {
              var currentElement = this;
              var isBusyWith = tempObj.room.user.isBusyWith;
              currentElement.classList.add("disabled");
      				if(tempObj.room.user.agent && !!(rtc.room.user.isBusyWith)){
                tempObj.sendMessage({
                  type: "terminate",
                  sendTo: isBusyWith,
                  info: "Your call was disconnected by the agent."
                });
      					tempObj.deleteCurrentCustomer({
      						userId: isBusyWith,
                  firstName: tempObj.room.user.connections[isBusyWith].firstName,
                  type: "bye"
      					});
      				} else {
                // Flow for customer to closeConnections
                if(tempObj.currentConnections > 1) {
                  tempObj.closeAllConnections();
                } else {
                  tempObj.closeConnection();
                }
              }
              setTimeout(function(){
                currentElement.classList.remove("disabled");
              },500);
            };
      } catch(err) {
            tempObj.trace("Client", "Error", err);
            tempObj.trace("Client", "Error", "Execution stopped due to errors.");
            return;
      }

      return tempObj;
};

Rtc.prototype.startWebrtcSteps = function() {
      var tempObj = this;
      // Get user media
      tempObj.activateUserMedia();
};

/****************************************************************************
* User media (webcam, audio) functions
****************************************************************************/
Rtc.prototype.activateUserMedia = function() {
      var tempObj = this;
      tempObj.trace("Client", "Message", "Getting user media(Video/Microphone).");
      try {
        navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
          // look for audio and video devices, call getUserMedia
          return navigator.mediaDevices.getUserMedia({audio: true, video: true});
        })
        .then((function (stream) {
          tempObj.trace("Client", "Message", "Successfully acquired user media.");

          var tempCallTime = tempObj.room.user.callAttendTime;

          // Creating and setting an custom event
          document.removeEventListener("afterGettingMedia", tempObj.afterGettingMedia);
          document.addEventListener("afterGettingMedia", tempObj.afterGettingMedia);
          var afterGettingMedia = new CustomEvent("afterGettingMedia", {
            detail: {
              userId: tempObj.room.user.userId,
              firstName: tempObj.room.user.firstName,
              callAttendTime: tempCallTime,
              stream: stream
            }
          });
          document.dispatchEvent(afterGettingMedia);

          // Other activities
          this.localStream = stream;
          this.mediaReady = true;
          tempObj._openChannel(tempObj.room.user.channelToken);
        }).bind(this))
        .catch(function (err) {
          console.log(err);
          tempObj.trace("Client" ,"Error", "Failed opening user media.");
        });
      } catch (e) {
        alert("Oops! seems like your browser does't support video connections. please try opening the site with latest version of chrome or firefox");
        console.log(err);
      }
};

Rtc.prototype.onRemoteStreamAdded = function(event, userId) {
      var tempObj = this;
      tempObj.trace("Client", "Message", ("Remote video stream received from user: " + userId));
      tempObj.room.user.callStage++;

      // Creating and setting an custom event
      document.removeEventListener("afterReceivingStream", tempObj.afterReceivingStream);
      document.addEventListener("afterReceivingStream", tempObj.afterReceivingStream);
      var afterReceivingStream = new CustomEvent("afterReceivingStream", {
            detail: {
                  userId: userId,
                  firstName: tempObj.room.user.connections[userId].firstName,
                  callAttendTime: tempObj.room.user.connections[userId].callAttendTime,
                  stream: event.stream
            }
      });
      document.dispatchEvent(afterReceivingStream);
};

/****************************************************************************
* Call Handling WebRTC functions
****************************************************************************/
Rtc.prototype.createPeerConnection = function(inRoomMsg) {
      var tempObj = this;
      var remoteUserId = inRoomMsg.userId;
      tempObj.peerConnection = new RTCPeerConnection(tempObj.configuration);
      tempObj.peerConnection.onicecandidate = (function(e) { tempObj.onIceCandidate(e); });
      tempObj.peerConnection.addStream(tempObj.localStream);
      tempObj.peerConnection.onaddstream = (function(e) { tempObj.onRemoteStreamAdded(e, remoteUserId); });
      tempObj.room.user.connections[remoteUserId] = tempObj.room.user.connections[remoteUserId] || {};
      tempObj.room.user.connections[remoteUserId].firstName = inRoomMsg.firstName;
      tempObj.room.user.connections[remoteUserId].lastName = inRoomMsg.lastName;
      tempObj.room.user.connections[remoteUserId].email = inRoomMsg.email;
      tempObj.room.user.connections[remoteUserId].connected = false;
      tempObj.room.user.connections[remoteUserId].peerConnection = tempObj.peerConnection;
      tempObj.room.user.connections[remoteUserId].makeCall = false;
      var audios = tempObj.localStream.getAudioTracks();
      var videos = tempObj.localStream.getVideoTracks();
      tempObj.room.user.connections[remoteUserId].videoTracks = videos;
      tempObj.room.user.connections[remoteUserId].audioTracks = audios;
};

Rtc.prototype.doCallTo = function(remoteUserId) {
      var tempObj = this;
      var constraints = tempObj.mergeConstraints(tempObj.offerConstraints, tempObj.sdpConstraints);
      tempObj.room.user.connections[remoteUserId].peerConnection.createOffer((
        function(e) {
          tempObj.setLocalAndSendMessage(e, tempObj.room.user.userId, remoteUserId);
        }), (
        function() {
          trace("Client", "Error", ("Sending offer failed to user: " + remoteUserId));
        }),
        tempObj.constraints);
};

Rtc.prototype.doAnswerTo = function(remoteUserId) {
      var tempObj = this;
      tempObj.room.user.waiting = false;
      var constraints = tempObj.mergeConstraints(tempObj.offerConstraints, tempObj.sdpConstraints);
      tempObj.room.user.connections[remoteUserId].peerConnection.createAnswer(
        (
          function(e) {
            tempObj.setLocalAndSendMessage(e, tempObj.room.user.userId, remoteUserId);
          }
        ),
        (
          function(e) {
            trace("Client", "Error", ("sending offer failed to user: " + remoteUserId));
          }
        ),
        tempObj.constraints
      );
};

Rtc.prototype.setLocalAndSendMessage = function(sessionDescription, userId, remoteUserId) {

      var tempObj = this;
      tempObj.room.user.connections[remoteUserId].peerConnection.setLocalDescription(sessionDescription, (function() { tempObj.trace("Client", "Message", ("Setting session description success for user: " + userId)); }),
      (function(e) { tempObj.trace("Client", "Error", ("Setting session description failed for user: " + userId)); })     );
      tempObj.sendMessage({
            description: sessionDescription,
            sendTo: remoteUserId,
            type: sessionDescription.type,
            firstName: tempObj.room.user.firstName,
            lastname: tempObj.room.user.lastName,
            email: tempObj.room.user.email,
            userId: userId
      });
};

Rtc.prototype.setRemote = function(message, remoteUserId) {
      var tempObj = this;
      tempObj.room.user.connections[remoteUserId].peerConnection.setRemoteDescription(
        new RTCSessionDescription(message),
        (function(e) {
          console.log("SET REMOTE SUCCESS",e);
          tempObj.pushIceCandidates(remoteUserId);
          tempObj.currentConnections = tempObj.currentConnections + 1;
          tempObj.trace("Client", "Message", ("Remote session description successfully set for user:" + remoteUserId));
        }),
        (function(e) {
          tempObj.trace("Client", "Error", ("Setting remote description failed for user: " + remoteUserId));
        })
      );
};

Rtc.prototype.mergeConstraints = function(cons1, cons2) {
      var merged = cons1;
      for ( var name in cons2.mandatory) {
            merged.mandatory[name] = cons2.mandatory[name];
      }
      merged.optional.concat(cons2.optional);
      return merged;
};

/****************************************************************************
* iceCandidates handling
****************************************************************************/
Rtc.prototype.pushIceCandidates = function(userId) {
      var tempObj = this;
      var candidate = new RTCIceCandidate({
            sdpMLineIndex : cmsg.label,
            candidate : cmsg.candidate
      });
      tempObj.room.user.connections[userId].peerConnection.addIceCandidate(candidate);
      tempObj.room.user.connections[userId].answered = true;
};

Rtc.prototype.onIceCandidate = function(event) {
      var tempObj = this;
      if (event.candidate) {
            tempObj.sendMessage( {
                  type : 'candidate',
                  label : event.candidate.sdpMLineIndex,
                  id : event.candidate.sdpMid,
                  sendTo: tempObj.room.user.isBusyWith,
                  candidate : event.candidate.candidate,
                  userId: tempObj.room.user.userId
            });
      } else {
      }
};

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
        socket.emit('removeUser',{
          userId: tempObj.room.user.userId
        });
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
        window.candidateCount += 1
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

//handle the message for user
Rtc.prototype.handleMessage = function(tempMsg) {
      console.log(tempMsg);
      var tempObj = this;
      if( tempMsg.userId === tempObj.room.user.userId ) {
            // Ignore my messages in channel (loop back)
            return;
      }
      switch(tempMsg.type) {
            case "inRoom":
            var currentCaller  = tempObj.room.user;
            var isAgent = currentCaller.agent;
            var isFirstCaller = currentCaller.isFirstCaller;
            var isBusy = !  !currentCaller.isBusyWith;
            var messageFromCurrentPeer = (currentCaller.isBusyWith === tempMsg.userId);
            var isCallAccepted = (isAgent && !isBusy) || (isAgent && messageFromCurrentPeer);

            	if( isAgent && isFirstCaller ){
            		showIncomingCaller(tempMsg,tempObj);
                currentCaller.isFirstCaller = false;
            	} else if(isCallAccepted){
                tempObj.afterCallAccepted(tempMsg);
              } else if(tempObj.room.user.agent){
            		// Keep in wait
            		tempObj.afterCallDeclined(tempMsg);
            	} else{
            		console.log("Discarding incoming call from other users");
            	}
            break;
            case "reconnect":
              if(tempMsg.userId){
                var videoDomSelector = "div-"+tempMsg.userId;
                try{
                  videoDom = document.getElementById(videoDomSelector);
                  videoDom.parentNode.removeChild(videoDom);
                  // tempObj.room.connections = {};
                }catch(e){
                  console.log(e.stack);
                }
                window.OverlayObject && OverlayObject.hideOverlay();
              }
              if(tempObj.room.user.agent){
                tempObj.room.user.isBusyWith = null;
                tempObj.afterCallAccepted(tempMsg);
              } else {
                tempObj.sendMessage({
                      type: "inRoom",
                      userId: tempObj.room.user.userId,
                      firstName: tempObj.room.user.firstName,
                      lastname: tempObj.room.user.lastName,
                      email: tempObj.room.user.email,
                      sendTo: tempMsg.userId,
                      command: "reconnect"
                });
              }
              break;
            case "wait":
              if(tempMsg.previousAgentId){
                var videoDomSelector = "div-"+tempMsg.previousAgentId;
                try{
                  videoDom = document.getElementById(videoDomSelector);
                  videoDom.parentNode.removeChild(videoDom);
                  tempObj.room.connections = {};
                }catch(e){
                  console.log(e.stack);
                }
                window.OverlayObject && OverlayObject.hideOverlay();
              }
              tempObj.showWaitingStatus(tempMsg, tempObj);
              tempObj.trace("Client", "Message","Waiting for agent: "+tempMsg.firstName);

            break;
            case "offer":
            if(document.getElementsByClassName("material-dialog").length > 0){
                  document.getElementsByClassName("material-dialog")[0].style.display = "none";
            }
            tempObj.room.user.callStage++; // Moving to offer received stage
            tempObj.trace("Client", "Message", ("Offer from user: " + tempMsg.userId));
            tempObj.createPeerConnection(tempMsg, "answer");
            tempObj.room.user.connections[tempMsg.userId].peerConnection.ondatachannel = function(event) {
                  tempObj.receiveChannel[tempMsg.userId] = event.channel;
                  tempObj.createDataChannelHandlers(tempObj.receiveChannel[tempMsg.userId]);
            };
            tempObj.setRemote(tempMsg.description, tempMsg.userId);
            tempObj.doAnswerTo(tempMsg.userId);
            tempObj.room.user.connections[tempMsg.userId].callAttendTime = new Date();
            tempObj.room.user.isBusyWith = tempMsg.userId;
            tempObj.room.user.callStage++; // Moving to answer sent stage

            // Creating and setting an custom event
            document.removeEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
            document.addEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
            var afterReceivingOffer = new CustomEvent("afterReceivingOffer", {
                  detail: {
                        userId: tempMsg.userId,
                        firstName: tempObj.room.user.connections[tempMsg.userId].firstName,
                        currentConnections: tempObj.room.user.connections
                  }
            });
            document.dispatchEvent(afterReceivingOffer);
            window.OverlayObject && OverlayObject.hideOverlay();
            break;
            case "answer":
            tempObj.room.user.callStage++;
            tempObj.trace("Client", "Message", ("Answer from user: " + tempMsg.userId));
            tempObj.setRemote(tempMsg.description, tempMsg.userId);
            tempObj.room.user.connections[tempMsg.userId].connected = true;
            tempObj.room.user.connections[tempMsg.userId].callAttendTime = new Date();

            // Creating and setting an custom event
            document.removeEventListener("afterReceivingAnswer", tempObj.afterReceivingAnswer);
            document.addEventListener("afterReceivingAnswer", tempObj.afterReceivingAnswer);
            var afterReceivingAnswer = new CustomEvent("afterReceivingAnswer", {
                  detail: {
                        userId: tempMsg.userId,
                        firstName: tempObj.room.user.connections[tempMsg.userId].firstName,
                        currentConnections: tempObj.room.user.connections
                  }
            });
            document.dispatchEvent(afterReceivingAnswer);
            window.OverlayObject && OverlayObject.hideOverlay();

            break;
            case "candidate":
              var candidate = new RTCIceCandidate({
                    sdpMLineIndex : tempMsg.label,
                    candidate : tempMsg.candidate
              });
              tempObj.room.user.connections[tempMsg.userId].peerConnection.addIceCandidate(candidate);
            break;
            case "audioToggle":

            // Creating and setting an custom event
            document.removeEventListener("afterAudioToggle", tempObj.afterAudioToggle);
            document.addEventListener("afterAudioToggle", tempObj.afterAudioToggle);
            var afterAudioToggle = new CustomEvent("afterAudioToggle", {
                  detail: {
                        userId: tempMsg.userId,
                        firstName: tempObj.room.user.connections[userId].firstName,
                        callAttendTime: tempObj.room.user.connections[userId].callAttendTime,
                        state: tempMsg.state
                  }
            });
            document.dispatchEvent(afterAudioToggle);

            break;
            case "switchRoom":
              console.log(tempMsg);
              var userIds = tempMsg.userIds;
              var newRoomId = tempMsg.roomId;
              var user;
              for(user in userIds){
                tempObj.sendMessage({
                  type: "connect",
                  userId: tempObj.room.user.userId,
                  sendTo: userIds[user],
                  newRoomId: newRoomId
                });
              }

            break;
            case "videoToggle":

            // Creating and setting an custom event
            document.removeEventListener("afterVideoToggle", tempObj.afterVideoToggle);
            document.addEventListener("afterVideoToggle", tempObj.afterVideoToggle);
            var afterVideoToggle = new CustomEvent("afterVideoToggle", {
                  detail: {
                        userId: tempMsg.userId,
                        firstName: tempObj.room.user.connections[tempMsg.userId].firstName,
                        callAttendTime: tempObj.room.user.connections[tempMsg.userId].callAttendTime,
                        state: tempMsg.state
                  }
            });
            document.dispatchEvent(afterVideoToggle);

            break;
            case "connect":
            if(tempMsg.newRoomId){
              tempObj.room.roomId = tempMsg.newRoomId;
            }
            tempObj.sendMessage({
                  type: "inRoom",
                  userId: tempObj.room.user.userId,
                  firstName: tempObj.room.user.firstName,
                  lastname: tempObj.room.user.lastName,
                  email: tempObj.room.user.email,
                  sendTo: tempMsg.userId
            });
            var videoDomSelector = "div-"+tempObj.room.hostId;
            try{
              videoDom = document.getElementById(videoDomSelector);
              videoDom.parentNode.removeChild(videoDom);
              tempObj.room.connections = {};
              tempObj.room.hostId = tempMsg.userId;
            }catch(e){
              console.log(e.stack);
            }
            tempObj.room.connections = [];
            break;
            case "switchAgent":
              tempObj.sendMessage({
                    type: "inRoom",
                    userId: tempObj.room.user.userId,
                    firstName: tempObj.room.user.firstName,
                    lastname: tempObj.room.user.lastName,
                    email: tempObj.room.user.email,
                    sendTo: tempMsg.userId
              });
              var videoDomSelector = "div-"+tempMsg.agentId;
              try{
                videoDom = document.getElementById(videoDomSelector);
                videoDom.parentNode.removeChild(videoDom);
                tempObj.room.connections = {};
              }catch(e){
                console.log(e.stack);
              }
            break;
            case "terminate":
              tempObj.closeAllConnections(
                null,
                true
              );
              alert(tempMsg.info);
            break;
            case "bye":

            if (tempMsg.isHost) {

                /********************************************************

                    This flow will stop the connection between both the
                    Agent and customer

                *********************************************************/

                  alert("Sorry! The host has closed this session.");
                  tempObj.closeAllConnections();
            }


            if(tempMsg.userId == tempObj.room.user.isBusyWith) {
                  tempObj.deleteCurrentCustomer(tempMsg);
                  tempObj.isWatingToConnect = true;
            } else {
                return;
            }
            break;
            default:
            tempObj.trace("Server", "Error", "Message type is invalid!");
            break;
      }
};

/****************************************************************************
* Data Channel functions
****************************************************************************/
Rtc.prototype.dataChannelCalls = function(pc, remoteUserId) {
      var tempObj = this;
      var channelName = tempObj.room.user.userId + "," + remoteUserId;
      tempObj.dataChannel[remoteUserId] = tempObj.peerConnection.createDataChannel("textMessages", tempObj.dataChannelOptions);
      tempObj.createDataChannelHandlers(tempObj.dataChannel[remoteUserId]);
};

// Rtc.prototype.initiateHeartBeatCheck = function(){
//   var tempObj = this;
//   tempObj.heartBeating = false;
//
//   try {
//     tempObj.composeDataChannelMsgs("lub", "", "ping");
//   } catch(e){
//     // Peer went out of room
//     console.log("Peer not in connection");
//   }
//   var networkToggled = false;
//   setTimeout(function(){
//     if(!tempObj.heartBeating && !tempObj.isWatingToConnect){
//       tempObj.isWatingToConnect = true;
//       tempObj.trace("Client","Message","peer network failed");
//       showCallHold();
//     } else {
//       networkToggled = true;
//       tempObj.heartBeating = false;
//       tempObj.trace("Client","Message","connection check success");
//     }
//   },2000);
// };

Rtc.prototype.createDataChannelHandlers = function(dataChannelTemp) {
      var tempObj = this;
      dataChannelTemp.onerror = (function (error) {
            this.trace("Client", "Error", "Data Channnel error.");
      }).bind(this);
      dataChannelTemp.onmessage = (function (event) {
        var data = JSON.parse(event.data);
        if(data.command === "ping"){
          if(data.message  === "lub"){
            try {
              tempObj.composeDataChannelMsgs("tub","","ping");
            } catch(e){
              // Peer went out of room
              console.log("Peer not in connection");
            }
            if(!tempObj.room.user.agent && !tempObj.heartBeatInitiated){
                tempObj.trace("Client","Action","Initiated Heart Beat");
                // tempObj.heartBeatInitiated = true;
                // setTimeout(function(){
                //   tempObj.initiateHeartBeatCheck();
                //   window.heartBeatTimer = setInterval(function () {
                //     tempObj.initiateHeartBeatCheck();
                //   },20000);
                // },8000);
            }
          } else {
            // tempObj.heartBeating = true;
          }
          return;
        }
        this.trace("Client", "Message", "Data Channnel message");
        this.handleChannelMsg(event.data);

      }).bind(this);
      dataChannelTemp.onopen = (function (event) {
        // if(tempObj.room.user.agent){
        //   tempObj.trace("Client","Action","Initiated Heart Beat");
        //   window.heartBeatTimer = setInterval(function(){
        //     tempObj.initiateHeartBeatCheck();
        //   },20000);
        // }
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
      }
      tempObj.afterClosingConnections.call(empty);
};

Rtc.prototype.closeAllConnections = function(isAsync, isTerminated) {
      clearInterval(window.heartBeatTimer);
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

/****************************************************************************
* Misc functions
****************************************************************************/
Rtc.prototype.hitServer = function(url, isAsync) {
      var tempObj = this;
      isAsync = (isAsync) ? isAsync : true;

      // A small example of object
      var core = {

            // Method that performs the ajax request
            ajax: function (method, url, args, headerSetterFunction) {

                  // Creating a promise
                  var promise = new Promise( function (resolve, reject) {

                        // Instantiates the XMLHttpRequest
                        var client = new XMLHttpRequest();
                        var uri = url;

                        client.open(method, uri, isAsync);

                        if(typeof headerSetterFunction === "function"){
                            headerSetterFunction(client);
                        }

                        if (args && (method === 'POST' || method === 'PUT')) {
                            client.send(args);
                        } else {
                              client.send();
                        }

                        client.onload = function () {
                              if (this.status >= 200 && this.status < 300) {
                                    // Performs the function "resolve" when this.status is equal to 2xx
                                    var response = JSON.parse(this.response);
                                    switch(response.responseCode) {
                                          case "ER_001":
                                            alert("No Agent Available");
                                            // tempObj.closeAllConnections();
                                            break;
                                          default:
                                                resolve(response.responseValue, response);
                                          break;
                                    }
                              } else {
                                    // Performs the function "reject" when this.status is different than 2xx
                                    reject(this.statusText);
                              }
                        };

                        client.onerror = function () {
                              reject(this.statusText);
                        };
                  });

                  // Return the promise
                  return promise;
            }
      };

      // Adapter pattern
      return {
            'get': function(args) {
                  return core.ajax('GET', url, args);
            },
            'post': function(args, headerSetter) {
                  return core.ajax('POST', url, args, headerSetter);
            },
            'put': function(args) {
                  return core.ajax('PUT', url, args);
            },
            'delete': function(args) {
                  return core.ajax('DELETE', url, args);
            }
      };
};

Rtc.prototype.trace = function(text1, text2, text3) {
      console.log((performance.now() / 1000).toFixed(3) + " : " + text1 + " : " + text2 + " : " + text3);
};

Rtc.prototype.emptyFunction = function() {

};
