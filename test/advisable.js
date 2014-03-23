
var Fixture;
var Advisable = require('..');
var expect = require('chai').expect;

describe('Advisable', function() {
  beforeEach(function() {
    Fixture = function() {
      this.value = 0;
    }
  })

  it('defines `before`', function() {
    expect(Fixture.prototype.before).to.not.exist;
    Advisable(Fixture.prototype);
    expect(Fixture.prototype.before).to.exist;
  })

  it('defines `after`', function() {
    expect(Fixture.prototype.after).to.not.exist;
    Advisable(Fixture.prototype);
    expect(Fixture.prototype.after).to.exist;
  })

  it('defines `around`', function() {
    expect(Fixture.prototype.around).to.not.exist;
    Advisable(Fixture.prototype);
    expect(Fixture.prototype.around).to.exist;
  })

  it('returns `obj`', function() {
    expect(Advisable(Fixture.prototype)).to.equal(Fixture.prototype);
  })
})
