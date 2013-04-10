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
    var p = readParams({search: '?' + loc.split('?').pop()});
    if(p.code){
      seed.code = p.code;
      write(seed);
      plugins.childBrowser.close();
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
        plugins.childBrowser.onLocationChange = cordovaSpy;
        plugins.childBrowser.showWebPage(remote);
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


