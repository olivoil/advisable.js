
var Advisable = require('..');
var chai = require('chai')
var spies = require('chai-spies');
var Fixture;

var expect = chai.expect;
chai.use(spies);

describe('before', function() {
  beforeEach(function(done) {
    Fixture = function Fixture(){ this.value = 0 };
    Fixture.prototype.test = function test() { return ++this.value };
    Advisable(Fixture.prototype);
    done();
  })

  it('calls the advice before the actual function', function() {
    var spy = chai.spy();
    var fixture = new Fixture;

    fixture.before('test', function() {
      expect(this.value).to.equal(0);
      spy();
    });

    fixture.test('foo');
    expect(fixture.value).to.equal(1);
    expect(spy).to.have.been.called();
  })

  it('calls the advice with the adviced object as this', function(done) {
    var fixture = new Fixture;
    fixture.before('test', function() { expect(this).to.equal(fixture); done() });
    fixture.test();
  })

  it('returns the original function return value', function() {
    var fixture = new Fixture;
    fixture.before('test', function() { return null });
    expect(fixture.test()).to.equal(1);
  })

  it('invokes advice in a LIFO order', function() {
    var fixture = new Fixture;
    var counter = 0;
    var spy = chai.spy();

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

    expect(fixture.test('bar')).to.equal(fixture.value);
    expect(fixture.value).to.equal(1);
    expect(spy).to.have.been.called.exactly(3);
  })

  it('can be called on regular objects', function(done) {
    var fixture = Advisable({value: 0, test: function(){ return ++this.value }});
    fixture.before('test', function(){ expect(this.value).to.equal(0); done(); });
    fixture.test();
  })

  it('can be called on a constructor', function(done) {
    function Fix() { this.value = 0 }
    Fix.test = function() { return 'test' }
    Advisable(Fix);
    function advice(){
      this.before('test', function(){
        expect(this).to.equal(Fix);
        done();
      });
    }
    advice.call(Fix);
    Fix.test();
  })

  it('can be called on a prototype', function(done) {
    function Fix() { this.value = 1 }
    Fix.prototype.test = function() { return ++this.value }
    var fix = new Fix()
    Advisable(Fix.prototype);
    function advice(){
      this.before('test', function(){
        expect(this).to.equal(fix);
        expect(this.value).to.equal(1);
        done();
      });
    };
    advice.call(Fix.prototype);
    fix.test();
  })

  it('has access to the original arguments', function(over) {
    function Fix(){}
    Advisable(Fix.prototype);
    Fix.prototype.test = function() {};

    var fix = new Fix;
    var args = ['foo', 'bar', 'baz'];
    var verify = function(arg, i) { [].slice.call(arg, i).forEach(function(arg, i) { expect(arg).to.equal(args[i]) }) };

    fix
    .before('test', function()           { verify(arguments, 0); over() })
    .before('test', function(next)       { verify(arguments, 1); next() })
    .before('test', function(next, done) { verify(arguments, 2); done() })

    fix.test.apply(fix, args);
  })

  describe('async flow', function() {
    it('wait for async tests to finish running before calling the original function', function(over) {
      var fixture = new Fixture;
      var spy = chai.spy();

      fixture
      .before('test', function() { spy() })
      .before('test', function(next) { spy(); next() })
      .before('test', function(next, done) {
        next();
        setTimeout(function(){ expect(spy).to.have.been.called.exactly(3); done(); over(); }, 5);
      })
      .before('test', function(next, done) { spy(); done() })

      fixture.test();
    })

    it('handles error with next', function(over) {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.before('test', function(next, done) {
        next(err);
        done();
      });

      fixture.test(function(e){
        expect(e).to.equal(err);
        over();
      })
    })

    it('handles error with done', function(over) {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.before('test', function(next, done) {
        next();
        done(err);
      })

      fixture.test(function(e){
        expect(e).to.equal(err);
        over();
      })
    })

    it('can take 2 async arguments to process before advice in parallel', function() {
      var fixture   = new Fixture;
      var firstSpy  = chai.spy();
      var secondSpy = chai.spy();

      fixture.before('test', function(done){
        expect(firstSpy).not.to.have.been.called();
        secondSpy();
        done();
      }).before('test', function(next, done){
        next();
        firstSpy();
        done();
      })

      fixture.test();
      expect(firstSpy).to.have.been.called();
      expect(secondSpy).to.have.been.called();
    })

    describe('when done is called with an error', function() {

      it('calls the error callback', function(done) {
        var fixture = new Fixture;
        var err = new Error('async error');

        fixture.before('test', function(next) {
          next(err);
        }, function(error) {
          expect(error).to.equal(err);
          done();
        })

        fixture.test();
      })

      it('if a callback is provided and an error is thrown, it passes the error to the callback', function(done) {
        var fixture = new Fixture;
        var err = new Error('async error');

        fixture.before('test', function(cb){
          cb(err);
        });

        fixture.test(function(error){
          expect(error).to.equal(err);
          done();
        })
      })

      it('throws back the error if there is no error callback', function(done) {
        var fixture = new Fixture;
        var err = new Error('async error');

        fixture.before('test', function(next) { next(err); });

        try {
          fixture.test('foo');
        } catch(e){
          expect(e).to.equal(err);
          done();
        }
      })

      xit('throws after a certain timeout', function(done) {
        var fixture = new Fixture;
        fixture.before('test', function(next){ setTimeout(next, 200) }, 100);

        fixture.test(function(err) {
          expect(e).to.be.instanceof(Error);
          expect(e.message).to.equal('timeout of 100ms exceeded');
          done();
        })
      })
    })
  })

  describe('when sync', function() {
    it('proceeds right away', function() {
      var fixture = new Fixture;
      var spy = chai.spy();

      fixture.before('test', function() { setTimeout(spy, 300) }).before('test', function() { setTimeout(spy, 300) });
      fixture.test();
      expect(spy).not.to.have.been.called();
    })

    describe('when an error is thrown', function() {
      it('calls the error callback if an error is thrown', function(done) {
        var fixture = new Fixture;
        var err = new Error;

        fixture.before('test', function() { throw err }, function(error) {
          expect(error).to.equal(err);
          done();
        })

        fixture.test();
      })

      it('if a callback is provided and an error is thrown, it passes the error to the callback', function(done) {
        var fixture = new Fixture;
        var err = new Error;

        fixture.before('test', function() { throw err });

        fixture.test(function(error){
          expect(error).to.equal(err);
          done();
        })
      })

      it('throws back the error if there is no error callback', function(done) {
        var fixture = new Fixture;
        var err = new Error;

        fixture.before('test', function() { throw err });
        try { fixture.test() }
        catch(e) { expect(e).to.equal(err); done() }
      })
    })
  })
})
