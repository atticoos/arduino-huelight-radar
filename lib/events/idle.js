var BaseEvent = require('./base-event.js'),
    util = require('util');

module.exports = (function () {
  function IdleEvent (sample) {
    BaseEvent.call(this, sample);
    this.type = BaseEvent.ACTION_IDLE;
  }

  util.inherits(IdleEvent, BaseEvent);

  return IdleEvent;
}).call(this);
