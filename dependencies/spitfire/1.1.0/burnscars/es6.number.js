// ES6-shim 0.5.3 (c) 2012 Paul Miller (paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

// Modifications (c) WebItUp 2013 MIT

(function() {
  'use strict';

  // Number.MAX_INTEGER = 9007199254740992;
  // Number.EPSILON = 2.220446049250313e-16;

  // Number.parseInt = window.parseInt;
  // Number.parseFloat = globals.parseFloat;

  if (!Number.isFinite)
    Number.isFinite = function(value) {
      return typeof value === 'number' && isFinite(value);
    };

  if (!Number.isInteger)
    Number.isInteger = function(value) {
      return Number.isFinite(value) &&
          value >= -9007199254740992 && value <= 9007199254740992 &&
          Math.floor(value) === value;
    };

  if (!Number.isNaN)
    Number.isNaN = function(value) {
      return Object.is(value, NaN);
    };

  if (!Number.toInteger)
    Number.toInteger = function(value) {
      var number = +value;
      if (Object.is(number, NaN)) return +0;
      if (number === 0 || !Number.isFinite(number)) return number;
      return Math.sign(number) * Math.floor(Math.abs(number));
    };

  // if(!Number.prototype.clz)
  //   Number.prototype.clz: function() {
  //     var number = +this;
  //     if (!number || !Number.isFinite(number)) return 32;
  //     number = number < 0 ? Math.ceil(number) : Math.floor(number);
  //     number = number - Math.floor(number / 0x100000000) * 0x100000000;
  //     return 32 - (number).toString(2).length;
  //   };

})();
