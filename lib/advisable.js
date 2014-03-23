
/**
 * Module dependencies.
 */

var assimilate = require('assimilate');
var noop = function noop(){};
var namespace = require('./namespace');
var Stack = require('./stack');
var Suite = require('./suite');
var polyfill = require('./polyfill');

/**
 * Expose `Advisable`.
 */

module.exports = Advisable;

/**
 * Enable 
 */

function Advisable(obj){
  if (obj) return mixin(obj);
}

/**
 * Mixin `Advisable`.
 */

function mixin(obj){
  for (var key in Advisable.prototype) {
    obj[key] = Advisable.prototype[key];
  }
  return obj;
}

Advisable.prototype.before = function(name, fn, err){
  addAdvice(this, name, fn, {error: err, type: 'before'});
  return this
}

Advisable.prototype.after = function(name, fn, err){
  addAdvice(this, name, fn, {error: err, type: 'after'})
  return this;
}

Advisable.prototype.around = function(name, fn){
  var func = this[name];
  this[name] = function(){
    var args = [func];
    [].push.apply(args, arguments);
    return fn.apply(this, args);
  }
  return this;
}

/**
 * Add `advice` function on `obj.name`.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} advice
 * @param {Object} opts
 * @api private
 */

function addAdvice(obj, name, advice, opts){
  setupAdvice(obj, name);
  assimilate(advice, opts);
  obj[namespace][name][opts.type].push(advice);
  return obj;
}

function setupAdvice(obj, name){
  if('undefined' == typeof obj[namespace]) {
    obj[namespace] = {}

    obj[namespace][name] = {
      before: new Stack,
      after:  new Stack
    }

    var fn = obj[name] || noop;

    obj[name] = function() {
      var suite = new Suite(this, name, fn, arguments);
      return suite.run();
    }
  }

  return obj;
}
