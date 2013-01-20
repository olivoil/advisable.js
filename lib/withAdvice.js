/**
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

!function(root){

  var array = []
    , slice = array.slice

  if (typeof exports === 'undefined') { root.withAdvice = withAdvice }
  else { module.exports = withAdvice }

  /* withAdvice
   * Extend an object with AOP methods 'before', 'after', 'around'
   * ============================================================= */
  function withAdvice(){
    this.before = before
    this.after  = after
    this.around = around
  }

  withAdvice.version = '0.0.3'
  withAdvice.compose = compose
  withAdvice.before  = before
  withAdvice.after   = after
  withAdvice.around  = around

  function before(method, aspect){ this[method] = doBefore(aspect, this[method]) }
  function after(method, aspect) { this[method] = doAfter(aspect , this[method]) }
  function around(method, aspect){ this[method] = doAround(aspect, this[method]) }

  function doBefore(aspect, fn) {
    return function() {
      aspect.apply(this, arguments)
      return fn.apply(this, arguments)
    }
  }

  function doAfter(aspect, fn) {
    return function() {
      var result = aspect.apply(this, arguments)
      fn.apply(this, arguments)
      return result
    }
  }

  function doAround(aspect, fn) {
    return function() {
      return aspect.apply(this, fn, arguments)
    }
  }

  function compose() {
    var args = slice.call(arguments)

    var ctor = function(attrs) {
      extend(this, attrs)
      this.initialize.call(this, arguments)
    }

    ctor.prototype.initialize = noop
    withAdvice.call(ctor.prototype)
    args.forEach(function(mixin) {mixin.call(ctor.prototype)})
    return ctor
  }

  function extend(destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        destination[k] = source[k]
      }
    }
    return destination
  }

  function noop(){}

}(this);
