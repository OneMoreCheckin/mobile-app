(function() {
  'use strict';

  Handlebars.registerHelper('collection', function(path, options) {
    if (arguments.length == 1) {
      options = path;
      path = Pa.CollectionView;
    }



    var overload = {};
    var currentView = null;


    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    if (options.fn)
      overload._childTemplate = options.fn;

    Object.keys(options.hash).forEach(function(k) {
      overload[k] = options.hash[k];
    });

    if (!overload.controller)
      overload.controller = this.controller;

    var newView = path.create(overload);


    currentView.appendChild(newView);

    return new Handlebars.SafeString(newView.renderWrapper().outerHTML);
  });

})();
