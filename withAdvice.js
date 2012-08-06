/**
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

;(function(){

  // With Advice
  // -----------
  //
  // An Aspect-Oriented Library for javascript.
  // Inspired by [@angustweets and @danwrong](https://speakerdeck.com/u/anguscroll/p/how-we-learned-to-stop-worrying-and-love-javascript).

  // Library version.

  withAdvice.version = '0.0.1';


  // Expose main function

  if ('undefined' == typeof exports) {
    window.withAdvice = withAdvice;
  } else {
    module.exports = withAdvice;
  }


  // Noop.

  function noop() {};


  // Extend destination by copying over all properties from source

  function extend(destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        destination[k] = source[k];
      }
    }
    return destination;
  };


  // ## withAdvice.call
  //
  // #### Augment an object with AOP methods 'before', 'after', 'around'
  //
  // Example
  //
  // ```
  // var Animal = function() { ... };
  // withAdvice.call(Animal.prototype);
  // ```

  function withAdvice() {
    this.before = before;
    this.after  = after;
    this.around = around;
  };

  // ### before
  // Execute aspect before executing method

  function before(method, aspect) {
    this[method] = doBefore(aspect, this[method]);
  };

  // ### after
  // Execute aspect after executing method

  function after(method, aspect) {
    this[method] = doAfter(aspect, this[method]);
  };

  // ### around
  // Execute aspect around executing method

  function around(method, aspect){
    this[method] = doAround(aspect, this[method]);
  };

  function doBefore(aspect, fn) {
    return function() {
      aspect.apply(this, arguments);
      return fn.apply(this, arguments);
    };
  };

  function doAfter(aspect, fn) {
    return function() {
      result = aspect.apply(this, arguments);
      fn.apply(this, arguments);
      return result;
    };
  };

  function doAround(aspect, fn) {
    return function() {
      return aspect.apply(this, fn, arguments);
    };
  };

  // ## withAdvice.create
  //
  // #### Compose and returns a new constructor function based on aop aspects.
  //
  // The constructor's prototype will be extended with all the modules passed to it as argument.
  // The prototype of the returned constructor function will have:
  //
  // * an `initialize` method that will be called when a new instance is created
  // * any attribute or method attached to `this` in one of the aspects passed as arguments
  //
  // For a complete example, take a look at `examples/storage.js`

  withAdvice.create = function() {
    var argsArray = [].slice.call(arguments)
    , Ctor      = function(attrs) {
      extend(this, attrs);
      this.initialize.call(this, arguments);
    };

    Ctor.prototype.initialize = noop;
    withAdvice.call(Ctor.prototype);
    argsArray.forEach(function(mixin) {mixin.call(Ctor.prototype)});
    return Ctor;
  };

})();
