/*!
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

// With Advice
// -----------
//
// An Aspect-Oriented Library for javascript.
// Inspired by [@angustweets and @danwrong](https://speakerdeck.com/u/anguscroll/p/how-we-learned-to-stop-worrying-and-love-javascript).
//
// <script async class="speakerdeck-embed" data-id="4fc7e727ed0e1d001f022749" data-ratio="1.3333333333333333" src="//speakerdeck.com/assets/embed.js"></script>

;(function(){

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


  // Augment an object with AOP methods 'before', 'after', 'around'
  //
  // Example
  //
  // ```
  //   var Animal = function() { ... };
  //   withAdvice.call(Animal.prototype);
  // ```

  function withAdvice() {
    this.before = before;
    this.after  = after;
    this.around = around;
  };

  // Execute aspect before executing method

  function before(method, aspect) {
    this[method] = doBefore(aspect, this[method]);
  };

  // Execute aspect after executing method

  function after(method, aspect) {
    this[method] = doAfter(aspect, this[method]);
  };

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

  /**
   * Create a new constructor function, based on a prototype blueprint, augmented with the given advice.
   * Each property of the blueprint will be added to the prototype of the constructor.
   * The constructor function will take a hash of arguments, representing the attributes of the new object.
   *
   * Examples:
   *
   *    var animal = function() {
   *      this.lifeSpan = 10;
   *    };
   *
   *    var withFlying = function() {
   *      this.fly = function() {
   *        console.log('Flying');
   *      };
   *    };
   *
   *    var Bird = withAdvice.create(animal, withFlying);
   *    var bird = new Bird({name: 'birdie'});
   *
   *    console.log( bird.lifeSpan );
   *    // => 10
   *
   *    console.log( bird.name );
   *    // => "birdie"
   *
   *    bird.fly();
   *    // => "Flying"
   *
   * @param {Function} blueprint
   * @param {Function} advice
   * @api public
   */

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
