/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(2).EventEmitter;

var actions = __webpack_require__(12);

class _fluxiRTCStore extends EventEmitter{
  constructor(){
    super();
    this.appStore = {};
  }
  emitChange(){
    this.emit('change');
  }
  addChangeListener(callback){
    this.on('change',callback);
  }
  removeChangeListener(callback){
    this.removeListener('change',callback);
  }
}

var fluxiRTCStore = new _fluxiRTCStore()

fluxiRTCStore.actions = actions;

module.exports = fluxiRTCStore;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var dispatcher = __webpack_require__(10);
var fx = __webpack_require__(3);

module.exports = {
  dispatcher,
  fx
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/**
 * fx a functional programming style, library which aids in creating functional
 * pipelines
 * @module fx
 * @memberOf Fluxi
 * @since v0.0.1
 * @return {Object}
 * @author Vigneshwaran Sivasamy
 */

/**
 * Useful support variables declaration goes here
 */

var pObject = Object.prototype,
    pArray = Array.prototype,
    pString = String.prototype,
    pBoolean = Boolean.prototype,
    toString = pObject.toString,


    /**
     * Legacy methods and private methods are prefixed with _(underscore).
     */

    _isArray = function _isArray(target){
       return toString.call(target) === '[object Array]';
    },

    _isObject = function _isObject(target){
      return toString.call(target) === '[object Object]';
    },

    _isString = function _isString(target){
      return toString.call(target) === '[object String]';
    },

    _isDate = function _isDate(target){
      return toString.call(target) === '[object Date]';
    },

    _isNumber = function _isNumber(target){
      return toString.call(target) === '[object Number]';
    },

    _isNull = function _isNull(target){
      return toString.call(target) === '[object Null]';
    },

    _isUndefined = function _isUndefined(target){
      return toString.call(target) === '[object Undefined]';
    },

    _isRegex = function _isRegex(target){
      return toString.call(target) === '[object Regex]';
    },

    _isBoolean = function _isBoolean(target){
      return toString.call(target) === '[object] Boolean';
    },

    _isFunction = function _isFunction(target){
      return toString.call(target) === '[object Function]';
    },

    _pipe = function _pipe(f,x){
      return function(){
        return x.call(this,f.apply(this,arguments));
      };
    },

    /**
     * Wrapped or Facaded methods which is going public
     */

    isValid = function isValid(target){
      return (target !== undefined && target !== null);
    },

    isArray = function isArray(target){
      return (_isArray);
    },

    isObject = function isObject(target){
      return (_isObject);
    },

    isString = function isString(target){
      return (_isString);
    },

    isDate = function isDate(target){
      return (_isDate);
    },

    isNumber = function isNumber(target){
      return (_isNumber);
    },

    isNull = function isNull(target){
      return (_isNull);
    },

    isUndefined = function isUndefined(target){
      return (_isUndefined);
    },

    isRegex = function isRegex(target){
      return (_isRegex);
    },

    isBoolean = function isBoolean(target){
      return (_isBoolean);
    },

    isFunction = function isFunction(target){
      return (_isFunction);
    },

    // It checks the variable type
    isOfType = function isOfType(variable, type){
      return (typeof variable === type) ? true : false;
    },

    set = function set(variable, defaultValue){
      defaultValue = isValid(defaultValue) ? defaultValue : "@EMPTY_VALUE";
      variable = isValid(variable) ? variable : defaultValue;
      return variable;
    },

    xNull = function xNull(target){
      return !isNull(target);
    },

    xUndefined = function xUndefined(target){
      return !isUndefined(target);
    },

    pipe = function pipe(){
      let fnPipe = arguments;
      fnPipe.__proto__ = pArray;
      if (fnPipe.length === 0) {
        throw new Error('pipe requires at least one argument');
      } else{
        return fnPipe.reduce(_pipe,fnPipe[0]);
      }
    },

    /**
    * Function Object.prototype.mapObject  similar to Array.prototype.map
    * @param1 {object} => arg[0]
    * @param2 {object} => arg[1]
    */
    mapObject = function mapObject(){
      // type checking
      if(!isObject(arguments[0])) throw new TypeError();
      var mappedObject = arguments[0];
      if(!isFunction(arguments[1])) throw new TypeError();
      var callbackfn = arguments[1];
      // looping throught the properties in the object
      var newObj = {};
      for( key in mappedObject ) {
        newObj[key] = callbackfn.call( mappedObject, key, mappedObject[key] );
      }
      return newObj;
    };

     module.exports = {
       isArray,
       isObject,
       isString,
       isDate,
       isNumber,
       isNull,
       isUndefined,
       isRegex,
       isBoolean,
       isFunction,
       isValid,
       xNull,
       xUndefined,
       isOfType,
       set,
       pipe,
       mapObject
     };


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function(url, isAsync) {
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
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(0).appStore;
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(0).appStore;
var dispatcher = __webpack_require__(13);
module.exports = class signaller{
  constructor(){
    // For starting WebRTC functions both these have to be true
    this.channelReady = false;

    // Channel storage
    this.socket = null;
  }
  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }
  _openChannel(channelToken) {
    var tempObj = this;
    var socket = io('/');
    socket.on('connect', function(){
      socket.emit('addUser',{
        userId: store.room.user.userId,
        socketId: socket.id,
        channelToken: channelToken
      },
      function(){
        tempObj.onChannelOpened.call(tempObj);
      });
      socket.on('message', function(message){
        tempObj.onChannelMessage.call(tempObj, message);
      });
    });
    socket.close = function(){
      socket.emit('removeUser',{
        userId: store.room.user.userId
      });
      tempObj.socket = null;
    };
    tempObj.socket = socket;
  }
  onChannelMessage (message) {
    var tempObj = this;
    dispatcher.dispatch(message);
  }
  sendMessage(message) {
    var tempObj = this;
    console.log("Sent :", message);
    tempObj.socket.emit('sendMessage',{
      sendTo: message.sendTo,
      message: message
    });
  }
  onChannelOpened() {
    var tempObj = this;
    var media = fluxiRTC.media;
    var hasPreviousConnection = store.room.user.previousConnectionsDetail;
    tempObj.channelReady = true;
    tempObj.trace("Server", "Message", "Channel Opened for signalling.");

    if(
      tempObj.channelReady &&
      media.mediaReady &&
      !store.room.user.agent &&
      !store.room.user.waiting) {
        tempObj.sendMessage({
          type: "inRoom",
          userId: store.room.user.userId,
          firstName: store.room.user.firstName,
          lastname: store.room.user.lastName,
          email: store.room.user.email,
          sendTo: store.room.hostId
        });
        tempObj.trace("Client", "Message", "In room message sent.");
      } else if(
        !store.room.user.agent &&
        store.room.user.waiting){
          fluxiRTC.showWaitingStatus({
            userId: store.room.roomId,
            firstName: store.room.roomName
          }, fluxiRTC);
        }

        if(hasPreviousConnection){
          var hasCustomer = (store.room.user.previousConnectionsDetail.sendTo);
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
        document.removeEventListener("afterOpeningChannel", fluxiRTC.eventHandlrs.afterOpeningChannel);
        document.addEventListener("afterOpeningChannel", fluxiRTC.eventHandlrs.afterOpeningChannel);
        var afterOpeningChannel = new CustomEvent("afterOpeningChannel", {
          detail: {
            channelReady: true
          }
        });
        document.dispatchEvent(afterOpeningChannel);

      }
    }


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(0).appStore;
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


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(0).appStore;
module.exports = class webRTCDataChannelStore{
  constructor(){
    // Data channel
    this.dataChannel = {};
    this.receiveChannel = {};
    this.dataChannelOptions = {
      ordered: true, // do not guarantee order
      maxRetransmits: 4 // retry attempts
    };

    // To avoid redundant msg through channel
    this.previousMessageToken = null;
  }

  trace(text1, text2, text3) {
    var now = (performance.now() / 1000).toFixed(3);
    console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
  }

  /****************************************************************************
  * Data Channel functions
  ****************************************************************************/
  dataChannelCalls(pc, remoteUserId){
    var tempObj = this;
    var channelName = store.room.user.userId + "," + remoteUserId;
    tempObj.dataChannel[remoteUserId] = pc.createDataChannel("textMessages", tempObj.dataChannelOptions);
    tempObj.createDataChannelHandlers(tempObj.dataChannel[remoteUserId]);
  }
  createDataChannelHandlers(dataChannelTemp){
    var tempObj = this;
    dataChannelTemp.onerror = (function (error) {
      this.trace("Client", "Error", "Data Channnel error.");
    }).bind(this);
    dataChannelTemp.onmessage = (function (event) {
      var data = JSON.parse(event.data);
      this.trace("Client", "Message", "Data Channnel message");
      this.handleChannelMsg(event.data);

    }).bind(this);
    dataChannelTemp.onopen = (function (event) {
      this.trace("Client", "Message", "Data Channnel opened.");
    }).bind(this);
    dataChannelTemp.onclose = (function (event) {
      this.trace("Client", "Message", "Data Channnel closed.");
    }).bind(this);
  }
  handleChannelMsg(message) {
    var tempObj = this;
    tempObj.buildChatMsgs(message, "incoming");
  }
  composeDataChannelMsgs(message, to, command) {
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
  }
  buildChatMsgs(msg, type) {
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
  }
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Dispatcher is used to broadcast payloads to registered callbacks.
 * @module dispatcher
 * @memberOf fluxi
 * @dependOn fx
 * @author Vigneshwaran Sivasamy
 * @since v0.0.1
 * @param {*}
 * @return {Object}
 * @example
 *
 *      var AppDispatcher = new Dispatcher();
 */

var fx = __webpack_require__(3),
    tokenPrefix = 'ID_',
    isFunction = fx.isFunction,
    pipe = fx.pipe,
    mapObject = fx.mapObject;

class dispatcher {

  constructor() {
    this._reducers = {};
    this._isDispatching = false;
    this._isProcessed = {};
    this._isYetToBeProcess = {};
    this._lastId = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload.
   * Returns a token that can be used with `waitFor()`.
   * @module Dispatcher
   * @since v0.0.1
   * @category Function
   * @param {Function} reducer
   * @return {String}
   * @example
   *
   *      AppDispatcher.register(function(payload) {
   *        if (payload.actionType === 'city-update') {
   *          CityStore.city = payload.selectedCity;
   *        }
   *      });
   */


  register(reducer){
    if(isFunction(reducer)){
      this._addReducer(reducer);
    } else {
      throw new Error('reducer has to be function');
    }
  }

  _generateToken(){
    var lastId = this._lastId;
    return tokenPrefix+(lastId);
  }

  _addReducer(reducer){
    var token = this._generateToken();
    this._reducers[token] = reducer;
    return token;
  }

  _isValidToken(token){
    return !!(_this.reducers[token]);
  }

  _deleteToken(token){
    if(this._isValidToken(token)){
      delete this.reducers[token];
      return true;
    } else {
      return new Error("it does't seems to be a valid token");
    }
  }

  unregister(token){
    if(pipe(isExist,this._isValidToken)(token)){
      return this._deleteToken(token);
    } else {
      return new Error("it does't seems to be a valid token");
    }
  }

  waitFor(){

  }

  isDispatching(){
    return this._isDispatching;
  }

  dispatch(payload){
    this._invokeCallback(payload);
  }

  _invokeCallback(payload){
    var _this = this;
    console.log(_this);
    _this.isDispatching = true;
    mapObject(_this._reducers, function(key, value){
      value(payload);
    });
    _this.isDispatching = false;
  }
}

module.exports = dispatcher;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var EventEmitter = __webpack_require__(2).EventEmitter;
var {set, isOfType} = __webpack_require__(1).fx;
var hitServer = __webpack_require__(4);

var media = __webpack_require__(5);
var signaller = __webpack_require__(6);
var webRTCDataChannel = __webpack_require__(8);
var webRTC = __webpack_require__(7);
var _fluxiRTCStore = __webpack_require__(0);

global.trace = function(text1, text2, text3) {
  var now = (performance.now() / 1000).toFixed(3);
  console.log(now + " : " + text1 + " : " + text2 + " : " + text3);
};

class fluxiRTC extends EventEmitter{
  constructor(){
    super();
    this.media = new media();
    this.signaller = new signaller();
    this.webRTCDataChannel = new webRTCDataChannel();
    this.webRTC = new webRTC();
    this.hitServer = hitServer;
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
              trace("Client", "Message", "User hosting chat room.");
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
                  trace("Client", "Message", "In room message sent.");
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
              trace("Server", "Error", "There seeems to be no room or user data in response.");
            }
          })
          .catch(function (responseData) {
            trace("Server", "Error", "Room creation failed! Retry after sometime.");
          });
        };
      } else {
        trace("Client", "Warning", "There seems to be no form data. No connection will be established.");
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
        var currentElement = this;
        var isBusyWith = store.room.user.isBusyWith;
        currentElement.classList.add("disabled");
        if(store.room.user.agent && !!(store.room.user.isBusyWith)){
          tempObj.signaller.sendMessage({
            type: "terminate",
            sendTo: isBusyWith,
            info: "Your call was disconnected by the agent."
          });
          tempObj.deleteCurrentCustomer({
            userId: isBusyWith,
            firstName: store.room.user.connections[isBusyWith].firstName,
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
      trace("Client", "Error", err);
      trace("Client", "Error", "Execution stopped due to errors.");
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
            trace("Server", "Message", "User successfully deleted.");
          })
          .catch(function () {
            trace("Server", "Error", "Delete user failed.");
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
            trace("Server", "Message", "User successfully deleted.");

            // Flow for switching to the next user in queue

          })
          .catch(function () {
          trace("Server", "Error", "Delete user failed.");
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
          trace("Client", "Message", ("User in room: " + tempMsg.userId));
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
        trace("Client","Message","Neglecting multiple inRoom message from server");
        trace("Client","Message","Neglecting inRoom message to customer");
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
              trace("Server", "Message", "User successfully deleted.");
              trace("Client", "Message", ("User in room: " + responseData));


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
                fluxiRTC.store.currentConnections = fluxiRTC.store.currentConnections - 1;

                tempObj.webRTCDataChannel.dataChannel[tempMsg.userId].close();
                delete store.room.user.connections[tempMsg.userId];
                delete store.webRTCDataChannel.dataChannel[tempMsg.userId];
              }
              if(!store.room.user.connections[responseData]){
                tempObj.sendMessage({
                  type: "connect",
                  userId: currentUser.userId,
                  sendTo: responseData
                });
              } else {
                tempObj.dataChannelCalls(store.room.user.connections[responseData].peerConnection, responseData);
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
              store.currentConnections = store.currentConnections - 1;

              tempObj.webRTCDataChannel.dataChannel[tempMsg.userId].close();
              delete store.room.user.connections[tempMsg.userId];
              delete tempObj.webRTCDataChannel.dataChannel[tempMsg.userId];

              // Creating and setting an custom event
              document.removeEventListener("afterRemoteLeaving", tempObj.eventHandlrs.afterRemoteLeaving);
              document.addEventListener("afterRemoteLeaving", tempObj.eventHandlrs.afterRemoteLeaving);
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
      var url = store.apiBaseUrl + "user/remove/" + store.room.roomId + "/" + tempMsg.userId;
      trace("Client", "Delete Request", store.room.roomId);
      tempObj.hitServer(url)
        .get(currentUser.userId)
        .then(function (responseData) {
        	tempObj.afterDeletingCurrentCustomer(tempMsg,responseData);
        })
        .catch(function () {
            trace("Server", "Error", "Delete user failed.");
        });
  }
}

global.fluxiRTC = new fluxiRTC();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = {
  handleInRoom: function handleInRoom(tempMsg){
    var storeRoom = this.appStore.room;
    var currentCaller  = storeRoom.user;
    var isAgent = currentCaller.agent;
    var isFirstCaller = currentCaller.isFirstCaller;
    var isBusy = !  !currentCaller.isBusyWith;
    var messageFromCurrentPeer = (currentCaller.isBusyWith === tempMsg.userId);
    var isCallAccepted = (isAgent && !isBusy) || (isAgent && messageFromCurrentPeer);

    if( isAgent && isFirstCaller ){
      showIncomingCaller(tempMsg,fluxiRTC);
      currentCaller.isFirstCaller = false;
    } else if(isCallAccepted){
      fluxiRTC.afterCallAccepted(tempMsg);
    } else if(storeRoom.user.agent){
      // Keep in wait
      fluxiRTC.afterCallDeclined(tempMsg);
    } else{
      console.log("Discarding incoming call from other users");
    }
  },
  handleReconnect: function handleReconnect(tempMsg){
    var storeRoom = this.appStore.room;
    if(tempMsg.userId){
      var videoDomSelector = "div-"+tempMsg.userId;
      try{
        videoDom = document.getElementById(videoDomSelector);
        videoDom.parentNode.removeChild(videoDom);
        // storeRoom.connections = {};
      }catch(e){
        console.log(e.stack);
      }
      window.OverlayObject && OverlayObject.hideOverlay();
    }
    if(storeRoom.user.agent){
      storeRoom.user.isBusyWith = null;
      fluxiRTC.afterCallAccepted(tempMsg);
    } else {
      fluxiRTC.signaller.sendMessage({
        type: "inRoom",
        userId: storeRoom.user.userId,
        firstName: storeRoom.user.firstName,
        lastname: storeRoom.user.lastName,
        email: storeRoom.user.email,
        sendTo: tempMsg.userId,
        command: "reconnect"
      });
    }
  },
  handleWait: function handleWait(tempMsg){
    var tempObj = this;
    var storeRoom = tempObj.room;
    if(tempMsg.previousAgentId){
      var videoDomSelector = "div-"+tempMsg.previousAgentId;
      try{
        videoDom = document.getElementById(videoDomSelector);
        videoDom.parentNode.removeChild(videoDom);
        storeRoom.connections = {};
      }catch(e){
        console.log(e.stack);
      }
      window.OverlayObject && OverlayObject.hideOverlay();
    }
    fluxiRTC.showWaitingStatus(tempMsg, fluxiRTC);
    trace("Client", "Message","Waiting for agent: "+tempMsg.firstName);
  },
  handleOffer: function handleOffer(tempMsg){
    var tempObj = this;
    var storeRoom = tempObj.appStore.room;
    if(document.getElementsByClassName("material-dialog").length > 0){
      document.getElementsByClassName("material-dialog")[0].style.display = "none";
    }
    storeRoom.user.callStage++; // Moving to offer received stage
    trace("Client", "Message", ("Offer from user: " + tempMsg.userId));
    fluxiRTC.webRTC.createPeerConnection(tempMsg, "answer");
    storeRoom.user.connections[tempMsg.userId].peerConnection.ondatachannel = function(event) {
      fluxiRTC.webRTCDataChannel.receiveChannel[tempMsg.userId] = event.channel;
      fluxiRTC.webRTCDataChannel.createDataChannelHandlers(fluxiRTC.webRTCDataChannel.receiveChannel[tempMsg.userId]);
    };
    fluxiRTC.webRTC.setRemote(tempMsg.description, tempMsg.userId);
    fluxiRTC.webRTC.doAnswerTo(tempMsg.userId);
    storeRoom.user.connections[tempMsg.userId].callAttendTime = new Date();
    storeRoom.user.isBusyWith = tempMsg.userId;
    storeRoom.user.callStage++; // Moving to answer sent stage

    // Creating and setting an custom event
    document.removeEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
    document.addEventListener("afterReceivingOffer", tempObj.afterReceivingOffer);
    var afterReceivingOffer = new CustomEvent("afterReceivingOffer", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        currentConnections: storeRoom.user.connections
      }
    });
    document.dispatchEvent(afterReceivingOffer);
    window.OverlayObject && OverlayObject.hideOverlay();
  },
  handleAnswer: function handleAnswer(tempMsg){
    var storeRoom = this.appStore.room;
    storeRoom.user.callStage++;
    trace("Client", "Message", ("Answer from user: " + tempMsg.userId));
    fluxiRTC.webRTC.setRemote(tempMsg.description, tempMsg.userId);
    storeRoom.user.connections[tempMsg.userId].connected = true;
    storeRoom.user.connections[tempMsg.userId].callAttendTime = new Date();

    // Creating and setting an custom event
    document.removeEventListener("afterReceivingAnswer", fluxiRTC.eventHandlrs.afterReceivingAnswer);
    document.addEventListener("afterReceivingAnswer", fluxiRTC.eventHandlrs.afterReceivingAnswer);
    var afterReceivingAnswer = new CustomEvent("afterReceivingAnswer", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        currentConnections: storeRoom.user.connections
      }
    });
    document.dispatchEvent(afterReceivingAnswer);
    window.OverlayObject && OverlayObject.hideOverlay();
  },
  handleCandidate: function handleCandidate(tempMsg){
    var _this = this;
    var appStore = _this.appStore;
    var storeRoom = appStore.room;
    if(typeof storeRoom.user.connections[tempMsg.userId] == 'undefined') {
        storeRoom.user.connections[tempMsg.userId] = {};
    };
    if(typeof storeRoom.user.connections[tempMsg.userId].answered == 'undefined') {
          storeRoom.user.connections[tempMsg.userId].answered = false;
    };
    if((storeRoom.user.connections[tempMsg.userId].peerConnection) && (storeRoom.user.connections[tempMsg.userId].answered == true)) {
          var candidate = new RTCIceCandidate({
                sdpMLineIndex : tempMsg.label,
                candidate : tempMsg.candidate
          });
          storeRoom.user.connections[tempMsg.userId].peerConnection.addIceCandidate(candidate);
    } else {
          if(!storeRoom.user.connections[tempMsg.userId].candidatesReceived) {
                storeRoom.user.connections[tempMsg.userId].candidatesReceived = [];
          }
          storeRoom.user.connections[tempMsg.userId].candidatesReceived.push(tempMsg);
    };
  },

  handleAudioToggle: function handleAudioToggle(tempMsg){
    // Creating and setting an custom event
    var storeRoom = this.appStore.room;
    document.removeEventListener("afterAudioToggle", fluxiRTC.eventHandlrs.afterAudioToggle);
    document.addEventListener("afterAudioToggle", fluxiRTC.eventHandlrs.afterAudioToggle);
    var afterAudioToggle = new CustomEvent("afterAudioToggle", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[userId].firstName,
        callAttendTime: storeRoom.user.connections[userId].callAttendTime,
        state: tempMsg.state
      }
    });
    document.dispatchEvent(afterAudioToggle);
  },
  handleVideoToggle: function handleVideoToggle(tempMsg){
    // Creating and setting an custom event
    var storeRoom = this.appStore.room;
    document.removeEventListener("afterVideoToggle", fluxiRTC.eventHandlrs.afterVideoToggle);
    document.addEventListener("afterVideoToggle", fluxiRTC.eventHandlrs.afterVideoToggle);
    var afterVideoToggle = new CustomEvent("afterVideoToggle", {
      detail: {
        userId: tempMsg.userId,
        firstName: storeRoom.user.connections[tempMsg.userId].firstName,
        callAttendTime: storeRoom.user.connections[tempMsg.userId].callAttendTime,
        state: tempMsg.state
      }
    });
    document.dispatchEvent(afterVideoToggle);
  },
  handleSwitchRoom: function handleSwitchRoom(tempMsg){
    var storeRoom = this.appStore.room;
    var userIds = tempMsg.userIds;
    var newRoomId = tempMsg.roomId;
    var user;
    for(user in userIds){
      fluxiRTC.signaller.sendMessage({
        type: "connect",
        userId: storeRoom.user.userId,
        sendTo: userIds[user],
        newRoomId: newRoomId
      });
    }
  },
  handleConnect: function handleConnect(tempMsg){
    var storeRoom = this.appStore.room;
    if(tempMsg.newRoomId){
      storeRoom.roomId = tempMsg.newRoomId;
    }
    fluxiRTC.signaller.sendMessage({
      type: "inRoom",
      userId: storeRoom.user.userId,
      firstName: storeRoom.user.firstName,
      lastname: storeRoom.user.lastName,
      email: storeRoom.user.email,
      sendTo: tempMsg.userId
    });
    var videoDomSelector = "div-"+storeRoom.hostId;
    try{
      videoDom = document.getElementById(videoDomSelector);
      videoDom.parentNode.removeChild(videoDom);
      storeRoom.connections = {};
      storeRoom.hostId = tempMsg.userId;
    }catch(e){
      console.log(e.stack);
    }
    storeRoom.connections = [];
  },
  handleSwitchAgent: function handleSwitchAgent(tempMsg){
    var storeRoom = this.appStore.room;
    fluxiRTC.signaller.sendMessage({
      type: "inRoom",
      userId: storeRoom.user.userId,
      firstName: storeRoom.user.firstName,
      lastname: storeRoom.user.lastName,
      email: storeRoom.user.email,
      sendTo: tempMsg.userId
    });
    var videoDomSelector = "div-"+tempMsg.agentId;
    try{
      videoDom = document.getElementById(videoDomSelector);
      videoDom.parentNode.removeChild(videoDom);
      storeRoom.connections = {};
    }catch(e){
      console.log(e.stack);
    }
  },
  handleTerminate: function handleTerminate(tempMsg){
    tempObj.closeAllConnections(
      null,
      true
    );
    alert(tempMsg.info);
  },
  handleBye: function handleBye(tempMsg){
    var storeRoom = this.appStore.room;
    if (tempMsg.isHost) {

      /********************************************************

      This flow will stop the connection between both the
      Agent and customer

      *********************************************************/

      alert("Sorry! The host has closed this session.");
      tempObj.closeAllConnections();
    }


    if(tempMsg.userId == storeRoom.user.isBusyWith) {
      tempObj.deleteCurrentCustomer(tempMsg);
      tempObj.isWatingToConnect = true;
    } else {
      return;
    }
  }
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var {dispatcher,fx} = __webpack_require__(1);

var store = __webpack_require__(0);

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


/***/ })
/******/ ]);