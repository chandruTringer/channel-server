var EventEmitter = require('events').EventEmitter;
var {set, isOfType} = require('./fluxi').fx;
var hitServer = require('./hitServer');

var media = require('./media');
var signaller = require('./signaller');
var webRTCDataChannel = require('./webRTCDataChannel');
var webRTC = require('./webRTC');
var _fluxiRTCStore = require('./store/fluxiRTCStore');

class fluxiRTC extends EventEmitter{
  constructor(){
    super();
    this.media = new media();
    this.signaller = new signaller();
    this.webRTCDataChannel = new webRTCDataChannel();
    this.webRTC = new webRTC();
    this.hitServer = hitServer;
  }
  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }
  startWebrtcSteps(){
    this.media.activateUserMedia();
  }
  openChannel(){
    this.signaller._openChannel();
  }
  emptyFunction() {}
  initCustomHandlrs(params){
    var tempObj = this;
    // Handlers initiation
    var validator = {
      set: function(obj, prop, value) {
        if (!isOfType(value, "function")) {
          throw new TypeError('The age is not an integer');
        }
        // The default behavior to store the value
        obj[prop] = value;

        // Indicate success
        return true;
      }
    };

    var eventHandlrs = new Proxy({},validator);
    eventHandlrs.afterGettingUser = set(params.afterGettingUser,tempObj.emptyFunction);
    eventHandlrs.afterGettingMedia = set(params.afterGettingMedia,tempObj.emptyFunction);
    eventHandlrs.afterOpeningChannel = set(params.afterOpeningChannel,tempObj.emptyFunction);
    eventHandlrs.afterUserInRoom = set(params.afterUserInRoom,tempObj.emptyFunction);
    eventHandlrs.afterReceivingOffer = set(params.afterReceivingOffer,tempObj.emptyFunction);
    eventHandlrs.afterReceivingAnswer = set(params.afterReceivingAnswer,tempObj.emptyFunction);
    eventHandlrs.afterAudioToggle = set(params.afterAudioToggle,tempObj.emptyFunction);
    eventHandlrs.afterVideoToggle = set(params.afterVideoToggle,tempObj.emptyFunction);
    eventHandlrs.afterAudioMute = set(params.afterAudioMute,tempObj.emptyFunction);
    eventHandlrs.afterVideoMute = set(params.afterVideoMute,tempObj.emptyFunction);
    eventHandlrs.afterTextMessage = set(params.afterTextMessage,tempObj.emptyFunction);
    eventHandlrs.afterClosingConnections = set(params.afterClosingConnections,tempObj.emptyFunction);
    eventHandlrs.afterReceivingStream = set(params.afterReceivingStream,tempObj.emptyFunction);
    eventHandlrs.afterRemoteLeaving = set(params.afterRemoteLeaving,tempObj.emptyFunction);
    eventHandlrs.madeToWait = set(params.madeToWait,tempObj.emptyFunction);

    return eventHandlrs;
  }
  init(params) {
    var tempObj = this;
    var store = _fluxiRTCStore.appStore;
    var media = tempObj.media;

    try {
      params = set(params,{});
      store.callButton = set(params.callButton,"@EMPTY_VALUE");
      store.hangupButton = set(params.hangupButton,"@EMPTY_VALUE");
      store.videoToggleButton = set(params.videoToggleButton,"@EMPTY_VALUE");
      store.audioToggleButton = set(params.audioToggleButton,"@EMPTY_VALUE");
      store.apiBaseUrl = set(params.apiBaseUrl, "@EMPTY_VALUE");
      store.roomAndUserUrl = set(params.roomAndUserUrl, "@EMPTY_VALUE");
      store.messageUrl = set(params.messageUrl,"@EMPTY_VALUE");
      store.roomAndUserUrl = store.apiBaseUrl + store.roomAndUserUrl;
      store.messageUrl = store.apiBaseUrl + store.messageUrl;
      store.formId = set(params.formId,"@EMPTY_VALUE");
      store.chat = set(params.chat, false);
      store.chatField = set(params.chatField,"");

      if(!document.getElementById(store.formId)) {
        throw "Form not specified or Form element does not exist.";
      }

      if(store.chat === true) {
        if(store.chatField === "@EMPTY_VALUE")
        {
          throw "When chat parameter is set to true, chatField cannot be empty.";
        } else {
          if(document.getElementById(store.chatField)) {
            document.getElementById(store.chatField).onkeyup = function(e) {
              var chatType = document.getElementById(store.chatField);
              e = e || event;
              if (e.keyCode === 13 && !e.ctrlKey) {
                var textAreaMsg = chatType.value;
                chatType.value = "";
                webRTCDataChannel.composeDataChannelMsgs(textAreaMsg, "");
              }
              return true;
            };
          } else {
            throw "chatField element does not exist.";
          }
        }
      }

      tempObj.eventHandlrs = tempObj.initCustomHandlrs(params);

      if(store.formId !== "@EMPTY_VALUE") {
        document.getElementById(store.callButton).onclick = function(event) {
          event.preventDefault();
          var formData = new FormData(document.getElementById(store.formId));

          var server = tempObj.hitServer(store.roomAndUserUrl);
          server.post(formData)
          .then(function (responseData, reponseDataError) {
            var roomData = responseData;
              var isAgentSwitched = (responseData.previousAgentId);
            if(roomData.roomId && roomData.userDetail) {
              var storeRoom = {};
              storeRoom.roomId = roomData.roomId;
              storeRoom.roomName = roomData.roomName;
              storeRoom.user = roomData.userDetail;
              storeRoom.user.callAttendTime = new Date();
              storeRoom.user.connections = {}; // Holding all users peer connections
              if(storeRoom.user.agent){
                storeRoom.user.isFirstCaller = true;
                storeRoom.hostId = roomData.userDetail.userId;
              } else {
                storeRoom.hostId = roomData.roomHostUserId;
              }
              storeRoom.user.callStage = 0;
              store.currentConnections = store.recurrentConnections + 1;
              if(isAgentSwitched){
                storeRoom.user.previousConnectionsDetail = {
                  type: "switchAgent",
                  agentId: responseData.previousAgentId,
                  firstName: responseData.userDetail.firstName,
                  lastname: responseData.userDetail.lastName,
                  email: responseData.userDetail.email,
                  userId: storeRoom.user.userId
                };
                if(responseData.callerDetails){
                  storeRoom.user.previousConnectionsDetail.sendTo = responseData.callerDetails[0].userId;
                }
              }
              tempObj.trace("Client", "Message", "User hosting chat room.");
              store.room = storeRoom;
              var userDetail = store.room.user;
              if(!roomData.userDetail.agent){
                if(media.mediaReady) {
                signaller.sendMessage({
                  type: "inRoom",
                  userId: userDetail.userId,
                  firstName: userDetail.firstName,
                  lastname: userDetail.lastName,
                  email: userDetail.email
                });
                  tempObj.trace("Client", "Message", "In room message sent.");
                }
              }

              // Creating and setting an custom event
              document.removeEventListener("afterGettingUser", tempObj.eventHandlrs.afterGettingUser);
              document.addEventListener("afterGettingUser", tempObj.eventHandlrs.afterGettingUser);
              var afterGettingUser = new CustomEvent("afterGettingUser", {
                detail: {
                  roomDetails: store.room
                }
              });
              document.dispatchEvent(afterGettingUser);

              tempObj.startWebrtcSteps();
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

      document.getElementById(store.videoToggleButton).onclick = (media.videoToggleHandler).bind(this);
      document.getElementById(store.audioToggleButton).onclick = (media.audioToggleHandler).bind(this);

      window.onbeforeunload = function(e) {
        if(tempObj.currentConnections > 1) {
          var lveMsg = "Leaving this page will end current call due to security reasons";
          e.returnValue = lveMsg;
          tempObj.closeAllConnections(false);
          return e;
        } else {
          tempObj.closeConnection(false);
        }
      };
      document.getElementById(store.hangupButton).onclick = function() {

        if(store.currentConnections > 1) {
          tempObj.closeAllConnections();
        } else {
          tempObj.closeConnection();
        }
      };

    } catch(err) {
      tempObj.trace("Client", "Error", err);
      tempObj.trace("Client", "Error", "Execution stopped due to errors.");
      return;
    }

    return tempObj;
  }

  closeAllConnections(isAsync, isTerminated) {
        isAsync = isset(isAsync) ? isAsync : true;
        var tempObj = this;
        var store = _fluxiRTCStore.appStore;
        var storeRoom = store.room;
        for(var key in storeRoom.user.connections) {
              if(storeRoom.user.connections[key].peerConnection) {
                    storeRoom.user.connections[key].peerConnection.close();
              }
              delete storeRoom.user.connections[key];
              // TODO:datachannelclose tempObj.dataChannel[key].close();
        }
        tempObj.media.localStream.getAudioTracks()[0].stop();
        tempObj.media.localStream.getVideoTracks()[0].stop();
        tempObj.media.localStream = null;
        if(!isTerminated && (rtc.room.user.agent || rtc.room.user.waiting)){
          var url = tempObj.apiBaseUrl + "user/remove/" + storeRoom.roomId + "/" + storeRoom.user.userId;
          tempObj.hitServer(url, isAsync)
          .get(storeRoom.user.userId)
          .then(function () {
            tempObj.trace("Server", "Message", "User successfully deleted.");
          })
          .catch(function () {
            tempObj.trace("Server", "Error", "Delete user failed.");
          });

          tempObj.currentConnections = 1;
        }

        tempObj.signaller.socket.close();

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
  }
  closeConnection(isAsync) {
        isAsync = isset(isAsync) ? isAsync : true;
        var tempObj = this;
        var empty = {};
        var store = _fluxiRTCStore.appStore;
        var storeRoom = store.room;
        tempObj.media.localStream.getAudioTracks()[0].stop();
        tempObj.media.localStream.getVideoTracks()[0].stop();
        tempObj.media.localStream = null;
        tempObj.signaller.socket.close();
        if(store.room.user.agent || store.room.user.waiting){
          var url = store.apiBaseUrl + "user/remove/" + storeRoom.roomId + "/" + storeRoom.user.userId;
          tempObj.hitServer(url, isAsync)
          .get(storeRoom.user.userId)
          .then(function () {
            tempObj.trace("Server", "Message", "User successfully deleted.");

            // Flow for switching to the next user in queue

          })
          .catch(function () {
          tempObj.trace("Server", "Error", "Delete user failed.");
          });

          tempObj.currentConnections = 1;
        }
        tempObj.eventHandlrs.afterClosingConnections.call(empty);
  }
  
  afterCallAccepted(tempMsg){
  	var tempObj = this;
    var store = _fluxiRTCStore.appStore;
    var currentUser = store.room.user;
    var isAgent = currentUser.agent;
    var isNewCustomer = (!currentUser.connections[tempMsg.userId] && isAgent);
    var isReconnection = (tempMsg.command === "reconnect" || tempMsg.type === "reconnect");
  	if(isNewCustomer || isReconnection) {
          tempObj.trace("Client", "Message", ("User in room: " + tempMsg.userId));
          tempObj.webRTC.createPeerConnection(tempMsg, "offer");
          if(!currentUser.isBusyWith || isReconnection) {
                tempObj.webRTCDataChannel.dataChannelCalls(currentUser.connections[tempMsg.userId].peerConnection, tempMsg.userId);
                tempObj.webRTC.doCallTo(tempMsg.userId);
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

  afterCallDeclined(tempMsg){
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
  }

  showWaitingStatus(tempMsg, tempObj){
    // Creating and setting a custom event
    document.removeEventListener("madeToWait", tempObj.eventHandlrs.madeToWait);
    document.addEventListener("madeToWait", tempObj.eventHandlrs.madeToWait);
    var madeToWait = new CustomEvent("madeToWait", {
          detail: {
                userId: tempMsg.userId,
                firstName: tempMsg.firstName
          }
    });

    document.dispatchEvent(madeToWait);
  }

  afterDeletingCurrentCustomer(tempMsg, responseData){
  	var tempObj = this;
      var userId = tempMsg.userId;
      var store = _fluxiRTCStore.appStore;
      var currentUser = store.room.user;
      var connections = currentUser.connections;
      var firstName = connections[userId].firstName;
      var type = tempMsg.type;
        if(responseData !== undefined){
              tempObj.trace("Server", "Message", "User successfully deleted.");
              tempObj.trace("Client", "Message", ("User in room: " + responseData));


              if(type == "bye"){
                var callAttendTime = connections[tempMsg.userId].callAttendTime;
                tempObj.currentConnections = tempObj.currentConnections - 1;

                tempObj.webRTCDataChannel.dataChannel[tempMsg.userId].close();
                delete connections[tempMsg.userId];
                delete tempObj.webRTCDataChannel.dataChannel[tempMsg.userId];
                // Creating and setting an custom event
                document.removeEventListener("afterRemoteLeaving", tempObj.eventHandlrs.afterRemoteLeaving);
                document.addEventListener("afterRemoteLeaving", tempObj.eventHandlrs.afterRemoteLeaving);
                var afterRemoteLeaving = new CustomEvent("afterRemoteLeaving", {
                  detail: {
                    userId: userId,
                    firstName: firstName,
                    callAttendTime: callAttendTime,
                    userDetails: currentUser
                  }
                });
                document.dispatchEvent(afterRemoteLeaving);
              } else if(type == "inRoom"){
                // Do nothing
                // It means call was not picked by the agent
              } else {
                tempObj.currentConnections = tempObj.currentConnections - 1;

                tempObj.webRTCDataChannel.dataChannel[tempMsg.userId].close();
                delete tempObj.room.user.connections[tempMsg.userId];
                delete tempObj.webRTCDataChannel.dataChannel[tempMsg.userId];
              }
              if(!tempObj.room.user.connections[responseData]){
                tempObj.sendMessage({
                  type: "connect",
                  userId: currentUser.userId,
                  sendTo: responseData
                });
              } else {
                tempObj.dataChannelCalls(tempObj.room.user.connections[responseData].peerConnection, responseData);
                tempObj.webRTC.doCallTo(responseData);
                connections[responseData].makeCall = true;
                currentUser.isBusyWith = responseData;
                currentUser.callStage++;
              }

              document.removeEventListener("afterUserInRoom", tempObj.eventHandlrs.afterUserInRoom);
              document.addEventListener("afterUserInRoom", tempObj.eventHandlrs.afterUserInRoom);
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
                          userDetails: currentUser
                    }
              });
              document.dispatchEvent(afterRemoteLeavingEvent);
              mze().makeToast({
                    textMessage: "Waiting for Customers to join",
                    position: "top-left"
              });
        }
  }

  deleteCurrentCustomer(tempMsg){
  	var tempObj = this;
    var store = _fluxiRTCStore.appStore;
    var currentUser = store.room.user;
  	currentUser.callStage = 0;
      currentUser.isBusyWith = null;
      var url = tempObj.apiBaseUrl + "user/remove/" + store.room.roomId + "/" + tempMsg.userId;
      tempObj.trace("Client", "Delete Request", store.room.roomId);
      tempObj.hitServer(url)
        .get(currentUser.userId)
        .then(function (responseData) {
        	tempObj.afterDeletingCurrentCustomer(tempMsg,responseData);
        })
        .catch(function () {
            tempObj.trace("Server", "Error", "Delete user failed.");
        });
  }
}

global.fluxiRTC = new fluxiRTC();
