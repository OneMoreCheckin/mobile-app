/**
 * Alternatives and inspiration for this shim:
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://creativejs.com/resources/requestanimationframe/
 * http://strd6.com/2011/05/better-window-requestanimationframe-shim/
 * https://gist.github.com/paulirish/1579671
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */


(function() {
  'use strict';

  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; (x < vendors.length) && (!window.requestAnimationFrame); ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback/*, element*/) {
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
