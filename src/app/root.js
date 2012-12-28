(function() {
  /*jshint devel:true*/
  'use strict';
  PhoneApp.ENV.HANDLEBARS_EXPOSE_OBJECTS = ['Omci'];

  window.Omci = Pa.Application.create({
    rootElement: function() {
      return $('.app').get(0);
    }.property(),
    ready: function() {
      console.log('application ready');
    },
    onPause: function() {
      console.log('going background', this.state);
    },
    onResume: function() {
      console.log('going forground', this.state);
    },
    rootController: (function() {
      return Omci.controllers.Application.create();
    }.property()),

    rootView: (function() {
      return Omci.views.Application.create();
    }.property()),

    router: Pa.Router.create({
      root: Pa.Route.extend({
        route: '/'
      })
    })
  });

})();
