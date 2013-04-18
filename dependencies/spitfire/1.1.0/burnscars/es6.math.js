// ES6-shim 0.5.3 (c) 2012 Paul Miller (paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

// Modifications (c) WebItUp 2013 MIT

(function() {
  'use strict';
  /*jshint maxcomplexity: 15*/

  var factorial = function(value) {
    var result = 1;
    for (var i = 2; i <= value; i++) {
      result *= i;
    }
    return result;
  };

  if (!Math.acosh)
    Math.acosh = function(value) {
      return Math.log(value + Math.sqrt(value * value - 1));
    };

  if (!Math.asinh)
    Math.asinh = function(value) {
      return Math.log(value + Math.sqrt(value * value + 1));
    };

  if (!Math.atanh)
    Math.atanh = function(value) {
      return 0.5 * Math.log((1 + value) / (1 - value));
    };

  if (!Math.cosh)
    Math.cosh = function(value) {
      if (value < 0) value = -value;
      if (value > 21) return Math.exp(value) / 2;
      return (Math.exp(value) + Math.exp(-value)) / 2;
    };

  if (!Math.sinh)
    Math.sinh = function(value) {
      return (Math.exp(value) - Math.exp(-value)) / 2;
    };

  if (!Math.tanh)
    Math.tanh = function(value) {
      return (Math.exp(value) - Math.exp(-value)) / (Math.exp(value) + Math.exp(-value));
    };

  if (!Math.expm1)
    Math.expm1 = function(value) {
      var result = 0;
      var n = 50;
      for (var i = 1; i < n; i++) {
        result += Math.pow(value, i) / factorial(i);
      }
      return result;
    };

  if (!Math.hypot)
    Math.hypot = function(x, y) {
      return Math.sqrt(x * x + y * y) || 0;
    };

  if (!Math.log2)
    Math.log2 = function(value) {
      return Math.log(value) * (1 / Math.LN2);
    };

  if (!Math.log10)
    Math.log10 = function(value) {
      return Math.log(value) * (1 / Math.LN10);
    };

  if (!Math.log1p)
    Math.log1p = function(value) {
      var result = 0;
      var n = 50;

      if (value <= -1) return -Infinity;
      if (value < 0 || value > 1) return Math.log(1 + value);
      for (var i = 1; i < n; i++) {
        if ((i % 2) === 0) {
          result -= Math.pow(value, i) / i;
        } else {
          result += Math.pow(value, i) / i;
        }
      }

      return result;
    };

  if (!Math.sign)
    Math.sign = function(value) {
      var number = +value;
      if (number === 0) return number;
      if (Object.is(number, NaN)) return number;
      return (number < 0) ? -1 : 1;
    };

  if (!Math.trunc)
    Math.trunc = function(value) {
      return ~~value;
    };

})();
