var BaseEvent = require('./base-event.js'),
    util = require('util');

module.exports = (function () {
  function WaveEvent (sample) {
    BaseEvent.call(this, sample);
    this.type = BaseEvent.ACTION_WAVE;
  }

  util.inherits(WaveEvent, BaseEvent);

  return WaveEvent;
}).call(this);
