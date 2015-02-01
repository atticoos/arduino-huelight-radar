var Events = require('./events');

module.exports = {
  createMotionEvent: function (threshold, previousEvents, currentValue) {
    if (currentValue < (threshold - 10)) {
      return new Events.MovementEvent(currentValue);
    } else {
      return new Events.IdleEvent(currentValue);
    }
  }
};
