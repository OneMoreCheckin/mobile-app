PhoneApp.add(Error).as('NativeError');
PhoneApp.pack('PhoneApp.types', function(api) {
  /*global printStackTrace:false*/
  'use strict';

  // Possibly pb related to X-Domain limitation shit
  this.Error = function(name, message) {
    // Error behavior is strange...
    var b = api.NativeError.apply(this, [message]);
    // Not too sure this leads anywhere safe though (google code fux...)
    if ((this == window) || (this === undefined))
      return;
    this.message = b.message;
    this.stack = b.stack;
    this.name = name;
    if (!this.stack)
      this.stack = (typeof 'printStackTrace' != 'undefined') ? printStackTrace() : [];
  };

  Object.getOwnPropertyNames(api.NativeError.prototype).forEach(function(i) {
    if (i != 'constructor')
      this.Error.prototype[i] = api.NativeError.prototype[i];
  }, this);

  ['NOT_IMPLEMENTED', 'UNSPECIFIED', 'NOT_INITIALIZED', 'WRONG_ARGUMENTS',
   'UNSUPPORTED', 'NATURAL_BORN_CRASH'].forEach(function(item, idx) {
    this.Error[item] = this.Error.prototype[item] = idx;
  }, this);

  this.Error.prototype.toString = function() {
    return this.name + ': ' + this.message + '\nStack: ' +
        ((typeof this.stack == 'array') ? this.stack.join('\n') : this.stack);
  };

});
