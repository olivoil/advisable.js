
var Advisable = require('..');
var chai = require('chai')
var spies = require('chai-spies');
var Fixture;

var expect = chai.expect;
chai.use(spies);

describe('after', function() {

  beforeEach(function() {
    Fixture = function(){ this.value = 0 };
    Fixture.prototype.test = function() { return ++this.value };
    Advisable(Fixture.prototype);
  })

  it('calls the advice after the adviced method', function() {
    var fixture = new Fixture

    fixture.after('test', function() {
      expect(this.value).to.equal(1)
    })

    fixture.test()
    expect(fixture.value).to.equal(1)
  })

  it('returns the original return value', function() {
    var fixture = Advisable({test: function(arg){ return 'ok'}});
    fixture.after('test', function(){ return 'not ok' })
    expect(fixture.test()).to.equal('ok')
  })

  it('calls the advice in a FIFO order', function(done) {
    var fixture = new Fixture;
    var counter = 0;

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
    it('handles error with next', function(end) {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.after('test', function(next, done) {
        next(err);
      })

      fixture.test(function(e){
        expect(e).to.equal(err)
        end()
      })
    })

    it('handles error with done', function(over) {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.after('test', function(next, done) {
        next();
        done(err);
      })

      fixture.test(function(e){
        expect(e).to.equal(err)
        over()
      })
    })

    it('handles error with a callback', function(over) {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.after('test', function() { throw err }, function(e){
        expect(e).to.equal(err);
        over();
      })

      fixture.test();
    })

    it('handles error by throwing', function() {
      var fixture = new Fixture;
      var err = new Error('fixture error');

      fixture.after('test', function() { throw err })
      expect(function(){fixture.test()}).to.throw(/fixture error/)
    })
  })

  describe('async flow', function() {
    it('waits for all async advice to finish before returning', function(over) {
      var fixture = new Fixture;
      var spy = chai.spy();

      fixture
      .after('test', function(next, done) {
        spy(); done();
      })
      .after('test', function(next, done) {
        next();
        setTimeout(function(){ expect(spy).to.have.been.called.exactly(3); done(); over(); }, 5);
      })
      .after('test', function(next) {
        spy(); next();
      })
      .after('test', function() {
        spy();
      })

      fixture.test();
    })
  })
})
