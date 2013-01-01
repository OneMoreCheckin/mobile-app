(function() {
  'use strict';

  Handlebars.registerHelper('outlet', function(path, options) {
    var outletName = 'view';

    if (typeof(path) == 'string')
      outletName = path;

    if (path.fn || (options && options.fn))
      throw new Error('Outlet can not be a block');

    var currentView = null;

    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    this.controller.set('view', null);

    var m = currentView._addMetamorph(this.controller, outletName);
    return new Handlebars.SafeString(m.renderWrapper());

  });
})();
