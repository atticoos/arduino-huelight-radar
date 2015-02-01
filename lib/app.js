var Serial = require('./serial-stream.js'),
    EventStream = require('./event-stream'),
    MotionSensorEvent = require('./events/base-event'),
    Hue = require('./hue.js'),
    _ = require('lodash');

module.exports = (function () {
  var DISTANCE_THRESHOLD = 50,
      MAX_SAMPLES = 100,
      MOTION_TTL = 10000,
      LIGHT_ID = 2;

  function App (serialPort) {
    this.stream = new Serial(serialPort);
    this.hue = new Hue(LIGHT_ID);
    // store for reference to unbind later
    this.onSamplerData = this.sampleData.bind(this);
    this.onEventData = this.onEvent.bind(this);

    this.threshold = null;
    this.frequencySamples = {};
    this.lastEvent = null;
  }

  App.prototype.showLoading = function () {
    return this.hue.blinkRed().then(function () {
      if (this.threshold === null) {
        return this.showLoading();
      }
    }.bind(this));
  };

  App.prototype.start = function () {
    this.hue.init().then(function () {
      this.stream.start();
      this.sampleRange();
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

  App.prototype.sampleRange = function () {
    if (this.eventStream) {
      console.log('killing event listnrs');
      this.eventStream.removeListener('data', this.onEventData);
    }
    this.threshold = null;
    this.showLoading();
    this.stream.filter = false;

    setTimeout(function () {
      this.stream.on('data', this.onSamplerData);
    }.bind(this), 1000);
  }

  App.prototype.sampleData = function (data) {
    var totalCount, range;
    if (!(data in this.frequencySamples)) {
      this.frequencySamples[data] = 0;
    }
    this.frequencySamples[data]++;

    totalCount = _.reduce(this.frequencySamples, function (aggregate, occurances) {
      return aggregate + occurances;
    }, 0);

    if (totalCount > MAX_SAMPLES) {
      for (range in this.frequencySamples) {
        if (!this.threshold || (this.frequencySamples[range] > this.frequencySamples[this.threshold])) {
          this.threshold = range;
        }
      }
      this.stream.filter = true;
      this.frequencySamples = {};
      this.churnStreams();
      console.log('----------- SETTING THRESHOLD ' + this.threshold + ' ------------');
    }
  };

  App.prototype.churnStreams = function () {
    this.stream.removeListener('data', this.onSamplerData);
    this.hue.blinkGreen().then(function () {
      if (!this.eventStream) {
        this.eventStream = new EventStream(this.threshold);
        this.stream.pipe(this.eventStream);
      } else {
        this.eventStream.reinit(this.threshold);
      }
      this.eventStream.on('data', this.onEventData);
    }.bind(this));
  }

  App.prototype.onEvent = function (motionEvent) {
    if (motionEvent.isWave()) {
      console.log('WAVING');
      this.sampleRange();
    } else if (this.hasEventExpired()) {
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
