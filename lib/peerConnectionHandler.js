var EventEmitter = require('events');
var store = require('./store');
/****************************************************************************
* Call Handling WebRTC functions(PeerConnection)
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
      if(!tempObj.room.user.connections[userId].candidatesReceived) {
            tempObj.room.user.connections[userId].candidatesReceived = [];
      }
      var lenIce = tempObj.room.user.connections[userId].candidatesReceived.length;
      (function () {
            var keepLen = lenIce;
            for(var i = 0; i < keepLen; i++) {
                  var cmsg = tempObj.room.user.connections[userId].candidatesReceived.pop();
                  var candidate = new RTCIceCandidate({
                        sdpMLineIndex : cmsg.label,
                        candidate : cmsg.candidate
                  });
                  tempObj.room.user.connections[userId].peerConnection.addIceCandidate(candidate);
            }
      })();
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
