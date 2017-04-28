var fluxiRTC = require('./libs/fluxiRTC.js');

// var fluxi = require('./fluxi');
// var EventEmitter = require('events').EventEmitter;
// var fx = fluxi.fx;
// var dispatcher = fluxi.dispatcher;
// var isString = fx.isString;
// var isObject = fx.isObject;
//
//
// var AppDispatcher = new fluxi.dispatcher();
//
// class AppStore extends EventEmitter{
//
//   constructor(){
//     super();
//     this.testValue = "";
//   }
//   setTestValue(value){
//     this.testValue = value;
//     return this.testValue;
//   }
//   getTestValue(){
//     return this.testValue;
//   }
//   emitChange(){
//     this.emit('change');
//     this.getTestValue();
//   }
//   addChangeListener(callback){
//     this.on('change',callback);
//   }
//   removeChangeListener(callback){
//     this.removeListener('change',callback);
//   }
// }
//
// var _appStore = new AppStore();
//
// AppDispatcher.register(function(payload){
//   let payloadType = isString(payload.type) ? payload.type : "@EMPTY_VALUE";
//   let payloadData = isObject(payload.data) ? payload.data : "@EMPTY_VALUE";
//   switch(payloadType){
//     case "TOGGLE_TEST_VALUE":
//       _appStore.setTestValue(payload.data);
//       break;
//     default:
//       return true;
//   }
//   _appStore.emitChange();
//   return true;
// });
//
// AppDispatcher.dispatch({
//   type: "TOGGLE_TEST_VALUE",
//   data: "testing"
// });
//
// console.log(_appStore.getTestValue());
