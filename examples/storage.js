var withAdvice = require('./..');

/* Storage Example
 * =============== */

// Storage
// =======
function Storage() {
  this.initialize.call(this, arguments)
}

Storage.prototype.initialize = function(attrs) {
  for (var prop in attrs) {
    if (attrs.hasOwnProperty(prop)) {
      this[prop] = attrs[prop]
    }
  }
}

withAdvice.call(Storage.prototype)
baseStorage.call(Storage.prototype)


// Base Storage
// ============
function baseStorage() {
  this.encode = function(item) { return JSON.stringify(item) }
  this.decode = function(item) { return JSON.parse(item) }

  memoryStorageEngine.call(this)

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorageEngine.call(this)
  }

  return this;
}

// Local Storage Engine
// ====================

function localStorageEngine() {
  this.getItem = function(key) {
    return this.decode(localStorage.getItem(this.namespace + key))
  }

  this.setItem = function(key, val) {
    return localStorage.setItem(this.namespace + key, this.encode(val))
  }

  return this;
}



// Memory Storage Engine
// =====================

function memoryStorageEngine() {
  var store = {}

  this.after('initialize', function() {
    this.store = store[this.namespace] = store[this.namespace] || {}
  })

  this.getItem = function(key) {
    return this.decode(this.store[this.namespace + key])
  }

  this.setItem = function(key, val) {
    return this.store[this.namespace + val] = this.encode(val)
  }

  return this;
}





// Add encryption to storage engines
// =================================

function withEncryption() {
  this.around('decode', function(decode, item) {
    return decode(aes.enc(item, this.secret))
  })

  this.around('encode', function(encode, item) {
    return aes.enc(encode(val), this.secret)
  })

  return this;
}

var storage = new Storage({namespace: 'namespace'})
var encryptedStorage = withEncryption.call(new Storage({namespace: 'encrypted', secret: 'secret'}))

// Inspect the results
debugger;
