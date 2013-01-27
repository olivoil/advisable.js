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
      /* , after:  new AdviceStack */
      /* , around: new AdviceStack */
    }
  }

  function handleError(err, advice, fallback) {
    if(typeof advice.error === 'function') return advice.error.call(this, err)
    if(typeof fallback === 'function') return fallback(err)
    throw err
  }

  function setupMiddlewareEngine(obj, name) {
    var fn = obj[name]

    obj[name] = function() {
      var adviceArgs, currentAdvice
        , self = this
        , lastArg = arguments[arguments.length-1]
        , beforeStack = obj[name]._withAdvice['before']
        , afterStack = obj[name]._withAdvice['after']
        , current = beforeStack.length
        , beforeAdviceLeft = beforeStack.length

      var next = function() {
        if (arguments[0] instanceof Error) return handleError.call(this, arguments[0], beforeStack.get(current), lastArg)

        var args = slice.call(arguments)
          , currentAdvice, adviceArgs

        if (args.length && !(arguments[0] == null && typeof lastArg === 'function')) adviceArgs = args

        if (--current >= 0) {
          currentAdvice = beforeStack.get(current)

          if (currentAdvice.async){
            adviceArgs = ( currentAdvice.length > 1
                           ? [once(next), once(beforeAsyncDone)]
                           : [once(next)] ).concat(adviceArgs)
          } else {
            var curr = currentAdvice
            currentAdvice = function(){
              try {
                curr.apply(this)
              } catch(e) {
                return handleError.call(self, e, curr, lastArg)
              }
              return next.apply(this) }
          }

          return currentAdvice.apply(self, adviceArgs)
        }

        return done.apply(self, adviceArgs)
      }

      var done = function() {
        var args = slice.call(arguments)
          , result = fn.apply(self, args)
        return result

          // , result, total_, done_, current_, adviceArgs

        // var nextAdvice = function() {
        //   if (arguments[0] instanceof Error) return handleError(arguments[0])
        //   if(typeof lastArg === 'function') return lastArg.apply(self)
        // }

        // if(typeof lastArg === 'function') args_[args_.length - 1] = once(next_)

        // total_   = afterStack.length
        // current_ = -1
        // var result = fn.apply(self, args)

        // if(total_ && typeof lastArg !== 'function') return next_()  // no callback provided, execute next_() manually
        // return result
      }

      if (beforeAdviceLeft) {
        function beforeAsyncDone(err) {
          if (err && err instanceof Error) return handleError(err, advice, lastArg)
          --beforeAdviceLeft || done.apply(self, adviceArgs)
        }
      }

      return next.apply(this, arguments)
    }
  }

  // function setupHook(name) {
  //       , _total      = pres.length
  //       , _current    = -1
  //       , _asyncsLeft = self[name].numAsyncPres

  //     var _done = function() {
  //       var args_ = slice.call(arguments)
  //         , ret, total_, current_, next_, done_, postArgs

  //       if (_current === _total) {
  //         next_ = function() {
  //           if (arguments[0] instanceof Error) return handleError(arguments[0])

  //           var args_ = slice.call(arguments, 1)
  //             , currPost , postArgs

  //           if (args_.length) hookArgs = args_

  //           if (++current_ < total_) {
  //             currPost = posts[current_]
  //             if (currPost.length < 1) throw new Error("#after must have a next argument -- e.g., function (next, ...)")

  //             postArgs = [once(next_)].concat(hookArgs)
  //             return currPost.apply(self, postArgs)

  //           } else if(typeof lastArg === 'function') return lastArg.apply(self) // All post handlers are done, call original callback function
  //         }

  //         // We are assuming that if the last argument provided to the wrapped function is a function, it was expecting
  //         // a callback.  We trap that callback and wait to call it until all post handlers have finished.
  //         if(typeof lastArg === 'function') args_[args_.length - 1] = once(next_)

  //         total_   = posts.length
  //         current_ = -1
  //         ret      = fn.apply(self, args_) // Execute wrapped function, post handlers come afterward

  //         if (total_ && typeof lastArg !== 'function') return next_()  // no callback provided, execute next_() manually
  //         return ret
  //       }
  //     }

  //     if (_asyncsLeft) {
  //       function _asyncsDone(err) {
  //         if (err && err instanceof Error) return handleError(err)
  //         --_asyncsLeft || _done.apply(self, hookArgs)
  //       }
  //     }

  //     function handleError(err) {
  //       if (typeof lastArg === 'function') return lastArg(err)
  //       if (errorCb) return errorCb.call(self, err)
  //       throw err
  //     }

  //     return _next.apply(this, arguments)
  //   }

  //   this[name]._asyncBeforeCount = 0
  //   return this
  // }

  function once(fn, ctx) {
    ctx || (ctx = this)

    return function fnWrapper() {
      if(fnWrapper.called) return
      fnWrapper.called = true
      fn.apply(ctx, arguments)
    }
  }


  // Not Async Yet
  // =============
  withAdvice.after  = after
  withAdvice.around = around

  function after(method, aspect) { this[method] = doAfter(aspect , this[method]) }
  function doAfter(aspect, fn) {
    return function() {
      var args   = slice.call(arguments)
        , result = fn.apply(this, args)

      if (result) args.unshift(result)
      return aspect.apply(this, args) || result
    }
  }

  function around(method, aspect){ this[method] = doAround(aspect, this[method]) }
  function doAround(aspect, fn) {
    return function() {
      var args = [fn]
      push.apply(args, arguments)
      return aspect.apply(this, args)
    }
  }

}(this);
