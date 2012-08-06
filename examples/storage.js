var withAdvice = require('./..');

// # Storage Example
//
// Build the base for the prototype (encode and decode will be attached to the prototype when calling withAdvice.compose).
//

function baseStorage() {
  this.initialize = function(attrs) {
    if (!this.namespace) {
      throw new TypeError('Missing "namespace" attribute.');
    }
  };

  this.encode = function(item) { return JSON.stringify(item) };
  this.decode = function(item) { return JSON.parse(item) };

  if (!('undefined' == typeof window) && window.localStorage) {
    storageEngine.call(this);
    return;
  }
};

//
// Build a storage engine:
//

function localStorageEngine() {
  this.getItem = function(key) {
    return this.decode(localStorage.getItem(this.namespace + key));
  };

  this.setItem = function(key, val) {
    return localStorage.setItem(this.namespace + key, this.encode(val));
  };
};

//
// Build an alternate storage engine:
//

function memoryStorageEngine() {
  var store = {};

  this.after('initialize', function() {
    this.store = store[this.namespace] = store[this.namespace] || {};
  });

  this.getItem = function(key) {
    return this.decode(this.store[this.namespace + key]);
  };

  this.setItem = function(key, val) {
    return this.store[this.namespace + val] = this.encode(val);
  };
};


//
// Build an aspect for encryption:
//

function withEncryption() {
  this.after('initialize', function(attrs) {
    if (!this.secret) {
      throw new TypeError('Missing "secret" attribute.');
    }
  });

  this.around('decode', function(decode, item) {
    return decode(aes.dec(val, this.secret));
  });

  this.around('encode', function(encode, item) {
    return aes.enc(encode(val), this.secret);
  });
};


//
// Apply and compose the different aspects to compose constructor functions:
//

var LocalStorage = withAdvice.compose(baseStorage, localStorageEngine, withEncryption);
var MemoryStorage = withAdvice.compose(baseStorage, memoryStorageEngine, withEncryption);

var localStorage  = new LocalStorage({namespace: 'withAdviceLibrary', secret: '1234'});
var memoryStorage = new MemoryStorage({namespace: 'withAdviceLibrary', secret: '1234'});

// Inspect the results
debugger;
