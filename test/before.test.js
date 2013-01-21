if(typeof require !== 'undefined') require('./support/helper')

function Fixture(){
  this.value = 0
}

Fixture.prototype = {
  method: function() {
    return ++this.value
  }
}

withAdvice.call(Fixture.prototype)

describe('before', function() {
  it('calls the advice before the adviced method', function() {
    var obj = new Fixture

    obj.before('method', function(arg) {
      expect(this).to.equal(obj)
      expect(arg).to.equal('foo')
      expect(this.value).to.equal(0)
    })

    var result = obj.method('foo')
    obj.value.should.equal(1)
    result.should.equal(obj.value)
  })

  it('invokes advice in a LIFO order', function() {
    var obj     = new Fixture
      , counter = 0

    obj.before('method', function(arg) {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(2)
    })

    obj.before('method', function(arg) {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(1)
    })

    obj.before('method', function(arg) {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(0)
    })

    var result = obj.method('bar')
    obj.value.should.equal(1)
    result.should.equal(obj.value)
  })

})
