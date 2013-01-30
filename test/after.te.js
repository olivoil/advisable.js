if(typeof require !== 'undefined') require('./support/helper')

describe('after', function() {
  beforeEach(function() {
    this.Fixture = function(){ this.value = 0 }
    this.Fixture.prototype.method = function() { return ++this.value }
    withAdvice.call(this.Fixture.prototype)
  })

  it('calls the advice after the adviced method', function() {
    var fixture = new this.Fixture

    fixture.after('method', function() {
      expect(this.value).to.equal(1)
    })

    fixture.method('foo')
    expect(fixture.value).to.equal(1)
  })

  it('calls the advice in a FIFO order', function(done) {
    var fixture = new this.Fixture
      , counter = 0

    fixture
    .after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(0)
    })
    .after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(1)
    })
    .after('method', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(2)
      done()
    })

    fixture.method('foo')
  })

})
