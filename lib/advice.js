
var advice = module.exports = function() {
  this.before = before;
  this.after  = after;
  // this.around = around;
};


function before(method, aspect) {
  this[method] = doBefore(aspect, this[method]);
};

function after(method, aspect) {
  this[method] = doAfter(aspect, this[method]);
};

function doBefore(aspect, fn) {
  return addBefore(aspect, fn, function() {
    aspect.apply(this, arguments);
    return fn.apply(this, arguments);
  });
};

function doAfter(aspect, fn) {
  return addAfter(aspect, function() {
    result = aspect.apply(this, arguments);
    fn.apply(this, arguments);
    return result;
  });
};

function addBefore(aspect, original, fn) {
  var fun = clone(fn);
  var metadata = fun._advice || (fun._advice = {});
  metadata.original = restore(original);
  metadata.before || (metadata.before = []);
  metadata.before.push(aspect);
  return fun;
};

function addAfter(aspect, fn) {
  var fun = clone(fn);
  var metadata = fun._advice || (fun._advice = {});
  metadata.original = restore(original);
  metadata.after || (metadata.after = []);
  metadata.after.push(aspect);
  return fun;
};

function isUndefined(obj) {
  return obj === void 0;
};

function restore(obj) {
  return isUndefined(obj._original)
         ? obj
         : restore(obj._original)
}

function clone(src) {
  function mixin(dest, source, copyFunc) {
    var name, s, i, empty = {};
    for(name in source){
      // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
      // inherited from Object.prototype.   For example, if dest has a custom toString() method,
      // don't overwrite it with the toString() method that source inherited from Object.prototype
      s = source[name];
      if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
        dest[name] = copyFunc ? copyFunc(s) : s;
      }
    }
    return dest;
  }

  if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
    // null, undefined, any non-object, or function
    return src;  // anything
  }
  if(src.nodeType && "cloneNode" in src){
    // DOM Node
    return src.cloneNode(true); // Node
  }
  if(src instanceof Date){
    // Date
    return new Date(src.getTime());  // Date
  }
  if(src instanceof RegExp){
    // RegExp
    return new RegExp(src);   // RegExp
  }
  var r, i, l;
  if(src instanceof Array){
    // array
    r = [];
    for(i = 0, l = src.length; i < l; ++i){
      if(i in src){
        r.push(clone(src[i]));
      }
    }
    // we don't clone functions for performance reasons
    //    }else if(d.isFunction(src)){
    //      // function
    //      r = function(){ return src.apply(this, arguments); };
  }else{
    // generic objects
    r = src.constructor ? new src.constructor() : {};
  }
  return mixin(r, src, clone);
};
