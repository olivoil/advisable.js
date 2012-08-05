exports.crocodile = function() {
  this.lifeSpan = 70;
  this.haveBirdCleanTeeth = function() { console.log('a bird is cleaning my teeth'); };
  this.stalkTourists      = function() { console.log('stalking tourists'); };
};

exports.elephant = function() {
  this.lifeSpan = 60;
  this.says = "whoooooooop",
  this.doCleverThingsWithTrunk = function() {
    console.log('clever things are being done; with my trunk')
  }
};

exports.duck = function() {
  this.lifeSpan = 10;
  this.says = 'quack';
};
