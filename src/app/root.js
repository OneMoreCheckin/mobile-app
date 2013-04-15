(function() {
  /*global moment*/
  'use strict';

  this.registerHelper('moment', function(time, options) {
    var chain;
    if (options.hash.duration) {
      chain = moment.duration(time, options.hash.duration);
      delete options.hash.duration;
    } else
      chain = moment(time);


    Object.keys(options.hash).forEach(function(option) {
      chain = chain[option](options.hash[option]);
    });

    return chain;
  });

  this.registerHelper('ifequal', function(val1, val2, options) {
    if (val1 === val2) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
}).apply(Handlebars);


(function() {
  /*jshint devel:true*/
  'use strict';
  PhoneApp.ENV.HANDLEBARS_EXPOSE_OBJECTS = ['Pa', 'Omci', 'PhoneApp'];

  window.Omci = Pa.Application.create({
    rootElement: function() {
      return $('.app').get(0);
    }.property(),
    ready: function() {
      console.log('application ready');
    },
    onPause: function() {
      console.warn('going background');
    },
    onResume: function() {
      console.log('going forground');
    },
    rootController: (function() {
      return Omci.controllers.Application.create();
    }.property()),

    rootView: (function() {
      return Omci.views.Application.create();
    }.property()),



    router: Pa.Router.extend({
      applicationController: (function() {
        return Omci.rootController;
      }.property()),

      badgesController: (function () {
        return Omci.controllers.Badges.create();
      }.property()),

      enterHook: function(route, context) {
        // console.log(' ##ROUTER## enter ', route.route, route.slideContainer);
        if (route.view) {
          route.view.element.style.webkitTransition = '0ms';
          route.view.element.style.webkitTransform = 'translate3d(0px,0,0)';
        }

      },

      leaveHook: function(route) {
        // console.error(' ##ROUTER## leave ', route.route, route);
        if (route.view)
          route.view.element.style.webkitTransform = 'translate3d(1000000px, 0, 0)';
      },


      root: Pa.Route.extend({
        route: '/',
        index: Pa.Route.extend({
          redirectsTo: 'badges'
        }),
        badges: Pa.Route.extend({
          route: '/badges',
          index: Pa.Route.extend({
            redirectsTo: 'foursquare'
          }),
          setup: function () {
            console.log('***** global setup');
          },

          foursquare: Pa.Route.extend({
            route: 'foursquare',
            index: Pa.Route.extend({
              redirectsTo: 'list'
            }),

            list: Pa.Route.extend({
              route: 'list',
              view: (function () {
                return Omci.views.badges.Foursquare.create();
              }.property()),

              setup: function () {
                this.view.appendTo(document.getElementById('container'));
              },

              connectOutlets: function(router) {
              }
            })
          }),
          partner: Pa.Route.extend({
            route: 'partner',
            index: Pa.Route.extend({
              redirectsTo: 'list'
            }),

            list: Pa.Route.extend({
              route: 'list',
              view: (function () {
                return Omci.views.badges.Partner.create();
              }.property()),
              
              setup: function () {
                this.view.appendTo(document.getElementById('container'));
              },

              connectOutlets: function(router) {
                
              }
            })
          }),
          expertise: Pa.Route.extend({
            route: 'expertise',
            index: Pa.Route.extend({
              redirectsTo: 'list'
            }),

            list: Pa.Route.extend({
              route: 'list',
              view: (function () {
                return Omci.views.badges.Expertise.create();
              }.property()),
              
              setup: function () {
                this.view.appendTo(document.getElementById('container'));
              },

              connectOutlets: function(router) {

              }
            })
          }),
          cities: Pa.Route.extend({
            route: 'cities',
            index: Pa.Route.extend({
              redirectsTo: 'list'
            }),

            list: Pa.Route.extend({
              route: 'list',
              view: (function () {
                return Omci.views.badges.Cities.create();
              }.property()),
              
              setup: function () {
                this.view.appendTo(document.getElementById('container'));
              },

              connectOutlets: function(router) {

              }
            })
          })
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
