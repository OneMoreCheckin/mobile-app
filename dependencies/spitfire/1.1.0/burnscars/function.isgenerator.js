if (!Function.prototype.isGenerator)
  (function() {
    'use strict';
    Function.prototype.isGenerator = function(/*o*/) {
      // Yeah, not actually a shim, righty?
      return false;
    };
  })();
