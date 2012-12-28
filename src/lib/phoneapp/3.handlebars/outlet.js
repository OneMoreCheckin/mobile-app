(function() {
  'use strict';

  Handlebars.registerHelper('outlet', function(path, options) {
    var outletName = 'default';

    if (typeof(path) == 'string')
      outletName = path;

    if (path.fn || (options && options.fn))
      throw new Error('Outlet can not be a block');

    var currentView = null;

    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');


    var outletView = PhoneApp.View.create({
      controller: this.controller,
      classNames: 'outlet'
    });
    currentView.appendChild(outletView);

    return new Handlebars.SafeString(outletView.renderWrapper().outerHTML);

  });
})();
