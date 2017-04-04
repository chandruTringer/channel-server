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
