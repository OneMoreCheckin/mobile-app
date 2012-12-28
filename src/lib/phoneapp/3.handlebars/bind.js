(function() {
  'use strict';

  Handlebars.registerHelper('bindAttr', function(options) {
    var params = [];

    Object.keys(options.hash).forEach(function(name) {
      params.push({attribute: name, value: options.hash[name]});
    });
    return new Handlebars.SafeString(this.view._addAttributeBindings(params));

  });
})();
