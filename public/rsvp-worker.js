/**
 * Web Worker for precise RSVP timing
 * Handles timing at high WPM without main thread interference
 */

let timerId = null;
let isRunning = false;

// Message handler
self.onmessage = function(e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      startTimer(payload.interval);
      break;
    case 'STOP':
      stopTimer();
      break;
    case 'UPDATE_INTERVAL':
      if (isRunning) {
        stopTimer();
        startTimer(payload.interval);
      }
      break;
    case 'TICK_WITH_DELAY':
      // Schedule next tick with custom delay
      if (isRunning) {
        stopTimer();
        setTimeout(() => {
          if (isRunning) {
            self.postMessage({ type: 'TICK' });
            startTimer(payload.baseInterval);
          }
        }, payload.delay);
      }
      break;
  }
};

function startTimer(interval) {
  isRunning = true;

  // Use recursive setTimeout for more precise timing than setInterval
  function tick() {
    if (!isRunning) return;

    self.postMessage({ type: 'TICK' });
    timerId = setTimeout(tick, interval);
  }

  timerId = setTimeout(tick, interval);
}

function stopTimer() {
  isRunning = false;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}
