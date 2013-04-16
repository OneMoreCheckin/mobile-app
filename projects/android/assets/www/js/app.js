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

PhoneApp.use('PhoneApp.service.SimpleClient');
PhoneApp.use('PhoneApp.service.Error');

PhoneApp.pack('Omci.service', function(api) {
  'use strict';
  /*global plugins:false*/

  var read = function(){
    /*jshint devel:true*/
    try{
      return JSON.parse(localStorage.getItem('omci')) || {};
    }catch(e){
      console.error('Failed reading from localStorage');
      return {};
    }
  };

  var write = function(data){
    /*jshint devel:true*/
    try{
      localStorage.setItem('omci', JSON.stringify(data));
    }catch(e){
      console.error('Failed writing to localStorage', e);
    }
  };

  var readParams = function(loc){
    var s = {}, q, p = (loc || location).search.substr(1).split('&');
    p.forEach(function(item){
      q = item.split('=');
      s[q.shift()] = decodeURIComponent(q.join('='));
    });
    return s;
  };

  var version;
  var seed = read();
  var remote;
  var omci = new api.SimpleClient();
  var foursquare = new api.SimpleClient();

  var successCbk;
  var failureCbk;

  var onFailure = function(){
    console.error('ON FAILURE CHECK AUTH');
    seed.code = null;
    seed.token = null;
    seed.oauth = null;
    seed.userId = null;
    write(seed);
    failureCbk();
  };

  var authenticate = function(onSuccess) {
    omci.query(
        omci.GET, {
          onsuccess: function(data) {
            seed.token = data.token;
            seed.oauth = data.oauth;
            seed.userId = data.uid;
            write(seed);
            onSuccess();
          },
          onfailure: onFailure,
          service: 'register',
          params: {
            code: seed.code
          }
        }
    );
  };

  var info = function() {
    omci.query(
        omci.GET, {
          onsuccess: function(data){
            // Handle info data here
            successCbk(data);
          },
          onfailure: onFailure,
          id: seed.userId,
          command: 'infos',
          params: {
            token: seed.token
          }
        }
    );
  };

  var fallbackSpy = function(e){
    seed.code = e.data.code;
    windowRef.close();
    authenticate(info);
  };

  var cordovaSpy = function(loc){
    loc = loc.url;
    var p = readParams({search: '?' + loc.split('?').pop()});
    if(p.code){
      seed.code = p.code;
      write(seed);
      windowRef.removeEventListener('loadstart', cordovaSpy);
      windowRef.removeEventListener('exit', Omci.rootView.onBrowserClosed);
      windowRef.close();
      authenticate(info);
    }
  };

  var windowRef;

  addEventListener('message', fallbackSpy, false);


  this.core = new (function() {

    Object.defineProperty(this, 'status', {
      configurable: true,
      get: function(){
        return status;
      }
    });

    this.foursquare = foursquare;

    this.initialize = function(oc) {
      this.foursquare.configure({
        host: 'api.foursquare.com',
        version: 'v2',
        scheme: 'https'
      });

      oc.scheme = 'http';
      omci.configure(oc);

      version = oc.fsVersion;
      remote = 'https://foursquare.com/oauth2/authenticate?client_id=' + oc.clientId +
            '&response_type=code&redirect_uri=' + oc.callback;

      // If we are on remote endpoint exit, web context
      var p = readParams();
      if(p.code)
        opener.postMessage({code: p.code}, '*');
    };

    this.checkAuthentication = function (onSuccess, onFailure) {
      successCbk = onSuccess;
      failureCbk = onFailure;
      console.warn('**** check auth token ' + seed.token);
      if(seed.token){
        info();
        return;
      }

      console.warn('**** check auth code ' + seed.code);

      if(seed.code){
        authenticate(info);
        return;
      }

      console.error('**** ON FAILURE CHECK AUTH');
      onFailure();
    },

    this.requestAuthentication = function(onSuccess, onFailure){
      successCbk = onSuccess;
      failureCbk = onFailure;
      try{
        // plugins.childBrowser.onLocationChange = cordovaSpy;
        // plugins.childBrowser.showWebPage(remote);
        windowRef = window.open(remote, '_blank', 'location=yes');
        windowRef.addEventListener('loadstart', cordovaSpy);
        windowRef.addEventListener('exit', Omci.rootView.onBrowserClosed);
      }catch(e){
        windowRef = window.open(remote);
        console.error('Not using cordova! Falling back to window hack instead');
      }
    };

    this.logout = function () {
      try {
        localStorage.setItem('omci', '{}');
      } catch (e) {
        console.error('logout localStorage error');
      }
    };

    this.queryFoursquare = function(method, options) {
      /*jshint camelcase:false*/
      if (!options.params)
        options.params = {};
      options.params.v = version;
      options.params.oauth_token = seed.oauth;
      foursquare.query(method, options);
    };

    // this.queryOmci = function(method, options) {
    //   if (!options.params)
    //     options.params = {};
    //   options.params.token = seed.token;
    //   omci.query(method, options);
    // };

  })();

});


// window.setTimeout(Omci.service.core.requestAuthentication, 5000);


PhoneApp.use('Omci.service.core');
PhoneApp.pack('Omci.service.venues', function(api) {
  'use strict';

  var SERVICE = 'venues';
  var SEARCH = 'search';

  this.read = function(onSuccess, onFailure, venueId) {
    api.core.queryFoursquare(
        api.core.foursquare.GET, {
          onsuccess: onSuccess,
          onfailure: onFailure,
          service: SERVICE,
          command: venueId
        });
  };

  this.search = function(onSuccess, onFailure, latitude, longitude, cat, limit) {
    var p = {
      ll: latitude + ',' + longitude,
      limit: limit || 30
    };
    if(cat)
      p.categoryId = cat;
    api.core.queryFoursquare(
        api.core.foursquare.GET, {
          onsuccess: onSuccess,
          onfailure: onFailure,
          service: SERVICE,
          command: SEARCH,
          params: p
        });
  };
});


// PhoneApp.use('Omci.service.core');
// PhoneApp.pack('Omci.service.users', function(api) {
//   'use strict';

//   var SERVICE = 'users';

//   this.badges = function(onSuccess, onFailure) {
//     api.core.queryFoursquare(
//         api.core.foursquare.GET, {
//           onsuccess: onSuccess,
//           onfailure: onFailure,
//           service: SERVICE,
//           id: 'self',
//           command: 'badges'
//         });
//   };
// });



PhoneApp.pack('Omci.controllers', function() {
  'use strict';

  this.Application = Pa.Controller.extend({
  });
});

PhoneApp.pack('Omci.controllers', function() {
  'use strict';

  this.Badges = Pa.types.ArrayController.extend();
});

Omci.service.core.initialize({
  host: 'api.onemorecheckin.com',
  port: '',
  // host: 'ackitup.net',
  // port: '5051',
  version: '1.0',
  clientId: 'KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH', //'V4E5YSHBAG34FPQZA2X2ABUCHQP4M1AFIYWA5ZUTQWGSIPZE', // KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH
  fsVersion: '20121230',
  callback: 'http://void.onemorecheckin.com'
  // callback: location.protocol + '://' + location.host + '/' + location.pathname;
});


PhoneApp.use('PhoneApp.types.Object');
PhoneApp.use('PhoneApp.types.ArrayController');
PhoneApp.use('Omci.service.core');
PhoneApp.use('Omci.service.venues');


PhoneApp.pack('Omci.model', function(api) {
  'use strict';

  var Stats = api.Object.extend({
    badges: 0,
    bestScore: 0,
    checkins: 0,
    currentScore: 0,
    friends: 0,
    mayorships: 0,
    tips: 0,
    todos: 0,
    fromObject: function(mesh) {
      Object.keys(mesh).forEach(function(key) {
        if (key in this)
          this.set(key, mesh[key]);
      }, this);
    }
  });

  var Badge = api.Object.extend({
    achievement: 0,
    categories: [],
    infos: {},
    complete: 0,
    details: '',
    hard: 0,
    icon: '',
    img: '',
    more: 0,
    name: '',
    type: '',
    init: function() {
      this.categories = [];
      api.Object._super('init', this);
    },
    fromObject: function(mesh) {
      if (mesh.details) {
        mesh.details = mesh.details.replace(/<a\b[^>]*>(.*?)<\/a>/i, '$1');
      }
      Object.keys(mesh).forEach(function(key) {
        if (key in this)
          this.set(key, mesh[key]);
      }, this);
      this.categories.clear();
      mesh.cat.forEach(function(item) {
        this.categories.pushObject(item);
      }, this);
    },

    image: (function () {
      var res = (Omci.device.isRetina ? 300 : 57);
      return 'http://playfoursquare.s3.amazonaws.com/badge/' + res + this.img;
    }.property())
  });

  var userDescriptor = {
    avatar: '',
    firstName: '',
    gender: '',
    lastName: '',
    dataReady: false,

    /*
4sqcities
expertise
foursquare
partner
 */
    init: function() {
      this._badges = [];

      this.badges = Pa.types.Object.create();
      this.badges.SORT_NEAREST = function (a, b) { return (a.complete > b.complete) ? -1 : (a.complete == b.complete ? 0 : 1)};
      this.badges.SORT_EASIEST = function (a, b) { return (a.more < b.more) ? -1 : (a.more == b.more ? 0 : 1)};
      this.badges.SORT_LEVEL = function (a, b) { return (a.achievement > b.achievement) ? -1 : (a.achievement == b.achievement ? 0 : 1)};
      ['cities', 'expertise', 'foursquare', 'partner'].forEach(function(cat) {
        this.badges[cat] = api.ArrayController.create();
        this.badges[cat].content = this._badges;
        this.badges[cat].refresh = this.refresh.bind(this);
        this.badges[cat].filter = function(item) {
          return item.type == (cat == 'cities' ? '4sqcities' : cat);
        };
        this.badges[cat].sort = this.badges.SORT_NEAREST;
      }, this);

      this.stats = Stats.create();

      this.lastCheckin = Checkin.create();
      api.Object._super('init', this);
    },

    formatedName: (function() {
      return this.firstName + ' ' + this.lastName;
    }).property('lastName', 'firstName'),

    refresh: function (cbk) {
      console.warn('refresh');
      if (cbk)
        window.setTimeout(cbk, 2000);
    },

    fromObject: function(mesh) {
      this.set('dataReady', false);
      Object.keys(mesh.user).forEach(function(key) {
        if (key in this)
          this.set(key, mesh.user[key]);
      }, this);
      this.stats.fromObject(mesh.stats);
      this._badges.clear();
      mesh.badges.forEach(function(item) {
        var b = Badge.create();
        b.fromObject(item);
        this._badges.pushObject(b);
      }, this);
      this.lastCheckin.fromObject(mesh.lastCheckin);
      this.set('dataReady', true);
    },

    bootstrap: function(onSuccess, onFailure) {
      api.core.checkAuthentication((function(data) {
        this.fromObject(data);
        onSuccess(this);
      }.bind(this)), onFailure);
    },
    authenticate: function(onSuccess, onFailure) {
      api.core.requestAuthentication((function(data) {
        this.fromObject(data);
        onSuccess(this);
      }.bind(this)), onFailure);
    },

    logout: function () {
      api.core.logout();
    }
  };

  var User = api.Object.extend(userDescriptor);

  var Venue = api.Object.extend({
    // beenHere: {
    //   count: 0// ,
    //   // marked: false
    // },
    canonicalUrl: '',
    categories: [],
    // contact: {},
    createdAt: 0,
    // dislike: false,
    // friendVisits: {
    //   count: 5,
    //   items: Array[6],
    //   summary: "Toi et 5 amis avez visité ce lieu"
    // },
    hereNow: {
      count: 0
    },
    id: '',
    // like: true,
    // likes: Object
    // listed: Object

    location: {
      cc: '',
      city: '',
      country: '',
      isFuzzed: false,
      lat: 0,
      lng: 0,
      state: ''
    },
    // mayor: Object
    name: '',

    fetch: function(success, failure) {
      api.venues.read((function(data) {
        this.fromObject(data.response.venue);
        if (success)
          success(this);
      }.bind(this)), function() {
        // console.error('Something is very wrong with 4sq');
        if (failure)
          failure();
      }, this.id);
    },

    fromObject: function(mesh) {
      Object.keys(mesh).forEach(function(key) {
        if (key in this)
          this.set(key, mesh[key]);
      }, this);
      this.set('createdAt', new Date(parseInt(this.createdAt, 10) * 1000));
    },

    description: (function() {
      return '<ul><li>Here now: ' + this.hereNow.count + '</li>' +
          '<li>Total checkins: ' + this.stats.checkinsCount + '</li></ul>';
    }.property('stats', 'hereNow')),

    info: (function() {
      return '<div id="info-window"><h3>' + this.name + '</h3>' + this.description + '</div>';
    }.property('description', 'name')),


    icon: (function() {
      // Return whatever appropriate depending on categories
    }.property('categories')),

    // Probably override with proper dimensions here
    // size: [10, 10],
    // origin: [0, 0],
    // offset: [5, 2]


    // pageUpdates: Object
    // photos: Object
    // reasons: Object
    // shortUrl: "http://4sq.com/mPmdjT",
    // specials: Object
    stats: {
      //   checkinsCount: 434
      //   tipCount: 1
      //   usersCount: 14
    }
    // tags: Array[0]
    // timeZone: "Europe/Paris",
    // tips: Object
    // verified: false
  });





  var Checkin = api.Object.extend({
    // checkins: 0,
    // contact: {},
    // createdAt: 0,
    // hereNow: 0,
    // icon: '',
    // id: '',
    // isMayor: false,

    /*    location: Object
      cc: "FR"
      city: "Paris"
      country: "France"
      isFuzzed: true
      lat: 48.87026909751365
      lng: 2.3962543168971036
      state: "Île-de-France"
    */
    // name: '',
    // url: null,
    // users: 0,
    venue: 0,
    aVenue: null,

    init: function() {
      api.Object._super('init', this);
      this.set('aVenue', Venue.create());
    },

    fromObject: function(mesh) {
      Object.keys(mesh).forEach(function(key) {
        if (key in this)
          this.set(key, mesh[key]);
      }, this);
      this.aVenue.fromObject({id: this.venue});
      this.aVenue.fetch();

      // this.set('createdAt', new Date(parseInt(this.createdAt, 10) * 1000));
    }
  });




  this.user = User.create();

  var venues = [this.user.lastCheckin.aVenue];
  this.venues = api.ArrayController.create();
  this.venues.content = venues;

  this.venues.search = function(latitude, longitude, cat, limit) {
    venues.clear();
    api.venues.search((function(data) {
      data.response.venues.forEach(function(vm) {
        var v = Venue.create();
        v.fromObject(vm);
        venues.pushObject(v);
      });
    }.bind(this)), function() {
      // console.error('Terrible terrible bad bad things happened.');
    }, latitude, longitude, cat, limit);
  };


});

// window.setTimeout(function(){
//   'use strict';
//   /*jshint devel:true*/

//   // Grab a ref to the venue of the lastCheckin
//   var venus = Omci.model.user.lastCheckin.aVenue;

//   // Observe its location so that we boot the map once it's fetched
//   venus.addObserver('location', function(){
//     // Build-up map
//     Omci.controller.Map.create({
//       // Node to bind
//       node: $('.app')[0],
//       // Lat / long
//       latitude: venus.location.lat,
//       longitude: venus.location.lng,
//       // Bind the venues list object (bound to the search)
//       venues: Omci.model.venues.content,
//       onsuccess: function(){
//         console.warn('OK BOY! The map is in');
//         // Now, search something in venues, to update markers magically
//         Omci.model.venues.search(
//           venus.location.lat,
//           venus.location.lng,
//           '4bf58dd8d48988d116941735'
//         );
//       },
//       onfailure: function(){
//         console.error('Something bad happened with teh map');
//       }
//     });
//   });

//   Omci.model.user.bootstrap(function(){
//     console.warn('Am in!');
//   }, function(){
//     console.error('Errrr. Can\'t login baby. This is dull!');
//   });

// }, 5000);

PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';
  var huhu = false;

  this.Application = Pa.View.extend({
    classNames: ['omci', 'application'],
    templateName: 'application',
    userLogged: false,

    didInsertElement: function() {
      console.warn('root view inserted');
      Omci.router = Omci.router.create();

      Omci.model.user.bootstrap(function() {
        //Authenticated : OK
        console.log('boot ok');
        $('#splash').removeClass('network-error');
        Omci.rootView.set('userLogged', true);
        
      }, function() {
        console.log('boot fail');
        Pa.renderLoop.schedule(function () {
          Omci.hideSplash();
          $('#splash').addClass('play');
        });
      });
      

      this.menu = new Swipe(document.getElementById('container'));
      // this.menu.activate(true);

      // window.plugins.childBrowser.onClose = function () {
      //     if (Omci.network.state == Omci.network.states.OFFLINE) {
      //       $('#splash').removeClass('loading').addClass('network-error');
      //     }
      // }

      $('#container').on('touchend', function (e) {
        if (this.menu.activated)
          return true;

        if ($(e.target).hasClass('toggle-menu'))
          return;

        this.menu.activate(true);

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }.bind(this));
    },

    onBrowserClosed: function () {
      if (Omci.network.state == Omci.network.states.OFFLINE) {
        $('#splash').removeClass('loading').addClass('network-error');
      } else {
        $('#splash').removeClass('loading').removeClass('network-error');
      }
    },


    badgesReady: function () {
      if (!Omci.model.user.dataReady)
        return;

      console.warn('DATA READY');
      window.setTimeout(function () {
       Pa.renderLoop.schedule(function () {
          $('#splash').removeClass('loading');
          Omci.rootView.$('#splash').addClass('quick-hide');
          $('#splash').removeClass('play');
        });
      }, 100);
      window.setTimeout(function () {
       Pa.renderLoop.schedule(function () {
          Omci.hideSplash();
       });
      }, 100);

    }.observes('Omci.model.user.dataReady'),

    networkStatusUpdated: function () {
      if (!this.userLogged && Omci.network.state == Omci.network.states.OFFLINE)
        $('#splash').addClass('network-error').removeClass('loading');

      if (!Omci.network.state == Omci.network.states.ONLINE)
        $('#splash').removeClass('network-error');
    }.observes('Omci.network.state'),

    willDestroyElement: function() {
      console.warn('wild delete root view');
    },

    toggleMenu: function(e) {
      this.menu.activate(!this.menu.activated);
    },

    goTo: function (e) {
      this.menu.activate(true);
      Omci.router.transitionTo('badges.' + e.context);

      Pa.renderLoop.schedule(function () {
        $('#menu li').removeClass('is-active');
        $(e.target).addClass('is-active');
      });
    },

    logout: function (e) {
      // location.href="fb://page/240965326008435";
      // return;
      // 
      var callback = function (key) {
        if (key != 2)
          return;
        Omci.model.user.logout();
        this.$('#splash').removeClass('hide').removeClass('quick-hide').addClass('play');

      }.bind(this);

      if (Omci.device.isMobile)
        navigator.notification.confirm('Are you sure you want to logout?', callback , 'Logout', 'No,Yes');
      else
        callback(2);
    },
    login: function (e) {
      $('#splash').addClass('loading');
      Omci.model.user.authenticate(function () {
        console.warn('authenticate');
        $('#splash').removeClass('network-error');
        Omci.rootView.set('userLogged', true);
      }, function () {
        $('#splash').removeClass('loading');
        Omci.rootView.set('userLogged', false);
        console.error('authentication fail');
      });
    }
  });
});

PhoneApp.pack('Omci.views.badges', function() {
  /*jshint devel:true*/
  'use strict';

  var Badges = Pa.ScrollableView.extend({
    sort: function(e) {
      var node = e.target;
      var $node = $(node);
      
      if ($node.hasClass('active'))
        return;

      var sort = node.getAttribute('data-sort');
      $node.siblings().removeClass('active');
      $node.addClass('active');
      switch (e.context) {
        case "level":
          this.content.sort = Omci.model.user.badges.SORT_LEVEL;
        break;
        case "easiest":
          this.content.sort = Omci.model.user.badges.SORT_EASIEST;
        break;
        default:
          this.content.sort = Omci.model.user.badges.SORT_NEAREST;
      }
    },

    isLoadingUpdated: function () {
      if (!this.isLoading)
        return;
      
      Omci.model.user.bootstrap(function() {
        this.set('isLoading', false);
      }.bind(this), function () {
        this.set('isLoading', false);
      }.bind(this));
    }.observes('isLoading')
  });

  this.Foursquare = Badges.extend({
    templateName: 'badges/foursquare',
    classNames: 'foursquare badges-container',
    contentBinding: 'Omci.model.user.badges.foursquare'
  });
  this.Expertise = Badges.extend({
    templateName: 'badges/expertise',
    classNames: 'expertise badges-container',
    contentBinding: 'Omci.model.user.badges.expertise'
  });
  this.Cities = Badges.extend({
    templateName: 'badges/cities',
    classNames: 'cities badges-container',
    contentBinding: 'Omci.model.user.badges.cities'
  });
  this.Partner = Badges.extend({
    templateName: 'badges/partner',
    classNames: 'partner badges-container',
    contentBinding: 'Omci.model.user.badges.partner'
  });


});
