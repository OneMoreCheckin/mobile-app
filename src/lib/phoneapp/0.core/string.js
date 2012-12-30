PhoneApp.pack('PhoneApp.types', function() {
  /*jshint camelcase:false, devel:true*/
  'use strict';

  var DASHERIZE_CACHE = {};

  this.String = {
    dasherize: function(str) {
      var cache = DASHERIZE_CACHE,
          ret = cache[str];

      if (ret)
        return ret;

      ret = str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      cache[str] = ret;
      return ret;
    }
  };

  String.prototype.replaceAt = function(index, char) {
    return this.substr(0, index) + char + this.substr(index + char.length);
  };

  PhoneApp.String = this.String;
});
