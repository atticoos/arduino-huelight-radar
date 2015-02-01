var EventFactory = require('./event-factory'),
    Stream = require('stream'),
    util = require('util');

module.exports = (function () {

  function EventStream (threshold) {
    Stream.Transform.call(this);
    this.threshold = threshold;
    this.buffer = new Array(10);

    this._writableState.objectMode = true;
    this._readableState.objectMode = true;
  }

  util.inherits(EventStream, Stream.Transform);

  EventStream.prototype._transform = function (data, encoding, done) {
    var motionEvent = EventFactory.createMotionEvent(this.threshold, this.buffer, data);
    this.buffer.unshift(motionEvent);
    this.buffer.pop();
    this.push(motionEvent);
    done();
  };

  EventStream.prototype.reinit = function (threshold) {
    this.threshold = threshold;
    this.buffer = new Array(10);
  }

  return EventStream;

}).call(this);
