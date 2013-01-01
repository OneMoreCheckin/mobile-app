PhoneApp.pack('PhoneApp.types', function() {
  /*jshint camelcase:false, devel:true*/
  'use strict';

  var dashCache = {};

  String.prototype.dasherize = function() {
    if (!this.length)
      return '';
    return dashCache[this] || (dashCache[this] = this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
  };

  // XXX Manu: better below?
  // function dasherize(str) {
  //   return str.replace(/::/g, '/')
  //          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
  //          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
  //          .replace(/_/g, '-')
  //          .toLowerCase()
  // }

  String.prototype.replaceAt = function(index, char) {
    return this.substr(0, index) + char + this.substr(index + char.length);
  };

});
