var store = require('./store/fluxiRTCStore').appStore;
module.exports = class media{
  constructor(){
    this.localStream = "";
    this.mediaReady = false;
    // To keep track of audio/video muted
    this.isVideoMuted = false;
    this.isAudioMuted = false;
    this.isFullScreen = false;
  }
  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }
  /****************************************************************************
  * User media (webcam, audio) functions
  ****************************************************************************/
  activateUserMedia(){
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

        var tempCallTime = store.room.user.callAttendTime;

        // Creating and setting an custom event
        document.addEventListener("afterGettingMedia", fluxiRTC.eventHandlrs.afterGettingMedia);
        var afterGettingMedia = new CustomEvent("afterGettingMedia", {
          detail: {
            userId: store.room.user.userId,
            firstName: store.room.user.firstName,
            callAttendTime: tempCallTime,
            stream: stream
          }
        });
        document.dispatchEvent(afterGettingMedia);

        // Other activities
        this.localStream = stream;
        this.mediaReady = true;
        fluxiRTC.openChannel(store.room.user.channelToken);
      }).bind(this))
      .catch(function (err) {
        console.log(err);
        tempObj.trace("Client" ,"Error", "Failed opening user media.");
      });
    } catch (e) {
      alert("Oops! seems like your browser does't support video connections. please try opening the site with latest version of chrome or firefox");
      console.log(err);
    }
  }

  videoToggleHandler() {
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
        document.removeEventListener("afterVideoMute", fluxiRTC.eventHandlrs.afterVideoMute);
        document.addEventListener("afterVideoMute", fluxiRTC.eventHandlrs.afterVideoMute);
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
  }
  audioToggleHandler() {
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
        document.removeEventListener("afterAudioMute", fluxiRTC.eventHandlrs.afterAudioMute);
        document.addEventListener("afterAudioMute", fluxiRTC.eventHandlrs.afterAudioMute);
        var afterAudioMute = new CustomEvent("afterAudioMute", {
              detail: {
                    userId: tempObj.room.user.userId,
                    firstName: tempObj.room.user.firstName,
                    state: state
              }
        });
        document.dispatchEvent(afterAudioMute);

        tempObj.isAudioMuted = !tempObj.isAudioMuted;

  }
  fullScreenToggleHandler() {
  var tempObj = this;
  document.getElementById(tempObj.fullScreenToggleButton).classList.toggle("inactive");
  if(tempObj.isFullScreen){
    tempObj.isFullScreen = false;
    document.cancelFullScreen()
  } else {
    tempObj.isFullScreen = true;
    document.body.requestFullScreen();
  }
}
}
