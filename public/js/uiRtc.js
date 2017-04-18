window.candidateCount = 0;
window.backOffStatus = [];
window.addEventListener('load', function(e) {
  window.addEventListener('online',  onlineHandler);
  window.addEventListener('offline', offlineHandler);
	updateOnlineStatus(e);
});

function updateOnlineStatus(e) {
	var condition = navigator.onLine ? "online" : "offline";
  console.log(e,"Online :"+condition);
	if(condition === "online"){
    window.ONLINE = true;
		setOnlineStatus(true);
	} else {
    window.ONLINE = false;
		setOnlineStatus(false);
	}
}

function onlineHandler(){
  if(window.backOffTimerId && rtc.room.user && rtc.room.user.isBusyWith){
    mze().makeToast({
      textMessage: "Please wait we are reconnecting you call.",
      position: "top-left"
    });
    clearTimeout(window.backOffTimerId);
    console.log(window.backOffTimerId);
  }
  window.ONLINE = true;
  setOnlineStatus(true,true);
}

function offlineHandler(){
  window.ONLINE = false;
  setOnlineStatus(false,true);
}

function updateOnlineIndicator(online){
  var onlineIndicator = document.getElementById('icon-online');
  if(online){
    onlineIndicator.classList.add("online");
  } else {
    onlineIndicator.classList.remove("online");
  }
}

function setOnlineStatus(status,enableReconnection){
	if(status){
    updateOnlineIndicator(true);
    if(enableReconnection){
      window.reconnectTimer = setTimeout(function(){
        reconnectWithPeer();
      },5000);
    }
	} else {
    updateOnlineIndicator(false);
		setBackoffStatus( new Date().getTime() );
	}
}

function checkStatusAfterLastBackOff() {
  if(rtc.room.user && rtc.room.user.isBusyWith){
    console.log("Exceeded duration");
    alert("Poor network, Please check your internet connection");
    rtc.closeAllConnections(
      null,
      true
    );
    mze().makeToast({
      textMessage: "Your call is being redirected",
      position: "top-left"
    });
  } else {
    console.log("User not in connection");
  }
}

function setBackoffStatus(value){
	window.backOffStatus.push(value);
  mze().makeToast({
    textMessage: "Please check your internet connection. We will try to reconnect, if we get internet within 32s",
    position: "top-left"
  });
	window.backOffTimerId = setTimeout(function(){
		checkStatusAfterLastBackOff();
	},32000);
	console.log(window.backOffTimerId);
}

function reconnectWithPeer(){
  clearTimeout(window.reconnectTimer);
  if(rtc.room.user && rtc.room.user.isBusyWith){
    var videoDomSelector = "div-"+rtc.room.user.isBusyWith;
    try{
      videoDom = document.getElementById(videoDomSelector);
      videoDom.parentNode.removeChild(videoDom);
      rtc.room.connections = {};
    } catch(e){
      console.log(e.stack);
    }
    rtc.sendMessage({
        type: "reconnect",
        userId: rtc.room.user.userId,
        firstName: rtc.room.user.firstName,
        lastname: rtc.room.user.lastName,
        email: rtc.room.user.email,
        sendTo: rtc.room.user.isBusyWith
    });
  }
}


document.getElementById('chat-msg-box').disabled = true;

var Template = {
	getIncomingCallTemplate: function(data){
		return '<div class="incoming-call-wrapper">'
			+'<div class="inner-content">'
				+'<div class="incoming-call-header">'
					+'<div class="header-title">Incoming call</div>'
						+'<div class="header-content">'
							+'<div class="user-name">'+data.firstName+'</div>'
							+'<div class="location">'+data.email+'</div>'
						+'</div>'
					+'</div>'
				+'</div>'
				+'<div class="incoming-call-body">'
					+'<div class="body-wrapper">'
						+'<div class="button-wrapper">'
							+'<div class="btn decline">Decline</div>'
							+'<div class="btn accept">Accept</div></div>'
						+'</div>'
					+'</div>'
				+'</div>'
			+'</div>'
		+'</div>';
	},
	getSpinnerTemplate: function(){
		return '<div class="dialog-load-spinner">'
        			+'<svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">'
        				+'<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>'
        			+'</svg>'
        		+'</div>';
	},
	getWaitingText: function(){
		return '<div class="title" style="text-align: center;font-size: 16px;margin: 20px 0px 0px;">'
	  				+'Hold on, Your call is getting connected'
	  			+'</div>';
	},
	getWaitingQueueList: function(data){
		return '<div id="waiting-queue">'
							+'<div class="title">'
								+'<span id="" class="chat-heading-text">Waiting Queue</span>'
							+'</div>'
							+Template.waitingQueueSigleUser(data)
						+'</div>';
	},
	getWaitingQueueSingleList: function(data){
		return '<div class="">'
							+'<span class="chat-online">'
								+'<span class="material-icons online" id="icon-online">fiber_manual_record</span>'
							+'</span>'
							+'<span id="chat-heading-text" class="chat-heading-text">'+data.firstName+'</span>'
						+'</div>';
	},
	getWaitingSpinner:function(data){
		return Template.getWaitingText(data)+Template.getSpinnerTemplate(data);
	}
}

function logConsole() {

}

function isset(value){
  return (value !== undefined && value !== null);
}


function setRoomForCall(event) {
  var message;
  /* Closing form */
  document.getElementById('call-cover').style.display = "none";
  if (event.detail.roomDetails.user.agent) {
    message = "Waiting for customers to join the call.";
  } else {
    message = "Searching for agents.";
  }
  mze().makeToast({
    textMessage: message,
    position: "top-left"
  });
}

function feedMediaToTag(event) {
  var stream = event.detail.stream;
  var videoTrack = stream.getVideoTracks();
  if(videoTrack !== undefined) {
    document.getElementById('current-video').src = URL.createObjectURL(stream);
    var miniVideo = createVideoTag(event.detail.userId, event.detail.firstName, event.detail.callAttendTime);
    var tempHolder = "div-" + miniVideo.getAttribute("id");
    miniVideo.src = URL.createObjectURL(stream);
    document.getElementById('current-video').src = URL.createObjectURL(stream);
    document.getElementById('current-video').className = "";
    document.getElementById(tempHolder).classList.remove("invisible");
    document.getElementById('current-video').classList.add(tempHolder);
  } else {
    if(videoTrack.length > 0 || videoTrack.muted === true) {
    } else {
      if(tempVideo.length > 0) {
        if (tempVideo.mute === true) {
          event.state = "off";
          doVideoToggle(event);
        }
      } else {
        event.state = "off";
        doVideoToggle(event);
      }
    }
  }
}

function createVideoTag(id, firstName, callAttendTime) {
  var holder = document.getElementById('mini-media-holder');
  var divNoVideo = document.createElement("div");
  var divNoVideoName = document.createElement("div");
  var divVideoNameTxt = document.createElement("div");
  var divVideoName = document.createElement("div");
  divNoVideo.classList.add("mini-videos-holder-no-video");
  divNoVideo.id = "mini-video-" + id;
  divNoVideoName.classList.add("vertical-center");
  divVideoName.classList.add("mini-videos-holder-name");
  divVideoNameTxt.innerText = firstName;
  divNoVideoName.id = "div-no-video-name-" + id;
  var div = document.createElement("div");
  div.classList.add("single-mini-video");
  var video = document.createElement("video");
  video.autoplay = true;
  video.id = id;
  video.height = 150;
  video.width = 200;
  video.draggable = true;
  div.appendChild(video);
  divVideoName.appendChild(divVideoNameTxt);
  div.appendChild(divVideoName);
  div.appendChild(divNoVideo);
  divNoVideo.appendChild(divNoVideoName);
  div.classList.add("invisible");
  div.id = "div-" + id;
  div.onclick = (streamAsMainVideo).bind(div, id, firstName, callAttendTime);
  holder.appendChild(div);
  return document.getElementById(id);
}

function streamAsMainVideo(id, firstName, callAttendTime) {
  var _this = this;
  document.getElementById('current-video').src = _this.firstElementChild.src;
  document.getElementById('current-video').className = "";
  document.getElementById('current-video').classList.add(_this.id);
  var tempId = "mini-video-" + _this.firstElementChild.id;
  if (document.getElementById(tempId).style.display == "block") {
    changeForNoVideo(_this.firstElementChild.id, firstName, callAttendTime, "off");
  }
  else {
    changeForNoVideo(_this.firstElementChild.id, firstName, callAttendTime, "on");
  }
}

function doAudioToggle(event) {
  console.log("Audio toggle UI changes");
}

function doVideoToggle(event) {
  var userId = event.detail.userId, state = event.detail.state;

  if (checkVideo(userId) == userId) { // If main video is this user's video
    changeForNoVideo(userId, event.detail.firstName, event.detail.callAttendTime, event.detail.state);
  }

  if (state == "off") {
    document.getElementById(('mini-video-' + userId)).style.display = "block";
    document.getElementById(('div-no-video-name-' + userId)).innerHTML = '<span class="material-icons">videocam_off</span>';
  } else if (state == "on") {
    document.getElementById(('mini-video-' + userId)).style.display = "none";
  } else {

  }
}

function changeForNoVideo(userId, firstName, callAttendTime, state) {

  if (state == "off") {
    document.getElementById('call-video-substitute').style.display = "block";
    document.getElementById('video-components-name').innerText = firstName;
    clearTimeout(upTime.to);
    upTime(callAttendTime);
  } else if (state == "on") {
    document.getElementById('call-video-substitute').style.display = "none";
  } else {

  }

}

function checkVideo (userId) {
  var tempVar = document.getElementById('current-video').className;
  tempVar = tempVar.replace("div-", "");
  return tempVar;
}

function destroyLeavingStreams(event) {
  var leavingUserId = event.detail.userId;
  var tempDiv;
  var firstName;
  var callAttendTime;
  if(document.getElementById(("div-" + leavingUserId))){
    tempDiv = document.getElementById(("div-" + leavingUserId));
  } else {
    rtc.trace("Client","Exception","Its seems like there is no such video conversation element");
    return;
  }
  var miniVideosHolder = document.getElementById("mini-media-holder");
  var number = 0;

  miniVideosHolder.removeChild(tempDiv);
  if(document.getElementById('current-video').classList.contains(("div-" + leavingUserId))) {
    document.getElementById('current-video').classList.remove(("div-" + leavingUserId));
    document.getElementById('current-video').src = miniVideosHolder.lastChild.children[0].src;
    document.getElementById('current-video').classList.add(miniVideosHolder.lastChild.id);
    var tempId = "mini-video-" + miniVideosHolder.lastChild.firstChild.id;
    if (document.getElementById(tempId).style.display == "block") {
      firstName = (event.detail.userDetails.connections[miniVideosHolder.lastChild.firstChild.id] === 'undefined') ? event.detail.userDetails.firstName : event.detail.userDetails.connections[miniVideosHolder.lastChild.firstChild.id].firstName;
      callAttendTime = (event.detail.userDetails.connections[miniVideosHolder.lastChild.firstChild.id] === 'undefined') ? event.detail.userDetails.callAttendTime : event.detail.userDetails.connections[miniVideosHolder.lastChild.firstChild.id].callAttendTime;
      changeForNoVideo(miniVideosHolder.lastChild.firstChild.id, firstName, callAttendTime, "off");
    } else {
      changeForNoVideo(miniVideosHolder.lastChild.firstChild.id, firstName, callAttendTime, "on");
    }
  }

  for(var userId in event.detail.userDetails.connections) {
    if(number === 0) {
      document.getElementById('chat-heading-text').innerText = "";
    }
    document.getElementById('chat-heading-text').innerText = document.getElementById('chat-heading-text').innerText + event.detail.userDetails.connections[userId].firstName + ", ";
    number++;
  }

  if(number === 0) {
    chatHeadingOffline();
    document.getElementById('chat-msg-box').disabled = true;
  } else {
    document.getElementById('chat-heading-text').innerText = document.getElementById('chat-heading-text').innerText.slice(0, -1);
  }

  var message = event.detail.firstName + "'s call terminated.";
  mze().makeToast({
    textMessage: message,
    position: "top-left"
  });
}

var previousMsg = null;
function buildChatBox(event) {
  var stringMsg = event.detail.message, choice = event.detail.type;
  var message = JSON.parse(stringMsg);

  if(previousMsg) {
    if(checkSameDay(previousMsg.date, message.date)) {
      if(checkSameUser(previousMsg.userId, message.userId)) {
        if(checkSimilarTime(previousMsg.date, message.date)) {  // last Message was before 2 minutes
          appendToPreviousMessage(stringMsg, choice);
        } else {
          appendToDayBox(stringMsg, choice);
        }
      } else{
        appendToDayBox(stringMsg, choice);
      }
    } else{
      createNewDayBox(stringMsg, choice);
    }
  } else {
    createNewDayBox(stringMsg, choice);
  }
  previousMsg = message;
  updateScroll();
}

function appendToPreviousMessage(current, choice) {
  var chatMsgTextBox = document.getElementById('current-msg');
  var message = JSON.parse(current);
  chatMsgTextBox.innerHTML = chatMsgTextBox.innerHTML + "<hr>";
  chatMsgTextBox.innerHTML = chatMsgTextBox.innerHTML + message.message;
}

function appendToDayBox(current, choice) {
  if(document.getElementById('current-msg')) {
    document.getElementById('current-msg').removeAttribute("id");
  }
  var message = JSON.parse(current);
  var date = new Date(message.date);
  var ampm = (date.getHours >= 12)? 'PM' : 'AM';
  var chatDay = document.getElementById('current-day');
  var chatMsgHolder = createDiv("chat-msg-holder");
  var chatMsgOwner = createDiv("chat-msg-owner");
  var chatMsgTextHolder = createDiv("chat-msg-text-holder");
  var chatMsgTextBox = createDiv("chat-msg-text-box");
  var chatMsgTextTime= createDiv("chat-msg-text-time");
  var ownerPic = document.createElement("p");

  ownerPic.innerText = message.userName.charAt(0);
  chatMsgOwner.appendChild(ownerPic);

  chatMsgTextHolder.appendChild(chatMsgTextBox);
  chatMsgTextHolder.appendChild(chatMsgTextTime);
  chatMsgHolder.appendChild(chatMsgOwner);
  chatMsgHolder.appendChild(chatMsgTextHolder);
  chatDay.appendChild(chatMsgHolder);
  document.getElementById('chat-box').appendChild(chatDay);

  chatMsgTextBox.innerText = message.message;
  chatMsgTextTime.innerText = (date.getHours() % 12) + ":" + ((date.getMinutes()<10?'0':'') + date.getMinutes()) + "" + ampm;

  if(choice == "outgoing") {
    chatMsgHolder.classList.add("self-msg");
  }

  chatMsgTextBox.setAttribute("id", "current-msg");

}

function createNewDayBox(current, choice) {
  if(document.getElementById('current-day')) {
    document.getElementById('current-day').removeAttribute("id");
  }
  if(document.getElementById('current-msg')) {
    document.getElementById('current-msg').removeAttribute("id");
  }
  var message = JSON.parse(current);
  var date = new Date(message.date);
  var ampm = (date.getHours >= 12)? 'PM' : 'AM';
  var chatDay = createDiv("chat-day");
  var chatMsgDayHolder = createDiv("chat-msg-day-holder");
  var chatMsgHolder = createDiv("chat-msg-holder");
  var chatMsgOwner = createDiv("chat-msg-owner");
  var chatMsgTextHolder = createDiv("chat-msg-text-holder");
  var chatMsgTextBox = createDiv("chat-msg-text-box");
  var chatMsgTextTime= createDiv("chat-msg-text-time");
  var ownerPic = document.createElement("p");
  chatMsgDayHolder.innerText = date.toDateString();

  ownerPic.innerText = message.userName.charAt(0);
  chatMsgOwner.appendChild(ownerPic);

  chatMsgTextHolder.appendChild(chatMsgTextBox);
  chatMsgTextHolder.appendChild(chatMsgTextTime);
  chatMsgHolder.appendChild(chatMsgOwner);
  chatMsgHolder.appendChild(chatMsgTextHolder);
  chatDay.appendChild(chatMsgDayHolder);
  chatDay.appendChild(chatMsgHolder);
  document.getElementById('chat-box').appendChild(chatDay);

  chatMsgTextBox.innerText = message.message;
  chatMsgTextTime.innerText = (date.getHours() % 12) + ":" + ((date.getMinutes()<10?'0':'') + date.getMinutes()) + "" + ampm;

  if(choice == "outgoing") {
    chatMsgHolder.classList.add("self-msg");
  }

  chatDay.setAttribute("id", "current-day");
  chatMsgTextBox.setAttribute("id", "current-msg");
}

function dateAsClassName(dateString) {
  var currentFormat = new Date(dateString);
  var constructClassName = currentFormat.getDate() + "-" + (currentFormat.getMonth() + 1) + "-" + currentFormat.getFullYear();
  return constructClassName;
}

function timeAsClassName(dateString) {
  var currentFormat = new Date(dateString);
  var constructDate = currentFormat.getDate() + "-" + (currentFormat.getMonth() + 1) + "-" + currentFormat.getFullYear();
  var constructTime = currentFormat.getHours() + "-" + currentFormat.getMinutes();
  return (constructDate + constructTime);
}

function checkSimilarTime(previous, current) {
  var previousFormat = new Date(previous);
  var currentFormat = new Date(current);
  var diffMs = (currentFormat - previousFormat);
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  console.log(diffMins);
  if(diffMins > 1) {
    return 0;
  } else {
    return 1;
  }
}

function checkSameUser(previous, current) {
  if (previous === current) {
    return 1;
  }
  else {
    return 0;
  }
}

function checkSameDay(previous, current) {
  var previousFormat = new Date(previous);
  var currentFormat = new Date(current);
  var previousString = previousFormat.toDateString();
  var currentString = currentFormat.toDateString();
  if (previousString === currentString) {
    return 1;
  }
  else {
    return 0;
  }
}

function createDiv(className, id) {
  var tempDiv =  document.createElement("div");
  tempDiv.classList.add(className);
  return tempDiv;
}

function showCallHold(){
  var template = Template.getWaitingSpinner();
  OverlayObject = new modalOverlay({
    contentToAppend: template,
    view: "incoming-call"
  });
}

function chatHeadingOffline() {
  var chatHeadingText = document.getElementById('chat-heading-text');
  chatHeadingText.innerText = "Live Chat";
}

function chatHeadingOnline(connections) {
  var onlineIndicator = document.getElementById('icon-online');
  onlineIndicator.classList.add("online");
  var tempConnections = "";
  var chatHeadingText = document.getElementById('chat-heading-text');
  for(var key in connections) {
    var connection = connections[key];
    tempConnections = tempConnections + connection.firstName + " ,";
  }
  tempConnections = tempConnections.slice(0, -1);
  chatHeadingText.innerText = tempConnections;
}

function setupCall(event) {
  var message = event.detail.firstName + " has joined this call.";
  mze().makeToast({
    textMessage: message,
    position: "top-left"
  });
  chatHeadingOnline(event.detail.currentConnections);
  document.getElementById('chat-msg-box').disabled = false;
}

function closeCall(event) {
  chatHeadingOffline();
  document.getElementById('chat-msg-box').disabled = true;
  document.getElementById('current-video').src = "";
  document.getElementById('mini-media-holder').innerText = "";
  document.getElementById('call-cover').style.display = "block";
}

function notifyUser(event) {
  var message = event.detail.firstName + " is in Room.";
  mze().makeToast({
    textMessage: message,
    position: "top-left"
  });
}

function upTime(countTo) {
  countTo = new Date(countTo);
  var now = new Date();
  var difference = (now-countTo);
  //
  // days=Math.floor(difference/(60*60*1000*24)*1);
  // hours=Math.floor((difference%(60*60*1000*24))/(60*60*1000)*1);
  var hours=Math.floor((difference)/(60*60*1000)*1);
  var mins=Math.floor(((difference%(60*60*1000*24))%(60*60*1000))/(60*1000)*1);
  var secs=Math.floor((((difference%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1);

  // document.getElementById('days').firstChild.nodeValue = days;
  document.getElementById('hours').firstChild.nodeValue = hours < 10 ? "0" + hours : hours;
  document.getElementById('minutes').firstChild.nodeValue = mins < 10 ? "0" + mins : mins;
  document.getElementById('seconds').firstChild.nodeValue = secs < 10 ? "0" + secs : secs;

  document.getElementById('video-components-timer').innerText = document.getElementById('countup').innerText;

  // clearTimeout(upTime.to);
  upTime.to=setTimeout(function(){ upTime(countTo); },1000);
}

function updateScroll(){
  var chatBox = document.getElementById("chat-box");
  chatBox.scrollTop = chatBox.scrollHeight;
}

function initiateCallHold(event) {
  var tempText = "Your call is waiting with agent {{agentName}}";
  tempText = tempText.replace("{{agentName}}", event.detail.firstName);
  document.querySelector("#modal-sample .dialog-title").innerText = tempText;

  mze().makeDialog({
    persistent: true,
    holderId: "modal-sample"
  });

}

function showIncomingCaller(message,ref){

  var template = Template.getIncomingCallTemplate(message);
  var hasAction = false;
  var createCallAction = function(){
	  $(".decline").on("click",function(){
      hasAction = true;
		  ref.afterCallDeclined(message);
	  });
	  $(".accept").on("click", function(){
      hasAction = true;
		  $(".incoming-call-body").html(Template.getWaitingSpinner());
		  ref.afterCallAccepted(message);
	  });
  };

  var timer = setTimeout(function(){
    if(!hasAction){
      ref.afterCallDeclined(message);
      clearTimeout(timer);
    }
  },60000)

  var deleteCallAction = function(){
	  $(".decline").off("click");
	  $(".accept").on("click");
  };

  OverlayObject = new modalOverlay({
    contentToAppend: template,
    view: "incoming-call",
    createViewEvents: createCallAction,
    destroyViewEvents: deleteCallAction
  });
}

function promptAlreadyExistingUser(event) {
  // Prompt for already existing user goes here
  var tempText = document.querySelector("#modal-sample .dialog-title").innerText;
  tempText = tempText.replace("{{agentName}}", event.detail.firstName);
  document.querySelector("#modal-sample .dialog-title").innerText = tempText;

  mze().makeDialog({
    persistent: true,
    holderId: "modal-sample"
  });
}
