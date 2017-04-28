var store = require('./store/fluxiRTCStore').appStore;
module.exports = class webRTC{
  constructor(){
    this.localPeerConnection = "";
    this.remotePeerConnection = "";
    this.configuration = {
      'iceServers': [{
        'url': 'stun:stun1.l.google.com:19302'
      }]
    };

    // My peer connection object
    this.peerConnection = null;

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

    // Number of connections in room for user
    this.currentConnections = 0;

    this.peerConnection = null;

    this.callStages = ["Free", "Offer", "Answer", "Connected Successfully"];
  }

  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }

  createPeerConnection(inRoomMsg){
    var tempObj = this;
    var remoteUserId = inRoomMsg.userId;
    var pc = tempObj.peerConnection;
    var connections = store.room.user.connections;
    pc = new RTCPeerConnection(tempObj.configuration);
    pc.onicecandidate = (function(e) { tempObj.onIceCandidate(e); });
    pc.addStream(fluxiRTC.media.localStream);
    pc.onaddstream = (function(e) { tempObj.onRemoteStreamAdded(e, remoteUserId); });
    connections[remoteUserId] = store.room.user.connections[remoteUserId] || {};
    connections[remoteUserId].firstName = inRoomMsg.firstName;
    connections[remoteUserId].lastName = inRoomMsg.lastName;
    connections[remoteUserId].email = inRoomMsg.email;
    connections[remoteUserId].connected = false;
    connections[remoteUserId].peerConnection = pc;
    connections[remoteUserId].makeCall = false;
    connections[remoteUserId].videoTracks = fluxiRTC.media.localStream.getVideoTracks();
    connections[remoteUserId].audioTracks = fluxiRTC.media.localStream.getAudioTracks();
  }

  getConstraints(){
    return this.mergeConstraints(this.offerConstraints, this.sdpConstraints);
  }

  doCallTo(remoteUserId){
    var tempObj = this;
    var storeRoom = store.room;
    var connections = storeRoom.user.connections;
    var constraints = tempObj.getConstraints();
    var createOfferSuccess = function(e){
      tempObj.setLocalAndSendMessage(e, storeRoom.user.userId, remoteUserId);
    };
    var createOfferFailure = function(){
      trace("Client", "Error", ("Sending offer failed to user: " + remoteUserId));
    };
    connections[remoteUserId].peerConnection.createOffer(
      createOfferSuccess,
      createOfferFailure,
      store.constraints
    );
  }

  doAnswerTo(remoteUserId){
    var tempObj = this;
    var currentUser = store.room.user;
    var connections = currentUser.connections;
    currentUser.waiting = false;
    var doAnswerSuccess = function(e) {
      tempObj.setLocalAndSendMessage(e, currentUser.userId, remoteUserId);
    };
    var doAnswerFailure = function(e) {
      trace("Client", "Error", ("sending offer failed to user: " + remoteUserId));
    };
    var constraints = tempObj.getConstraints();
    connections[remoteUserId].peerConnection.createAnswer(
      doAnswerSuccess,
      doAnswerFailure,
      store.constraints
    );
  }

  setLocalAndSendMessage(sessionDescription, userId, remoteUserId){
    var tempObj = this;
    var currentUser = store.room.user;
    var connections = currentUser.connections;
    var remotePeerConnection = connections[remoteUserId].peerConnection;
    var setLocalDescriptionSuccess = function() {
      tempObj.trace(
        "Client",
        "Message",
        "Setting session description success for user: " + userId
      );
    };
    var setLocalDescriptionFailure = function() {
      tempObj.trace(
        "Client",
        "Error",
        "Setting session description failed for user: " + userId
      );
    };
    remotePeerConnection.setLocalDescription(
      sessionDescription,
      setLocalDescriptionSuccess,
      setLocalDescriptionFailure
    );
    fluxiRTC.signaller.sendMessage({
      description: sessionDescription,
      sendTo: remoteUserId,
      type: sessionDescription.type,
      firstName: currentUser.firstName,
      lastname: currentUser.lastName,
      email: currentUser.email,
      userId: userId
    });
  }

  setRemote(message, remoteUserId){
    var tempObj = this;
    var currentUser = store.room.user;
    var connections = currentUser.connections;
    var setRemoteDescriptionSuccess = function(){
      tempObj.pushIceCandidates(remoteUserId);
      tempObj.currentConnections = tempObj.currentConnections + 1;
      tempObj.trace(
        "Client",
        "Message",
        "Remote session description successfully set for user:" + remoteUserId
      );
    };
    var setRemoteDescriptionFailure = function(){
      tempObj.trace(
        "Client",
        "Error",
        "Setting remote description failed for user: " + remoteUserId
      );
    };
    connections[remoteUserId].peerConnection.setRemoteDescription(
      new RTCSessionDescription(message),
      setRemoteDescriptionSuccess,
      setRemoteDescriptionFailure
    );
  }

  mergeConstraints(cons1, cons2){
    var merged = cons1;
    for ( var name in cons2.mandatory) {
      merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
  }

  /****************************************************************************
  * iceCandidates handling
  ****************************************************************************/
  pushIceCandidates(userId){
    var tempObj = this;
    var currentUser = store.room.user;
    var connections = currentUser.connections;
    if(!connections[userId].candidatesReceived) {
      connections[userId].candidatesReceived = [];
    }
    var lenIce = connections[userId].candidatesReceived.length;
    (function () {
      var keepLen = lenIce;
      for(var i = 0; i < keepLen; i++) {
        var cmsg = connections[userId].candidatesReceived.pop();
        var candidate = new RTCIceCandidate({
          sdpMLineIndex : cmsg.label,
          candidate : cmsg.candidate
        });
        connections[userId].peerConnection.addIceCandidate(candidate);
      }
    })();
    connections[userId].answered = true;
  }

  onRemoteStreamAdded(event, userId){
    var tempObj = this;
    tempObj.trace("Client", "Message", ("Remote video stream received from user: " + userId));
    store.room.user.callStage++;

    // Creating and setting an custom event
    document.removeEventListener("afterReceivingStream", fluxiRTC.eventHandlrs.afterReceivingStream);
    document.addEventListener("afterReceivingStream", fluxiRTC.eventHandlrs.afterReceivingStream);
    var afterReceivingStream = new CustomEvent("afterReceivingStream", {
      detail: {
        userId: userId,
        firstName: store.room.user.connections[userId].firstName,
        callAttendTime: store.room.user.connections[userId].callAttendTime,
        stream: event.stream
      }
    });
    document.dispatchEvent(afterReceivingStream);
  }


  onIceCandidate(event){
    var tempObj = this;
    var currentUser = store.room.user;
    if (event.candidate) {
      fluxiRTC.signaller.sendMessage( {
        type : 'candidate',
        label : event.candidate.sdpMLineIndex,
        id : event.candidate.sdpMid,
        sendTo: currentUser.isBusyWith,
        candidate : event.candidate.candidate,
        userId: currentUser.userId
      });
    } else {
    }
  }
}
