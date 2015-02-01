module.exports = (function () {
  function MotionSensorEvent (sample) {
    this.timeCaptured = new Date();
    this.data = sample;
  }

  MotionSensorEvent.prototype.isIdle = function () {
    return this.type === MotionSensorEvent.ACTION_IDLE;
  };

  MotionSensorEvent.prototype.isMovement = function () {
    return this.type === MotionSensorEvent.ACTION_MOVEMENT;
  };

  MotionSensorEvent.prototype.isWave = function () {
    return this.type === MotionSensorEvent.ACTION_WAVE;
  }

  MotionSensorEvent.ACTION_MOVEMENT = 'movement';
  MotionSensorEvent.ACTION_IDLE = 'idle';
  MotionSensorEvent.ACTION_WAVE = 'wave';

  return MotionSensorEvent;
}).call(this);
