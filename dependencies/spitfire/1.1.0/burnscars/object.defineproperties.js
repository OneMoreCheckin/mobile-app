// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties)
  (function() {
    'use strict';
    Object.defineProperties = function defineProperties(object, properties) {
      for (var property in properties) {
        if (properties.hasOwnProperty(property) && property != '__proto__') {
          Object.defineProperty(object, property, properties[property]);
        }
      }
      return object;
    };
  })();
