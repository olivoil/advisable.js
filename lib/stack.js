
/**
 * Expose `Stack`.
 */

module.exports = Stack;

/**
 * Create a new `Stack`.
 */

function Stack(){
  this.callbacks = [];
  this.asyncCount = 0;
}

Stack.prototype.push = function(advice) {
  this.callbacks.push(advice);
  if(advice.length) this.asyncCount++;
  return this;
}

Stack.prototype.get = function(i) {
  return this.callbacks[i];
}

Stack.prototype.length = function(){
  return this.callbacks.length;
}
