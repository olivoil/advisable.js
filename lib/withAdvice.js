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
   * Optionally pass a list of mixins to apply to the object
   * ============================================================= */
  function withAdvice(){
    var self = this

    this.before = before
    this.after  = after
    this.around = around

    slice(arguments).forEach(function(mixin) { mixin.call(self) })
    return this
  }

  withAdvice.version = '0.0.4'
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
      var args   = slice.call(arguments)
        , result = fn.apply(this, args)

      if (result) args.unshift(result)
      var res = aspect.apply(this, args)
      return res ? res : result
    }
  }

  function doAround(aspect, fn) {
    return function() {
      var args = slice.call(arguments)
      args.unshift(fn)
      return aspect.apply(this, args)
    }
  }

}(this);
