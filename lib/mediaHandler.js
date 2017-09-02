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
