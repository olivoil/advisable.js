var withAdvice = require('./../lib/withAdvice')
require('./helper')

function SUT(){
  this.value = 0
}

SUT.prototype = {
  method: function() {
    return ++this.value
  }
}

withAdvice.call(SUT.prototype)

describe('before', function() {

  it('calls the advice before the adviced method', function() {
    var obj = new SUT

    obj.before('method', function(arg) {
      expect(this).to.equal(obj)
      expect(arg).to.equal('foo')
      expect(this.value).to.equal(0)
    })

    var result = obj.method('foo')
    obj.value.should.equal(1)
    result.should.equal(obj.value)
  })

})
