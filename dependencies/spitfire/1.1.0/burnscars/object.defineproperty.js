(function() {
  /*jshint proto:true, camelcase:false */
  'use strict';
  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/kriskowal/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  // If JS engine supports accessors creating shortcuts.
  var supportsAccessors = Object.prototype.hasOwnProperty('__defineGetter__') &&
      Object.prototype.hasOwnProperty('__defineSetter__') &&
      Object.prototype.hasOwnProperty('__lookupGetter__') &&
      Object.prototype.hasOwnProperty('__lookupSetter__');

  var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
    try {
      Object.defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      // returns falsy
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  var definePropertyFallback;
  if (Object.defineProperty) {
    var definePropertyWorksOnDom = typeof document == 'undefined' ||
        doesDefinePropertyWork(document.createElement('div'));
    if (!doesDefinePropertyWork({}) ||
        !definePropertyWorksOnDom) {
      definePropertyFallback = Object.defineProperty;
    }
  }

  if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined ' +
                                      'on this javascript engine';

    Object.defineProperty = function defineProperty(object, property, descriptor) {
      if ((typeof object != 'object' && typeof object != 'function') || object === null) {
        throw new TypeError(ERR_NON_OBJECT_TARGET + object);
      }
      if ((typeof descriptor != 'object' && typeof descriptor != 'function') || descriptor === null) {
        throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
      }
      // make a valiant attempt to use the real defineProperty
      // for I8's DOM elements.
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, object, property, descriptor);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      // If it's a data property.
      if (descriptor.hasOwnProperty('value')) {
        // fail silently if "writable", "enumerable", or "configurable"
        // are requested but not supported
        /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(descriptor.hasOwnProperty("writable") ? descriptor.writable : true) ||
                !(descriptor.hasOwnProperty("enumerable") ? descriptor.enumerable : true) ||
                !(descriptor.hasOwnProperty("configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

        if (supportsAccessors && (object.__lookupGetter__(property) ||
                                      object.__lookupSetter__(property)))
        {
          // As accessors are supported only on engines implementing
          // `__proto__` we can safely override `__proto__` while defining
          // a property to make sure that we don't hit an inherited
          // accessor.
          var prototype = object.__proto__;
          object.__proto__ = Object.prototype;
          // Deleting a property anyway since getter / setter may be
          // defined on object itself.
          delete object[property];
          object[property] = descriptor.value;
          // Setting original `__proto__` back now.
          object.__proto__ = prototype;
        } else {
          object[property] = descriptor.value;
        }
      } else {
        if (!supportsAccessors) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        // If we got that far then getters and setters can be defined !!
        if (descriptor.hasOwnProperty('get')) {
          object.__defineGetter__(property, descriptor.get);
        }
        if (descriptor.hasOwnProperty('set')) {
          object.__defineSetter__(property, descriptor.set);
        }
      }
      return object;
    };
  }

})();
