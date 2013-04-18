// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create)
  (function() {
    /*jshint proto:true, camelcase:false */
    'use strict';
    Object.create = function create(prototype, properties) {
      var object;
      if (prototype === null) {
        object = { '__proto__': null };
      } else {
        if (typeof prototype != 'object') {
          throw new TypeError('typeof prototype[' + (typeof prototype) + '] != \'object\'');
        }
        var Type = function() {};
        Type.prototype = prototype;
        object = new Type();
        // IE has no built-in implementation of `Object.getPrototypeOf`
        // neither `__proto__`, but this manually setting `__proto__` will
        // guarantee that `Object.getPrototypeOf` will work as expected with
        // objects created using `Object.create`
        object.__proto__ = prototype;
      }
      if (properties !== void 0) {
        Object.defineProperties(object, properties);
      }
      return object;
    };

  })();
