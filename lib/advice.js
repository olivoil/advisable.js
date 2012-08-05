
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
  return function() {
    aspect.apply(this, arguments);
    return fn.apply(this, arguments);
  };
};

function doAfter(aspect, fn) {
  return function() {
    result = aspect.apply(this, arguments);
    fn.apply(this, arguments);
    return result;
  };
};
