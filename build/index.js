
/**
 * Module dependencies.
 */

var Builder = require('component-test-builder');
var commonjs = Builder.commonjs;
var concat = Builder.concat;
var fs = require('fs');
var write = fs.writeFileSync;
var mkdirp = require('mkdirp');
var Promise = require('promise');
var path = require('path');
var conf = require(path.resolve('component.json'));

/**
 * Expose build function.
 */

module.exports = function(next){
  Promise.all([
    buildTests(),
    buildDev(),
    buildStandalone()
  ]).nodeify(next);
}

/**
 * Build with tests and autotest loader.
 */

function buildTests(){
  return new Promise(function(resolve, reject){
    var start = new Date;
    var builder = new Builder(path.resolve('.'));
    builder.development();
    builder.test();

    builder.use(commonjs('scripts'));
    builder.use(commonjs('tests'));

    builder.use(concat('scripts'));
    builder.use(concat('tests'));

    mkdirp('./dist', function(err){
      if(err) return reject(err);

      builder.build(function(err, build){
        if (err) return reject(err);
        var js = '';
        js += build.requirejs || '';
        js += build.scripts || '';
        js += build.tests || '';
        js += build.aliases || '';
        js += build.testloader || '';
        write('./dist/test.js', js);
        console.log('built test in %sms', new Date - start);
        resolve();
      });
    });
  });
}

/**
 * Build for developement with sourceMapUrls and dev dependencies.
 */

function buildDev(){
  return new Promise(function(resolve, reject){
    var start = new Date;
    var builder = new Builder(path.resolve('.'));
    builder.development();

    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));

    mkdirp('./dist', function(err){
      if(err) return reject(err);

      builder.build(function(err, build){
        if (err) return reject(err);
        var js = '';
        js += build.requirejs || '';
        js += build.scripts || '';
        js += build.aliases || '';
        write('./dist/development.js', js);
        console.log('built development in %sms', new Date - start);
        resolve();
      });
    });
  });
}

/**
 * Build standalone version for production.
 */

function buildStandalone(){
  return new Promise(function(resolve, reject){
    var start = new Date;
    var builder = new Builder(path.resolve('.'));

    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));

    mkdirp('./dist', function(err){
      if(err) return reject(err);

      builder.build(function(err, build){
        if (err) return reject(err);
        var js = ';(function(){\n';
        js += build.requirejs || '';
        js += build.scripts || '';
        js += build.aliases || '';
        var umd = [
          'if (typeof exports == "object") {',
          '  module.exports = require("' + conf.name + '");',
          '} else if (typeof define == "function" && define.amd) {',
          '  define([], function(){ return require("' + conf.name + '"); });',
          '} else {',
          '  this["' + conf.name + '"] = require("' + conf.name + '");',
          '}'
        ];
        js += umd.join('\n');
        js += '})();';
        write('./dist/standalone.js', js);
        console.log('built standalone in %sms', new Date - start);
        resolve();
      });
    });
  });
}
