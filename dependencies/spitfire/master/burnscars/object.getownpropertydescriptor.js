// ES5 15.2.3.3
// http://es5.github.com/#x15.2.3.3
if (!Object.getOwnPropertyDescriptor)
  (function() {
    /*jshint proto:true, camelcase:false */
    'use strict';
    var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';
    // If JS engine supports accessors creating shortcuts.
    var supportsAccessors = Object.prototype.hasOwnProperty('__lookupGetter__') &&
        Object.prototype.hasOwnProperty('__lookupSetter__');

    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
      if ((typeof object != 'object' && typeof object != 'function') || object === null) {
        throw new TypeError(ERR_NON_OBJECT + object);
      }
      // If object does not owns property return undefined immediately.
      if (!object.hasOwnProperty(property)) {
        return;
      }

      // If object has a property then it's for sure both `enumerable` and
      // `configurable`.
      var descriptor = { enumerable: true, configurable: true };

      // If JS engine supports accessor properties then property may be a
      // getter or setter.
      if (supportsAccessors) {
        // Unfortunately `__lookupGetter__` will return a getter even
        // if object has own non getter property along with a same named
        // inherited getter. To avoid misbehavior we temporary remove
        // `__proto__` so that `__lookupGetter__` will return getter only
        // if it's owned by an object.
        var prototype = object.__proto__;
        object.__proto__ = Object.prototype;

        var getter = object.__lookupGetter__(property);
        var setter = object.__lookupSetter__(property);

        // Once we have getter and setter we can put values back.
        object.__proto__ = prototype;

        if (getter || setter) {
          if (getter) {
            descriptor.get = getter;
          }
          if (setter) {
            descriptor.set = setter;
          }
          // If it was accessor property we're done and return here
          // in order to avoid adding `value` to the descriptor.
          return descriptor;
        }
      }

      // If we got this far we know that object has an own property that is
      // not an accessor so we set it as a value and return descriptor.
      descriptor.value = object[property];
      return descriptor;
    };
  })();
