var BaseEvent = require('./base-event.js'),
    util = require('util');

module.exports = (function () {
  function MovementEvent (sample) {
    BaseEvent.call(this, sample);
    this.type = BaseEvent.ACTION_MOVEMENT;
  }

  util.inherits(MovementEvent, BaseEvent);

  return MovementEvent;
}).call(this);
