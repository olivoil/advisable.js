var withAdvice = require('./..')
  , assert     = require('assert')
  , expect     = require('chai').expect
  , advice     = require('./advice')
  , animals    = require('./animals');

var beforeWalk, beforeSpeak;

module.exports = {
  'it has a version': function() {
    assert.equal(withAdvice.version, '0.0.1');
  },

  'it adds methods to a prototype': function() {
    var Crocodile = withAdvice.create(animals.crocodile, advice.withWalking, advice.withSwimming);
    var croc = new Crocodile({gender: 'Male', weight: 10, length: 0.5, age: 0.5});

    assert(croc.walk);
    assert.equal(croc.walk(), 'walking');

    assert(croc.swim);
    assert.equal(croc.swim(), 'swimming');
  },

  'it adds methods to an instance': function() {
    var Elephant = withAdvice.create(animals.elephant);
    var jumbo = new Elephant({gender: 'male', weight: 50, length: 0.5, age: 0.5});

    advice.withWalking.call(jumbo);
    advice.withSwimming.call(jumbo);
    assert(jumbo.walk);
    assert.equal(jumbo.walk(), 'walking');
    assert(jumbo.swim);
    assert.equal(jumbo.swim(), 'swimming');

    var ellie = new Elephant({gender: 'female', weightKg: 100, lengthM: 5, age: 5});
    expect(ellie.walk).to.be.undefined;
  },

  '#before': {
    before: function() {
      beforeWalk = function() {
        throw new Error("Too sick to walk");
      };

      beforeSpeak = function() {
        this.says = 'sniff, ' + this.says;
      };

      advice.withFlu = function() {
        this.before('walk', beforeWalk);
        this.before('speak', beforeSpeak);
      };
    },

    'it augments a prototype function': function() {
      var Duck = withAdvice.create(animals.duck, advice.withSpeech, advice.withWalking);
      advice.withFlu.call(Duck.prototype);

      var donald = new Duck({gender: 'male', weight: 1, length: 0.1, age: 2});
      assert.equal(donald.speak(), 'sniff, quack');
      assert.throws(function() { donald.walk() }, /Too sick to walk/);
    }
  },

  '#after': {
  },

  '#around': {
  }
}
