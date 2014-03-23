
/**
 * Module dependencies.
 */

var namespace = require('./namespace');

/**
 * Expose `Suite`.
 */

module.exports = Suite;

/**
 * Create a new `Suite`.
 */

function Suite(ctx, name, fn, args){
  this.ctx = ctx;
  this.name = name;
  this.fn = fn;
  this.args = [].slice.call(args);
  if (typeof args[args.length-1] === 'function') this.errorFallback = args[args.length-1];
}

Suite.prototype.run = function run() {
  this.stack = this.ctx[namespace][this.name].before;
  this.adviceCount = this.stack.length();
  this.asyncLeft = this.stack.asyncCount;
  return this.next();
}

Suite.prototype.done = function done() {
  if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice());

  var res = this.fn.apply(this.ctx, this.args);

  this.stack = this.ctx[namespace][this.name].after;
  this.asyncLeft = this.stack.asyncCount;

  this.next = function next(){
    if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice());

    if (++this.adviceCount < this.stack.length()) {
      var advice = this.getCurrentAdvice();
      var args = this.adviceArguments(advice);

      return advice.apply(this.ctx, args);
    }

    return res;
  }

  return this.next();
}

Suite.prototype.next = function next() {
  if (arguments[0] instanceof Error) return this.handleError(arguments[0], this.getCurrentAdvice());

  if (--this.adviceCount >= 0) {
    var advice = this.getCurrentAdvice();
    var args = this.adviceArguments(advice);
    return advice.apply(this.ctx, args);
  }

  return this.done();
}

Suite.prototype.getCurrentAdvice = function getCurrentAdvice(){
  var advice = this.stack.get(this.adviceCount);

  if (!advice.length){
    var self = this;
    return function syncAdvice(){
      try { advice.apply(self.ctx, arguments); return self.next() }
      catch(e) { self.handleError(e, advice) }
    }
  }
  return advice;
}

Suite.prototype.handleError = function handleError(err, advice) {
  if('function' == typeof advice.error) return advice.error.call(this.ctx, err);
  if('function' == typeof this.errorFallback) return this.errorFallback.call(this.ctx, err);
  throw err;
}

Suite.prototype.asyncDone = function asyncDone(advice){
  return function handleDone(err) {
    if (err && err instanceof Error) return this.handleError(err, advice);
    return --this.asyncLeft ? this.next() : this.done();
  }
}

Suite.prototype.adviceArguments = function(advice){
  if(0 == advice.length){ return this.args }
  if(1 == advice.length){ return [this.next.bind(this)].concat(this.args) }
  if(2 >= advice.length){ return [this.next.bind(this), this.asyncDone(advice).bind(this)].concat(this.args) }
}
