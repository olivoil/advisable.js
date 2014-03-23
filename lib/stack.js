
/**
 * Expose `Stack`.
 */

module.exports = Stack;

/**
 * Create a new `Stack`.
 */

function Stack(){
  this.storage = [];
  this.asyncCount = 0;
}

Stack.prototype.push = function(advice) {
  this.storage.push(advice);
  if(advice.length) this.asyncCount++;
  return this;
}

Stack.prototype.get = function(i) {
  return this.storage[i];
}

Stack.prototype.length = function(){
  return this.storage.length;
}
