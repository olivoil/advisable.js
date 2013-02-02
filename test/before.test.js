if(typeof require !== 'undefined') require('./support/helper')

describe('before', function() {
  beforeEach(function(done) {
    this.Fixture = function Fixture(){ this.value = 0 }
    this.Fixture.prototype.test = function test() { return ++this.value }
    withAdvice.call(this.Fixture.prototype)
    done()
  })

  it('calls the advice before the actual function', function() {
    var spy = sinon.spy()
      , fixture = new this.Fixture

    fixture.before('test', function() {
      expect(this.value).to.equal(0)
      spy()
    })

    fixture.test('foo')
    fixture.value.should.equal(1)
    spy.should.have.been.called
  })

  it('calls the advice with the adviced object as this', function(done) {
    var fixture = new this.Fixture
    fixture.before('test', function() { expect(this).to.equal(fixture); done() })
    fixture.test()
  })

  it('returns the original function return value', function() {
    var fixture = new this.Fixture
    fixture.before('test', function() { return null })
    fixture.test().should.equal(1)
  })

  it('invokes advice in a LIFO order', function() {
    var fixture = new this.Fixture
    , counter = 0
    , spy = sinon.spy()

    fixture
    .before('test', function() {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(2)
      spy()
    })
    .before('test', function() {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(1)
      spy()
    })
    .before('test', function() {
      expect(this.value).to.equal(0)
      expect(counter++).to.equal(0)
      spy()
    })

    fixture.test('bar').should.equal(fixture.value)
    fixture.value.should.equal(1)
    spy.should.have.been.calledThrice
  })

  describe('when async', function() {
    it('wait for async tests to finish running before calling the original function', function(over) {
      var fixture = new this.Fixture
        , spy = sinon.spy()

      fixture
      .before('test', function() { spy() })
      .before('test', function(next) { spy(); next() })
      .before('test', function(next, done) {
        next();
        setTimeout(function(){ spy.should.have.been.calledThrice; done(); over(); }, 5)
      })
      .before('test', function(next, done) { spy(); done() })

      fixture.test()
    })

    it('handles error with next', function(over) {
      var fixture = new this.Fixture
        , err = new Error('fixture error')

      fixture.before('test', function(next, done) {
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

      fixture.before('test', function(next, done) {
        next()
        done(err)
      })

      fixture.test(function(e){
        expect(e).to.equal(err)
        over()
      })
    })

    it('can take 2 async arguments to process before advice in parallel', function() {
      var fixture   = new this.Fixture
        , firstSpy  = sinon.spy()
        , secondSpy = sinon.spy()

      fixture.before('test', function(done){
        firstSpy.should.not.have.been.called
        secondSpy()
        done()
      }).before('test', function(next, done){
        next()
        firstSpy()
        done()
      })

      fixture.test()
      firstSpy.should.have.been.called
      secondSpy.should.have.been.called
    })

    describe('when done is called with an error', function() {

      it('calls the error callback', function(done) {
        var fixture = new this.Fixture
          , err = new Error('async error')

        fixture.before('test', function(next) {
          next(err)
        }, function(error) {
          error.should.equal(err)
          done()
        })

        fixture.test()
      })

      it('if a callback is provided and an error is thrown, it passes the error to the callback', function(done) {
        var fixture = new this.Fixture
        , err = new Error('async error')

        fixture.before('test', function(done) { done(err) })

        fixture.test(function(error){
          error.should.equal(err)
          done()
        })
      })

      it('throws back the error if there is no error callback', function(done) {
        var fixture = new this.Fixture
        , err = new Error('async error')

        try {
          fixture.before('test', function(next) { next(err) })
          fixture.test('foo')
        } catch(e){
          e.should.equal(err)
          done()
        }
      })

      xit('throws after a certain timeout', function(done) {
        var fixture = new this.Fixture
        fixture.before('test', function(next){ setTimeout(next, 200) }, 100)

        fixture.test(function(err) {
          e.should.be.instanceof(Error)
          e.message.should.equal('timeout of 100ms exceeded')
          done()
        })
      })
    })
  })

  describe('when sync', function() {
    it('proceeds right away', function() {
      var fixture = new this.Fixture
      , spy     = sinon.spy()

      fixture.before('test', function() { setTimeout(spy, 300) }).before('test', function() { setTimeout(spy, 300) })
      fixture.test()
      spy.should.not.have.been.called
    })

    describe('when an error is thrown', function() {
      it('calls the error callback if an error is thrown', function(done) {
        var fixture = new this.Fixture
          , err = new Error

        fixture.before('test', function() { throw err }, function(error) {
          error.should.equal(err)
          done()
        })

        fixture.test()
      })

      it('if a callback is provided and an error is thrown, it passes the error to the callback', function(done) {
        var fixture = new this.Fixture
          , err = new Error

        fixture.before('test', function() { throw err })

        fixture.test(function(error){
          error.should.equal(err)
          done()
        })
      })

      it('throws back the error if there is no error callback', function(done) {
        var fixture = new this.Fixture
          , err = new Error

        fixture.before('test', function() { throw err })
        try { fixture.test() }
        catch(e) { e.should.equal(err); done() }
      })
    })
  })

  it('can be called on regular objects', function(done) {
    var fixture = withAdvice.call({value: 0, test: function(){ return ++this.value }})
    fixture.before('test', function(){ expect(this.value).to.equal(0); done(); })
    fixture.test()
  })

  it('can be called on a constructor', function(done) {
    function Fix() { this.value = 0 }
    Fix.test = function test() { return 'test' }
    withAdvice.call(Fix, function() { this.before('test', function() { expect(this).to.equal(Fix); done(); })})
    Fix.test()
  })

  it('can be called on a prototype', function(done) {
    function Fix() { this.value = 1 }
    Fix.prototype.test = function() { return ++this.value }
    var fix = new Fix()
    withAdvice.call(Fix.prototype, function(){ this.before('test', function(){ expect(this).to.equal(fix); expect(this.value).to.equal(1); done() }) })
    fix.test()
  })
})
