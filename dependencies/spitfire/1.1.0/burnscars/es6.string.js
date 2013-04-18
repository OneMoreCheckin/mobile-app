// ES6-shim 0.5.3 (c) 2012 Paul Miller (paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

// Modifications (c) WebItUp 2013 MIT

(function() {
  'use strict';

  // String.fromCodePoint
  // String.prototype.codePointAt
  // String.prototype.toArray

  // Fast repeat, uses the `Exponentiation by squaring` algorithm.
  if (!String.prototype.repeat)
    String.prototype.repeat = function(times) {
      if (times < 1) return '';
      if (times % 2) return this.repeat(times - 1) + this;
      var half = this.repeat(times / 2);
      return half + half;
    };

  if (!String.prototype.startsWith)
    String.prototype.startsWith = function(searchString) {
      var position = arguments[1];

      // Let searchStr be ToString(searchString).
      // var searchStr = searchString.toString();

      // ReturnIfAbrupt(searchStr).

      // Let S be the result of calling ToString,
      // giving it the this value as its argument.
      var s = this.toString();

      // ReturnIfAbrupt(S).

      // Let pos be ToInteger(position).
      // (If position is undefined, this step produces the value 0).
      var pos = (position === undefined) ? 0 : Number.toInteger(position);
      // ReturnIfAbrupt(pos).

      // Let len be the number of elements in S.
      var len = s.length;

      // Let start be min(max(pos, 0), len).
      var start = Math.min(Math.max(pos, 0), len);

      // Let searchLength be the number of elements in searchString.
      var searchLength = searchString.length;

      // If searchLength+start is greater than len, return false.
      if ((searchLength + start) > len) return false;

      // If the searchLength sequence of elements of S starting at
      // start is the same as the full element sequence of searchString,
      // return true.
      var index = ''.indexOf.call(s, searchString, start);
      return index === start;
    };

  if (!String.prototype.endsWith)
    String.prototype.endsWith = function(searchString) {
      var endPosition = arguments[1];

      // ReturnIfAbrupt(CheckObjectCoercible(this value)).
      // Let S be the result of calling ToString, giving it the this value as its argument.
      // ReturnIfAbrupt(S).
      var s = this.toString();

      // Let searchStr be ToString(searchString).
      // ReturnIfAbrupt(searchStr).
      // var searchStr = searchString.toString();

      // Let len be the number of elements in S.
      var len = s.length;

      // If endPosition is undefined, let pos be len, else let pos be ToInteger(endPosition).
      // ReturnIfAbrupt(pos).
      var pos = (endPosition === undefined) ?
          len :
          Number.toInteger(endPosition);

      // Let end be min(max(pos, 0), len).
      var end = Math.min(Math.max(pos, 0), len);

      // Let searchLength be the number of elements in searchString.
      var searchLength = searchString.length;

      // Let start be end - searchLength.
      var start = end - searchLength;

      // If start is less than 0, return false.
      if (start < 0) return false;

      // If the searchLength sequence of elements of S starting at start is the same as the full
      // element sequence of searchString, return true.
      // Otherwise, return false.
      var index = ''.indexOf.call(s, searchString, start);
      return index === start;
    };

  if (!String.prototype.contains)
    String.prototype.contains = function(searchString) {
      var position = arguments[1];

      // Somehow this trick makes method 100% compat with the spec.
      return ''.indexOf.call(this, searchString, position) !== -1;
    };

})();
