(function() {
  /*jshint camelcase:false*/
  /*global Handlebars:true*/
  'use strict';

  Handlebars.registerHelper('view', function(path, options) {
    if (!path)
      throw new Error('Unknown view');


    var overload = {};
    var currentView = null;


    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    if (options.fn)
      overload.template = options.fn;

    Object.keys(options.hash).forEach(function(k) {
      overload[k] = options.hash[k];
    });
    console.log('**** view overload', overload);

    if (!overload.controller)
      overload.controller = this.controller;
    var newView = path.create(overload);

    currentView.appendChild(newView);

    return new Handlebars.SafeString(newView.renderWrapper().outerHTML);
  });

})();
