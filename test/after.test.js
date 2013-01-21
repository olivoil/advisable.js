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

describe('after', function() {

  it('calls the advice after the adviced method', function() {
    var obj = new Fixture

    obj.after('method', function() {
      expect(this.value).to.equal(1)
    })

    obj.method('foo')
    obj.value.should.equal(1)
  })

  it('returns the return value of the advice if the advice returns a value', function() {
    var obj = new Fixture

    obj.after('method', function(res) {
      return res + ' from the after advice'
    })

    obj.method('foo').should.equal('1 from the after advice')
  })

  it('returns the return value of the adviced method if the advice returns nothing', function() {
    var obj = new Fixture

    obj.after('method', function() {
      this.afterRun = true
      return;
    })

    obj.method('foo').should.equal(1)
  })

  it('calls the advice with the return value from the adviced function', function() {
    var obj = new Fixture

    obj.after('method', function(res, arg) {
      expect(res).to.equal(1)
      expect(arg).to.equal('baz')
    })

    obj.method('baz')
  })

  it('calls the advice with the arguments passed to the adviced function', function() {
    var obj = new Fixture

    obj.after('methodWithoutReturn', function() {
      var args = slice.call(arguments)
      expect(args).to.equal(['fu', 'bar', 'baz'])
    })

    obj.method('fu', 'bar', 'baz')
  })

  it('calls the advice in a FIFO order', function() {
    var obj     = new Fixture
      , counter = 0

    obj.after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(0)
    })

    obj.after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(1)
    })

    obj.after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(2)
    })

    var result = obj.method('foo')
    obj.value.should.equal(1)
  })

})
