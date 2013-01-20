require('./helper')

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

      var res = adviced.call(this)

      expect(foo).to.equal('foo')
      expect(bar).to.equal('bar')

      return res
    })

    var result = obj.method('foo', 'bar')
    obj.value.should.equal(1)
    result.should.equal(obj.value)
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
