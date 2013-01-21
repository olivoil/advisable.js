var withAdvice = require('./..');

/* Storage Example
 * =============== */

// Storage
// =======
function Storage(options) {
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      this[prop] = options[prop]
    }
  }

  this.initialize.call(this, arguments)
}

withAdvice.call(Storage.prototype, baseStorage)


// Base Storage
// ============
function baseStorage() {
  this.initialize = function() {}
  this.encode     = function(item) { return JSON.stringify(item) }
  this.decode     = function(item) { return JSON.parse(item) }

  if (typeof window !== 'undefined' && window.localStorage) { localStorageEngine.call(this) }
  else { memoryStorageEngine.call(this) }

  return this
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

  return this
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

  return this
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

  return this
}

var storage          = new Storage({namespace: 'namespace'})
  , encryptedStorage = withEncryption.call(new Storage({namespace: 'encrypted', secret: 'secret'}))
