/**
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

!function(root){

  var array  = []
    , slice  = array.slice
    , push   = array.push
    , filter = array.filter

  if (typeof exports === 'undefined') { root.withAdvice = withAdvice }
  else { module.exports = withAdvice }

  /* withAdvice
   * Extend an object with AOP methods 'before', 'after', 'around'
   * Optionally pass a list of mixins to apply to the object
   * ============================================================= */
  function withAdvice(){
    this.before = before
    this.after  = after
    this.around = around

    slice.call(arguments).forEach(function(mixin){
      mixin.call(this)
    }, this)

    return this
  }

  withAdvice.version = '0.0.6'
  withAdvice.before  = before
  withAdvice.after  = after

  function extend(obj){
    slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop]
        }
      }
    })
    return obj
  }

  // Before
  // ======
  function before(name, fn, error, timeout) {
    if(typeof timeout === 'undefined' && typeof error !== 'function') {
      timeout = error
      error = void 0
    }

    addAdvice(this, name, extend(fn, {async: !!fn.length, error: error, timeout: timeout, type: 'before'}))
    return this
  }

  function after(name, fn, error, timeout) {
    if(typeof timeout === 'undefined' && typeof error !== 'function') {
      timeout = error
      error = void 0
    }

    addAdvice(this, name, extend(fn, {async: !!fn.length, error: error, timeout: timeout, type: 'after'}))
    return this
  }

  // Advice Stack
  // ==========
  function AdviceStack(){
    this.storage = []
    this.asyncCount = 0
  }

  AdviceStack.prototype = {
    push: function(advice){
      this.storage.push(advice)
      if(advice.async) this.asyncCount++
    },
    get: function(num){
      if(typeof num === 'function'){
        var res
          , storage = this.storage
          , iterator = function(advice){ advice._wrapped === num }

        storage.forEach(function(advice) {
          if (iterator(advice) && typeof res === 'undefined') res = advice
        })

        return res
      }

      return this.storage[num]
    },
    isEmpty: function(){
      return !!this.storage.length
    },
    get length(){
      return this.storage.length
    }
  }

  function addAdvice(obj, name, advice){
    setupAdvice(obj, name)
    obj[name]._withAdvice[advice.type].push(advice)
  }

  // Setup
  // =====
  function setupAdvice(obj, name){
    if(typeof obj[name]._withAdvice === 'undefined') {
      setupMiddlewareEngine(obj, name)
      setupMiddlewareStorage(obj, name)
    }
  }

  function setupMiddlewareStorage(obj, name){
    obj[name]._withAdvice = {
        before: new AdviceStack
      , after:  new AdviceStack
      , around: new AdviceStack
    }
  }

  function setupMiddlewareEngine(obj, name) {
    var fn = obj[name]

    obj[name] = function() {
      var self = this
        , args = slice.call(arguments)
        , lastArg = args[args.length-1]
        , beforeStack = obj[name]._withAdvice['before']
        , afterStack  = obj[name]._withAdvice['after']
        , current = beforeStack.length
        , currentAdvice
        , beforeAsyncLeft = beforeStack.asyncCount
        , afterAsyncLeft = afterStack.asyncCount

      function handleError(err, callback) {
        if(typeof callback === 'function') return callback.call(self, err)
        throw err
      }

      function adviceArgs(){
        if(currentAdvice.length === 0){ return args }
        if(currentAdvice.length === 1){ return [next].concat(args) }
        if(currentAdvice.length === 2){ return [next, asyncDone].concat(args) }
      }

      function asyncDone(err) {
        if (err && err instanceof Error) return handleError(err, currentAdvice.error || lastArg)
        var counter = currentAdvice.type === 'before' ? beforeAsyncLeft : afterAsyncLeft
        return --counter ? next.apply(self, args) : done.apply(self, args)
      }

      function getCurrentAdvice(stack, n){
        var advice = beforeStack.get(n)
        if (!advice.async) {
          var syncAdvice = advice
          advice = function(){
            try { syncAdvice.apply(self); return next() }
            catch(e) { handleError.call(self, e, syncAdvice.error || lastArg) }
          }
        }
        return advice
      }

      function next() {
        if (arguments[0] instanceof Error) return handleError(arguments[0], beforeStack.get(current).error || lastArg)

        if (--current >= 0) {
          currentAdvice = getCurrentAdvice(beforeStack, current)
          return currentAdvice.apply(self, adviceArgs())
        }

        return done(adviceArgs())
      }

      function done() {
        var args   = slice.call(arguments)
          , result = fn.apply(self, args)

        return result
      }

      return next.apply(this, arguments)
    }
  }


  // Not Async Yet
  // =============
  withAdvice.around = around

  function around(method, aspect){ this[method] = doAround(aspect, this[method]) }
  function doAround(aspect, fn) {
    return function() {
      var args = [fn]
      push.apply(args, arguments)
      return aspect.apply(this, args)
    }
  }

}(this);
