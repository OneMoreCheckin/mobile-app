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
      applicationController: (function() {
        return Omci.rootController;
      }.property()),

      root: Pa.Route.extend({
        route: '/',
        index: Pa.Route.extend({
          redirectsTo: 'splash'
        }),
        splash: Pa.Route.extend({
          route: '/splash',
          enter: function() {
            console.log('******** router -> splash');
          },

          // connectOutlets: function(router) {
          //   router.applicationController.connectOutlet({
          //     viewClass: Omci.views.Splash
          //   });
          // }
        }),
        application: Pa.Route.extend({
          route: '/app',
          enter: function() {
            console.log('****** router -> app');
          },
          // connectOutlets: function(router) {
          //   router.applicationController.connectOutlet({
          //     viewClass: Omci.views.Youhou
          //   });
          // }
        })

      })

    })
  });

})();
