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
      var args = slice.call(arguments)
      var result = fn.apply(this, args)
      if (result) args.unshift(result)
      aspect.apply(this, args)
      return result
    }
  }

  function doAround(aspect, fn) {
    return function() {
      var args = slice.call(arguments)
      args.unshift(fn)
      return aspect.apply(this, args)
    }
  }

  function compose() {
    var args = slice.call(arguments)
      , base = args.shift()

    withAdvice.call(base)
    args.forEach(function(mixin) {mixin.call(base)})
    return base
  }

}(this);
