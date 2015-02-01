var Serial = require('./serial-stream.js'),
    EventStream = require('./event-stream'),
    MotionSensorEvent = require('./events/base-event'),
    Hue = require('./hue.js'),
    _ = require('lodash');

module.exports = (function () {
  var DISTANCE_THRESHOLD = 50,
      MAX_SAMPLES = 50,
      MOTION_TTL = 10000,
      LIGHT_ID = 2;
  function App () {
    this.stream = new Serial('/dev/tty.usbmodema0121');
    this.hue = new Hue(LIGHT_ID);
    // store for reference to unbind later
    this.sampleDataBind = this.sampleData.bind(this);
    this.stream.on('data', this.sampleDataBind);
    this.threshold = null;
    this.frequencySamples = {};
    this.lastEvent = null;
  }

  App.prototype.showLoading = function () {
    console.log('starting blink');
    return this.hue.blinkRed().then(function () {
      console.log('checking', this.threshold);
      if (this.threshold === null) {
        return this.showLoading();
      }
    }.bind(this));
  };

  App.prototype.start = function () {
    this.hue.init().then(function () {
      this.stream.start();
      this.showLoading();
    }.bind(this)).catch(function (error) {
      console.log('Error starting up', error);
      throw error;
    });
  };

  App.prototype.onStreamData = function (data) {
    console.log('--------', data, '--------');

    if (this.threshold === null) {
      this.sample(data);
    } else {
      if (data < this.threshold) {
        this.hue.turnOn();
      } else {
        this.hue.turnOff();
      }
    }
  };

  App.prototype.sampleData = function (data) {
    data = Math.ceil(data);
    if (!(data in this.frequencySamples)) {
      this.frequencySamples[data] = 0;
    }
    this.frequencySamples[data]++;

    var totalCounts = _.reduce(this.frequencySamples, function (aggregate, occurances, value) {
      return aggregate + occurances;
    }, 0);

    if (totalCounts > MAX_SAMPLES) {
      for (var range in this.frequencySamples) {
        if (!this.threshold || (this.frequencySamples[range] > this.frequencySamples[this.threshold])) {
          this.threshold = range;
        }
      }
      this.stream.filter = true;
      this.churnStreams();
    }
  };

  App.prototype.churnStreams = function () {
    this.stream.removeListener('data', this.sampleDataBind);
    this.hue.blinkGreen().then(function () {
      this.eventStream = new EventStream(this.threshold);
      this.stream.pipe(this.eventStream);
      this.eventStream.on('data', this.onEvent.bind(this));
    }.bind(this));
  }

  App.prototype.onEvent = function (motionEvent) {
    if (this.hasEventExpired()) {
      if (!this.lastEvent || this.lastEvent.type !== motionEvent.type) {
        switch (motionEvent.type) {
          case MotionSensorEvent.ACTION_MOVEMENT:
            this.hue.turnOn();
            break;
          case MotionSensorEvent.ACTION_IDLE:
            this.hue.turnOff();
            break;
        }
      }
      console.log('updating event', motionEvent);
      this.lastEvent = motionEvent;
    }
  };

  App.prototype.hasEventExpired = function () {
    var now = (new Date()).getTime();
    if (!this.lastEvent) {
      return true;
    } else if (this.lastEvent.isIdle()) {
      return true;
    } else  if (this.lastEvent.isMovement() && (now - this.lastEvent.timeCaptured.getTime()) > MOTION_TTL) {
      return true;
    } else {
      return false;
    }
  };

  return App;
}).call(this);
