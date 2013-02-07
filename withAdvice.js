/**
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

!function(root){
  'use strict';

  var array  = []
    , slice  = array.slice
    , push   = array.push
    , filter = array.filter
    , noop   = function(){}

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

  withAdvice.version = '0.0.7'

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

  function before(name, fn, error) {
    addAdvice(this, name, fn, {error: error, type: 'before'})
    return this
  }

  function after(name, fn, error) {
    addAdvice(this, name, fn, {error: error, type: 'after'})
    return this
  }

  function addAdvice(obj, name, advice, options){
    setupAdvice(obj, name)
    extend(advice, options)
    obj._withAdvice[name][options.type].push(advice)
  }

  // Advice Stack
  // ==========
  function AdviceStack(){
    this.storage = []
    this.asyncCount = 0
  }

  AdviceStack.prototype.push = function(advice) {
    this.storage.push(advice)
    if(!!advice.length) this.asyncCount++
  }

  AdviceStack.prototype.get = function(num) {
    return this.storage[num]
  }

  AdviceStack.prototype.getLength = function(){
    return this.storage.length
  }

  // Setup
  // =====
  function setupAdvice(obj, name){
    if(typeof obj._withAdvice === 'undefined') {
      obj._withAdvice = {}
      obj._withAdvice[name] = {before: new AdviceStack, after:  new AdviceStack}

      var fn = obj[name] || noop

      obj[name] = function() {
        var suite = new AdviceSuite(this, name, fn, arguments)
        return suite.run()
      }

    }
  }

  // Advice Suite
  // ============
  function AdviceSuite(ctx, name, fn, args){
    this.ctx  = ctx
    this.name = name
    this.fn   = fn
    this.args = slice.call(args)
    if (typeof args[args.length-1] === 'function') this.errorFallback = args[args.length-1]
  }

  AdviceSuite.prototype.run = function run() {
    this.stack = this.ctx._withAdvice[this.name].before
    this.adviceCount = this.stack.getLength()
    this.asyncLeft   = this.stack.asyncCount
    return this.next()
  }

  AdviceSuite.prototype.done = function done() {
    if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice())

    var res = this.fn.apply(this.ctx, this.args)

    this.stack = this.ctx._withAdvice[this.name].after
    this.asyncLeft   = this.stack.asyncCount

    this.next = function next(){
      if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice())

      if (++this.adviceCount < this.stack.getLength()) {
        var advice = this.getCurrentAdvice()
          , args   = this.adviceArguments(advice)

        return advice.apply(this.ctx, args)
      }

      return res
    }

    return this.next()
  }

  AdviceSuite.prototype.next = function next() {
    if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice())

    if (--this.adviceCount >= 0) {
      var advice = this.getCurrentAdvice()
        , args   = this.adviceArguments(advice)
      return advice.apply(this.ctx, args)
    }
    return this.done()
  }

  AdviceSuite.prototype.getCurrentAdvice = function getCurrentAdvice(){
    var advice = this.stack.get(this.adviceCount)
    if (advice.length === 0){
      var suite = this
      return function syncAdvice(){
        try { advice.apply(suite.ctx, arguments); return suite.next() }
        catch(e) { suite.handleError(e, advice) }
      }
    }
    return advice
  }

  AdviceSuite.prototype.handleError = function handleError(err, advice) {
    if(typeof advice.error === 'function') return advice.error.call(this.ctx, err)
    if(typeof this.errorFallback === 'function') return this.errorFallback.call(this.ctx, err)
    throw err
  }

  AdviceSuite.prototype.asyncDone = function asyncDone(advice){
    return function handleDone(err) {
      if (err && err instanceof Error) return this.handleError(err, advice)
      return --this.asyncLeft ? this.next() : this.done()
    }
  }

  AdviceSuite.prototype.adviceArguments = function(advice){
    if(advice.length === 0){ return this.args }
    if(advice.length === 1){ return [this.next.bind(this)].concat(this.args) }
    if(advice.length >=  2){ return [this.next.bind(this), this.asyncDone(advice).bind(this)].concat(this.args) }
  }

  function around(method, advice){
    var fn = this[method]
    this[method] = function(){
      var args = [fn]
      push.apply(args, arguments)
      return advice.apply(this, args)
    }
    return this
  }

}(this);
