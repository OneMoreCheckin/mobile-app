(function() {
  'use strict';

  ['ms', 'moz', 'webkit', 'o'].some(function(prefix) {
    window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame']
                               || window[prefix + 'CancelRequestAnimationFrame'];
    return window.requestAnimationFrame;
  });

  if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback, element) {
      var currTime = Date.now();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      lastTime = currTime + timeToCall;
      return window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
    };
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
