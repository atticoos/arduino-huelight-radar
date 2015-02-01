var Serial = require('./serial.js'),
    Hue = require('./hue.js');

module.exports = (function () {
  var DISTANCE_THRESHOLD = 50,
      LIGHT_ID = 2;
  function App () {
    this.stream = new Serial('/dev/tty.usbmodema0121');
    this.hue = new Hue(LIGHT_ID);
    this.stream.on('data', this.onStreamData.bind(this));
  }

  App.prototype.start = function () {
    this.hue.init().then(function () {
      this.stream.start();
    }.bind(this)).catch(function (error) {
      console.log('Error starting up', error);
      throw error;
    });
  };

  App.prototype.onStreamData = function (data) {
    console.log('--------', data, '--------');
    if (data < DISTANCE_THRESHOLD) {
      this.hue.turnOn();
    } else {
      this.hue.turnOff();
    }
  };

  return App;
}).call(this);
