PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint devel:true*/
  'use strict';



  this.Controller = api.Object.extend({
    isController: true,
    content: null,

    connectOutlet: function(params) {
      var viewClass = params.viewClass;
      var controller = params.controller || this;
      var context = params.context || null;
      var outletName = params.outletName || 'view';

      if (controller && context)
        controller.set('content', context);

      // var oldView = this.get(outletName);
      var view = viewClass.create();
      view.set('controller', controller);
      this.set(outletName, view);
    },

    removeOutlet: function(outletName) {
      this.set(outletName, null);
    }
  });

});

