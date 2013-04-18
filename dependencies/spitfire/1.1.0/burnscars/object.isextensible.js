// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible)
  (function() {
    'use strict';
    Object.isExtensible = function isExtensible(object) {
      // 1. If Type(O) is not Object throw a TypeError exception.
      if (Object(object) !== object) {
        throw new TypeError(); // TODO message
      }
      // 2. Return the Boolean value of the [[Extensible]] internal property of O.
      var name = '';
      while (object.hasOwnProperty(name)) {
        name += '?';
      }
      object[name] = true;
      var returnValue = object.hasOwnProperty(name);
      delete object[name];
      return returnValue;
    };
  })();
