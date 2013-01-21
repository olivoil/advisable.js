if(typeof require !== 'undefined') require('./support/helper')

describe('withAdvice', function() {
  beforeEach(function() {
    this.Fixture = function() {
      this.value = 0
    }
  })

  it('defines this.before', function() {
    expect(this.Fixture.prototype.before).to.not.exist
    withAdvice.call(this.Fixture.prototype)
    expect(this.Fixture.prototype.before).to.exist
  })

  it('defines this.after', function() {
    expect(this.Fixture.prototype.after).to.not.exist
    withAdvice.call(this.Fixture.prototype)
    expect(this.Fixture.prototype.after).to.exist
  })

  it('defines this.around', function() {
    expect(this.Fixture.prototype.around).to.not.exist
    withAdvice.call(this.Fixture.prototype)
    expect(this.Fixture.prototype.around).to.exist
  })

  it('returns this', function() {
    withAdvice.call(this.Fixture.prototype).should.equal(this.Fixture.prototype)
  })

  it('applies each mixin passed as arguments', function() {
    var self = this
      , test = function() { expect(this).to.equal(self.Fixture.prototype) }
      , spy  = sinon.spy(test)

    withAdvice.call(this.Fixture.prototype, spy, spy)
    expect(spy).to.have.been.calledTwice
  })
})
