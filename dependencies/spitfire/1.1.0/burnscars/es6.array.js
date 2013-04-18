// ES6-shim 0.5.3 (c) 2012 Paul Miller (paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

// Modifications (c) WebItUp 2013 MIT

(function() {
  'use strict';
  // XXX check https://github.com/rwldrn/es6-array-extras/blob/master/lib/es6-array-extras.js
  if (!Array.from)
    Array.from = function(iterable) {
      var object = new Object(iterable);
      var array = [];

      for (var key = 0, length = object.length >>> 0; key < length; key++) {
        if (key in object) {
          array[key] = object[key];
        }
      }

      return array;
    };

  if (!Array.of)
    Array.of = function() {
      return Array.prototype.slice.call(arguments);
    };
})();
