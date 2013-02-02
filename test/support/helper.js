var chai      = require('chai')
  , sinonChai = require('sinon-chai')
  , array     = []

withAdvice = require('./../../lib/withAdvice')

chai.use(sinonChai)

GLOBAL._ = require('underscore')
assert = chai.assert
expect = chai.expect
sinon  = require('sinon')
slice  = array.slice

chai.should()
