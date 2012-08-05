mocha  = require 'mocha'
advice = require './advice'

Crocodile = (@name, @gender)->

Crocodile.prototype.stalkTourists = ->
  console.log 'stalking tourists'

describe "withAdvice", ->
  it "adds methods to a prototype", ->
    withWalking.call(Crocodile.prototype)
    crock = new Crocodile(


  describe "#before", ->

  describe "#after", ->

  describe "#around", ->
