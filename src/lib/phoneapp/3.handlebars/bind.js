(function() {
  'use strict';

  Handlebars.registerHelper('bindAttr', function(options) {
    var params = [];

    Object.keys(options.hash).forEach(function(name) {
      params.push({attribute: name, value: options.hash[name]});
    });
    return new Handlebars.SafeString(this.view._addAttributeBindings(params));

  });

  Handlebars.registerHelper('bind', function(path) {
    var infos = path.split('.');
    var property = infos.pop();
    var parent = PhoneApp.get(infos.join('.'));

    var m = this.view._addMetamorph(parent, property);
    return new Handlebars.SafeString(m.renderWrapper());
  });
})();
