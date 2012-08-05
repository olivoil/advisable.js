/*!
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var advice = require('./advice');

// Expose

module.exports = {
  create: create
}


// Extend

function extend(destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      destination[k] = source[k];
    }
  }
  return destination;
};


// Create a Constructor function

function create() {
  var argsArray = [].slice.call(arguments)
    , Ctor      = function(attrs) {
                    extend(this, attrs);
                  };

  advice.call(Ctor.prototype);
  argsArray.forEach(function(mixin) {mixin.call(Ctor.prototype)});
  return Ctor;
};
