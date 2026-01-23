/**
 * Web Worker for precise RSVP timing
 * Handles timing at high WPM without main thread interference
 */

let timerId = null;
let delayedTimerId = null;
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
        clearCurrentTimer();
        startTimerLoop(payload.interval);
      }
      break;
    case 'TICK_WITH_DELAY':
      // Schedule next tick with custom delay
      if (isRunning) {
        // Clear the current timer but keep isRunning = true
        clearCurrentTimer();

        // Schedule the delayed tick
        delayedTimerId = setTimeout(() => {
          if (isRunning) {
            self.postMessage({ type: 'TICK' });
            startTimerLoop(payload.baseInterval);
          }
        }, payload.delay);
      }
      break;
  }
};

function startTimer(interval) {
  isRunning = true;
  startTimerLoop(interval);
}

function startTimerLoop(interval) {
  // Use recursive setTimeout for more precise timing than setInterval
  function tick() {
    if (!isRunning) return;

    self.postMessage({ type: 'TICK' });
    timerId = setTimeout(tick, interval);
  }

  timerId = setTimeout(tick, interval);
}

function clearCurrentTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  if (delayedTimerId !== null) {
    clearTimeout(delayedTimerId);
    delayedTimerId = null;
  }
}

function stopTimer() {
  isRunning = false;
  clearCurrentTimer();
}
