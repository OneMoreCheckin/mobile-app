PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint devel:true*/
  'use strict';



  this.Controller = api.Object.extend({
    isController: true,
    content: null,
    _outlets : null,

    init: function () {
      PhoneApp.Controller._super('init', this);
      this._outlets = {};
    },

    connectOutlet: function(params) {
      return;
      var viewClass = params['viewClass'];
      var controller = params['controller'] || this;
      var context = params['context'] || null;
      var outletName = params['outletName'] || 'main';

      if (!this._outlets[outletName])
        throw new Error('unknown outlet' + outletName);

      if (controller && context)
        controller.set('content', context);

      var outletParams = this._outlets[outletName];

      if (outletParams.node) {
        var id = outletParams.node.getAttribute('id');
        if (Pa.View.views[id])
          Pa.View.views[id].destroy();
      }

      var view = viewClass.create();
      view.set('controller', controller);

      Pa.renderLoop.schedule(function () {
        if (!outletParams.node)
          outletParams.node = outletParams.view.element.querySelector(outletParams.selector);

        var node = outletParams.node;
        view.element = node;
        view.element.setAttribute('id', view.elementId);
        console.log('****** append', view.elementId);
        outletParams.view.appendChild(view);
      });
    },


    addOutlet: function(name, view, selector) {
      this._outlets[name] = {view:view, selector:selector, node: null};
    }
  });

});

