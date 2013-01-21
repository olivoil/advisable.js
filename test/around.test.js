if(typeof require !== 'undefined') require('./support/helper')

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

withAdvice.call(Fixture.prototype)

describe('around', function() {

  it('yields the adviced function', function() {
    var obj = new Fixture

    obj.around('method', function(adviced, foo, bar) {
      expect(this).to.equal(obj)
      adviced.should.be.a('function')

      adviced.call(this)
    })

    obj.method('foo', 'bar')
    obj.value.should.equal(1)
  })

  it('returns the return value of the advice', function() {
    var obj = new Fixture

    obj.around('method', function(adviced) {
      return 'baz'
    })

    obj.method().should.equal('baz')
  })

  it('yields the method arguments', function() {
    var obj = new Fixture

    obj.around('method', function(adviced, foo, bar) {
      expect(foo).to.equal('foo')
      expect(bar).to.equal('bar')
    })

    obj.method('foo', 'bar')
  })

  it('invokes advice in a LIFO order', function() {
    var inner = sinon.spy()
      , obj   = new Fixture

    obj.around('method', function(method) {
      inner()
      method.call(this)
    })

    obj.around('method', function(method) {
      inner.should.not.have.been.called
      method.call(this)
      inner.should.have.been.called
    })

    obj.method('foo')
  })

})
