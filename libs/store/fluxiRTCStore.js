var EventEmitter = require('events').EventEmitter;

var actions = require('../fluxiRTCActions');

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
