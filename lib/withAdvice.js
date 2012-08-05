/*!
 * withAdvice
 * Copyright(c) 2012 Olivier Melcher <olivier.melcher@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var factory = require('./factory')
  , withAdvice = require('./advice');


/**
 * Augment an object with AOP methods 'before', 'after', 'around'
 *
 * @api public
 */

module.exports = withAdvice;

/**
 * Library version.
 *
 * @type String
 */

withAdvice.version = '0.0.1';


/**
 * Create a new constructor function, based on a prototype blueprint, augmented with the given advice.
 * Each property of the blueprint will be added to the prototype of the constructor.
 * The constructor function will take a hash of arguments, representing the attributes of the new object.
 *
 * Examples:
 *
 *    var animal = function() {
 *      this.lifeSpan = 10;
 *    };
 *
 *    var withFlying = function() {
 *      this.fly = function() {
 *        console.log('Flying');
 *      };
 *    };
 *
 *    var Bird = withAdvice.create(animal, withFlying);
 *    var bird = new Bird({name: 'birdie'});
 *
 *    console.log( bird.lifeSpan );
 *    // => 10
 *
 *    console.log( bird.name );
 *    // => "birdie"
 *
 *    bird.fly();
 *    // => "Flying"
 *
 * @param {Function} blueprint
 * @param {Function} advice
 * @api public
 */

withAdvice.create = factory.create;
