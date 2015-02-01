var Events = require('./events'),
    MIN_GAP = 2;

function isWave (previousEvents, currentValue) {
  var count = 0;
  for (var i = 0; i < previousEvents.length; i++) {

    if (previousEvents[i] && previousEvents[i].data <= 10) {
      count++;
    }
  }
  return count > Math.floor(previousEvents.length / 2);
}

module.exports = {
  createMotionEvent: function (threshold, previousEvents, currentValue) {
    var presence = currentValue < (threshold - MIN_GAP);

    if (isWave(previousEvents, presence)) {
      return new Events.WaveEvent(currentValue);
    } else if (presence) {
      return new Events.MovementEvent(currentValue);
    } else {
      return new Events.IdleEvent(currentValue);
    }
  }
};
