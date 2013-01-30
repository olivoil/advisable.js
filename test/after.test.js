if(typeof require !== 'undefined') require('./support/helper')

describe('after', function() {
  beforeEach(function() {
    this.Fixture = function(){ this.value = 0 }
    this.Fixture.prototype.test = function() { return ++this.value }
    withAdvice.call(this.Fixture.prototype)
  })

  it('calls the advice after the adviced method', function() {
    var fixture = new this.Fixture

    fixture.after('test', function() {
      expect(this.value).to.equal(1)
    })

    fixture.test()
    expect(fixture.value).to.equal(1)
  })

  it('calls the advice in a FIFO order', function(done) {
    var fixture = new this.Fixture
      , counter = 0

    fixture
    .after('test', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(0)
    })
    .after('test', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(1)
    })
    .after('test', function() {
      expect(this.value).to.equal(1)
      expect(counter++).to.equal(2)
      done()
    })

    fixture.test()
  })

  describe('error handling', function() {
    it('handles error with next', function(over) {
      var fixture = new this.Fixture
        , err = new Error('fixture error')

      fixture.after('test', function(next, done) {
        next(err)
        done()
      })

      fixture.test(function(e){
        expect(e).to.equal(err)
        over()
      })
    })

    it('handles error with done', function(over) {
      var fixture = new this.Fixture
        , err = new Error('fixture error')

      fixture.after('test', function(next, done) {
        next()
        done(err)
      })

      fixture.test(function(e){
        expect(e).to.equal(err)
        over()
      })
    })

    it('handles error with callback', function(over) {
      var fixture = new this.Fixture
        , err = new Error('fixture error')

      fixture.after('test', function() { throw err }, function(e){
        expect(e).to.equal(err)
        over()
      })

      fixture.test()
    })

    it('handles error by throwing', function() {
      var fixture = new this.Fixture
        , err = new Error('fixture error')

      fixture.after('test', function() { throw err })
      expect(function(){fixture.test()}).to.throw(/fixture error/)
    })
  })

  describe('async flow', function() {
    it('waits for all async advice to finish before returning', function(over) {
      var fixture = new this.Fixture
        , spy = sinon.spy()

      fixture
      .after('test', function(next, done) {
        spy(); done();
      })
      .after('test', function(next, done) {
        next();
        setTimeout(function(){ spy.should.have.been.calledThrice; done(); over(); }, 5)
      })
      .after('test', function(next) {
        spy(); next()
      })
      .after('test', function() {
        spy()
      })

      fixture.test()
    })
  })
})
