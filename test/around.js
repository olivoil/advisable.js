
var Advisable = require('..');
var chai = require('chai')
var spies = require('chai-spies');
var Fixture;

var expect = chai.expect;
chai.use(spies);

function Fixture(){
  this.value = 0
}

Fixture.prototype = {
  method: function() {
    return ++this.value
  },
  methodWithoutReturn: function() {
    ++this.value
  }
}

Advisable(Fixture.prototype);

describe('around', function() {

  it('yields the adviced function', function(done) {
    var obj = new Fixture;

    obj.around('method', function(adviced, foo, bar) {
      expect(this).to.equal(obj);
      expect(adviced).to.be.a('function');
      adviced.call(this);
    })

    obj.method('foo', 'bar');
    expect(obj.value).to.equal(1);
    done();
  })

  it('returns the return value of the advice', function() {
    var obj = new Fixture;

    obj.around('method', function(adviced) {
      return 'baz';
    });

    expect(obj.method()).to.equal('baz');
  })

  it('yields the method arguments', function() {
    var obj = new Fixture;

    obj.around('method', function(adviced, foo, bar) {
      expect(foo).to.equal('foo');
      expect(bar).to.equal('bar');
    })

    obj.method('foo', 'bar');
  })

  it('invokes advice in a LIFO order', function(done) {
    var inner = chai.spy();
    var obj = new Fixture;

    obj.around('method', function(method) {
      inner();
      method.call(this);
    })

    obj.around('method', function(method) {
      expect(inner).to.not.have.been.called();
      method.call(this);
      expect(inner).to.have.been.called();
      done();
    })

    obj.method('foo');
  })

})
