var Promise = require('bluebird'),
    Hue = require('node-hue-api'),
    HueApi = Hue.HueApi,
    LightState = Hue.lightState,
    username = 'newdeveloper';

module.exports = (function () {


  function HueControl (lightId) {
    this.api = null;
    this.lightId = lightId;
  }

  HueControl.prototype.init = function () {
    return Hue.nupnpSearch().then(function (bridges) {
      return bridges[0];
    }).then(function (bridge) {
      this.api = new HueApi(bridge.ipaddress, username);
    }.bind(this)).then(function () {
      return this.api.getFullState().then(function (state) {
        if (!this.lightId in state.lights) {
          throw new Error('LightID not found on hue bridge');
        }
      }.bind(this));
    }.bind(this)).then(function () {
      return this.turnOn();
    }.bind(this)).then(function () {
      return this.blink();
    }.bind(this));
  };

  HueControl.prototype.turnOn = function () {
    var state = LightState.create().on();
    return this.api.setLightState(this.lightId, state);
  };

  HueControl.prototype.turnOff = function () {
    var state = LightState.create().off();
    return this.api.setLightState(this.lightId, state);
  };

  HueControl.prototype.blink = function () {
    var red = LightState.create().rgb(255, 0, 0),
        yellow = LightState.create().rgb(255, 255, 0),
        green = LightState.create().rgb(0, 255, 0),
        white = LightState.create().rgb(255, 255, 255);
    return this.turnOn().then(function () {
      return this.api.setLightState(this.lightId, red);
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOff();
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOn();
    }.bind(this)).then(function () {
      return this.api.setLightState(this.lightId, yellow);
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOff();
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOn();
    }.bind(this)).then(function () {
      return this.api.setLightState(this.lightId, green);
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOff();
    }.bind(this)).then(function () {
      return delay();
    }).then(function () {
      return this.turnOn();
    }.bind(this)).then(function () {
      return this.api.setLightState(this.lightId, white);
    }.bind(this)).then(function () {
      return delay();
    })
  };

  function delay (ms) {
    var deferred = Promise.pending();
    setTimeout(function () {
      deferred.fulfill();
    }, ms | 1000);
    return deferred.promise;
  }

  return HueControl;
}).call(this);
