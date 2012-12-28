(function() {

  Handlebars.registerHelper('action', function(path, context, options) {
    if (!options && context.hash) {
      options = context;
      context = this;
    }
    return new Handlebars.SafeString(
        this.view._addAction(options.hash.on, this.get(path), context)
    );
  });

})();
