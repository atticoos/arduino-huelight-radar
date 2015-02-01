var serialPort = require('serialport'),
    SerialPort = serialPort.SerialPort,
    Stream = require('stream'),
    util = require('util');

module.exports = (function () {
  var DEFAULT_BAUD = 9600,
      SAMPLE_TTL = 1000;

  function SerialPortControl (port, baudRate) {
    Stream.Transform.call(this);
    this.port = port;
    this.baudRate = baudRate || DEFAULT_BAUD;

    this.filter = false;
    this.sampleBuffer = [];
    this.lastEmit = null;
    this._writableState.objectMode = true;
    this._readableState.objectMode = true;
  }

  util.inherits(SerialPortControl, Stream.Transform);

  SerialPortControl.prototype.start = function () {
    if (this.serialPort) {
      this.serialPort.close();
    } else {
      console.log(this.port, this.baudRate);
      this.serialPort = new SerialPort(this.port, {
        baudRate: this.baudRate,
        parser: serialPort.parsers.readline("\n")
      });
      this.serialPort.on('data', function (data) {
        console.log(data.toString());
      });
      this.serialPort.pipe(this);
    }
  };

  SerialPortControl.prototype._transform = function (chunk, encoding, done) {
    var data = parseInt(chunk.toString());
    if (data && !isNaN(data)) {
      if (this.filter) {
        this.queue(data);
      } else {
        this.push(data);
      }
    }
    done();
  };

  SerialPortControl.prototype.queue = function (data) {
    var now = new Date();
    this.sampleBuffer.push(data);
    if ((!this.lastEmit && this.sampleBuffer.length > 10) ||
        (this.lastEmit && (now - this.lastEmit > SAMPLE_TTL))) {
      var avg = this.getAverageDistance();
      this.push(avg.toString());
      this.sampleBuffer = [];
      this.lastEmit = now;
    }
  };

  SerialPortControl.prototype.getAverageDistance = function () {
    return this.sampleBuffer.reduce(function (aggregate, currentValue) {
      return aggregate + currentValue;
    }, 0) / (this.sampleBuffer.length);
  };

  return SerialPortControl;
}).call(this);
