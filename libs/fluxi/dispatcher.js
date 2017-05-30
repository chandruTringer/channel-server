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

var fx = require('./fx'),
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
    _this.isDispatching = true;
    mapObject(_this._reducers, function(key, value){
      value(payload);
    });
    _this.isDispatching = false;
  }
}

module.exports = dispatcher;
