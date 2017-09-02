var Store = function(){
  this.localStream = "";
  this.localPeerConnection = "";
  this.remotePeerConnection = "";
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
