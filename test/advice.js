;(function(){

  // expose

  var advice = {
      withSpeech: withSpeech
    , withWalking: withWalking
    , withFlying: withFlying
    , withSwimming: withSwimming
    , withEggLaying: withEggLaying
    , withMigration: withMigration
  }

  if ('undefined' == typeof exports) {
    window.advice = advice;
  } else {
    module.exports = advice;
  }

  // define

  function withSpeech() {
    this.speak = function () {
      return (this.says || "");
    };
  };

  function withWalking() {
    this.walk = function() {
      return ('walking');
    };
    this.turn = function(direction) {
      return ('turning ' + direction);
    };
    this.stopWalking = function() {
      return ('stopped walking');
    };
  };

  function withFlying() {
    this.takeOff = function() {
      return ('taking off');
    };
    this.turn = function(direction) {
      return ('turning ' + direction);
    };
    this.land = function() {
      return ('landing');
    };
  };

  function withSwimming() {
    this.swim = function() {
      return ('swimming');
    };
    this.stopSwimming = function() {
      return ('stopped swimming');
    };
  };

  function withEggLaying() {
    this.layEggs = function(number) {
      return ("laying " + number + " eggs");
    }
  };

  function withMigration() {
    this.migrate = function(direction) {
      return ('migrating ' + direction);
    };
  };
})();
