var {dispatcher,fx} = require('./fluxi');

var store = require('./store/fluxiRTCStore');

var actions = store.actions;

var fluxiRTCDispatcher = new dispatcher();

fluxiRTCDispatcher.register(function(tempMsg) {
  console.log(tempMsg);
  switch(tempMsg.type) {
    case "inRoom":
      actions.handleInRoom.call(store,tempMsg);
      break;
    case "reconnect":
      actions.handleReconnect.call(store,tempMsg);
      break;
    case "wait":
      actions.handleWait.call(store,tempMsg);
      break;
    case "offer":
      actions.handleOffer.call(store,tempMsg);
      break;
    case "answer":
      actions.handleAnswer.call(store,tempMsg);
      break;
    case "candidate":
      actions.handleCandidate.call(store,tempMsg);
      break;
    case "audioToggle":
      actions.handleAudioToggle.call(store,tempMsg);
      break;
    case "switchRoom":
      actions.handleSwitchRoom.call(store,tempMsg);
      break;
    case "videoToggle":
      actions.handleVideoToggle.call(store,tempMsg);
      break;
    case "connect":
      actions.handleConnect.call(store,tempMsg);
      break;
    case "switchAgent":
      actions.handleSwitchAgent.call(store,tempMsg);
      break;
    case "terminate":
      actions.handleTerminate.call(store,tempMsg);
      break;
    case "bye":
      actions.handleBye.call(store,tempMsg);
      break;
    default:
      tempObj.trace("Server", "Error", "Message type is invalid!");
      break;
  }
});

module.exports = fluxiRTCDispatcher;
