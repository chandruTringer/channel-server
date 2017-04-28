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
