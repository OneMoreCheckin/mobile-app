(function() {
  'use strict';
  Handlebars.registerHelper('action', function(path, context, options) {
    if (!options && context.hash) {
      options = context;
      context = this;
    }

    if (typeof(path) == 'string') {
      var infos = path.split('.');
      var first = infos[0] || '';

      if (first === 'view') {
        infos.shift();
        path = this.view.get(infos.join('.'));
      } else if (first == 'controller') {
        infos.shift();
        path = this.controller.get(infos.join('.'));
      } else {
        path = Pa.get(path);
      }
    }
    return new Handlebars.SafeString(
        this.view._addAction(options.hash.on, path, context)
    );
  });

})();
