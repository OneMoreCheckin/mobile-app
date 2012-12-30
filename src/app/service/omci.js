PhoneApp.use('PhoneApp.service.SimpleClient');
PhoneApp.use('PhoneApp.service.Error');

PhoneApp.pack('Omci.service', function(api) {
  'use strict';

  this.core = new (function() {
    var v = '20110918';
    var code = 'IOG3DB5OUR0IPOA43YERU2CILBCGMVV0U1KADZCQKZ5IVUPI';
    var token;
    var oauth;
    var userId;

    var remote;
    var status;

    this.LOGGED_OUT = 'LOGGED_OUT';
    this.LOGGED_IN = 'LOGGED_IN';

    this.initialize = function(omci) {
      this.foursquare = new api.SimpleClient();
      this.foursquare.configure('api.foursquare.com', null, 'v2', 'https:');
      this.omci = new api.SimpleClient();
      this.omci.configure(omci.host, omci.port, omci.version, 'http:');
      remote = 'https://foursquare.com/oauth2/authenticate?client_id=' + omci.clientId +
            '&response_type=code&redirect_uri=' + omci.callback;
      // remote = omci.remoteHook;
      // If we are on remote endpoint entry
      var p = readParams();
      if(p.mode == 'backward'){
        localStorage.setItem('omciParent', p.o);
        location.href = 'https://foursquare.com/oauth2/authenticate?client_id=' + omci.clientId +
            '&response_type=code&redirect_uri=' + omci.callback;
        throw new Error('STOP_AND_REDIRECT');
      }
      // If we are on remote endpoint exit
      if(p.code){
        opener.postMessage({code: p.code}, '*');
        // localStorage.getItem('omciParent'));
      }
    };

    var windowRef;

    addEventListener('message', function(e){
      code = e.data.code;
      windowRef.close();
    }, false);


    this.requestAuthentication = function(){
      try{
        plugins.childBrowser.onLocationChange = function(loc){
          var p = readParams({search: '?' + loc.split('?').pop()});
          if(p.code){
            plugins.childBrowser.close();
            code = p.code;
          }
        };
        plugins.childBrowser.showWebPage(remote);
      }catch(e){
        console.error('Not in cordova! Using window open instead');
        windowRef = window.open(remote + '?mode=backward&o=' + encodeURIComponent(location.origin), 'popomci');
      }
    };






    this.queryFoursquare = function(method, options) {
      /*jshint camelcase:false*/
      if (!options.params)
        options.params = {};
      if (oauth) {
        options.params.v = v;
        options.params.oauth_token = oauth;
      }
      this.foursquare.query(method, options);
    };

    this.queryOmci = function(method, options) {
      if (!options.params)
        options.params = {};
      if (token)
        options.params.token = token;
      this.omci.query(method, options);
    };

    this.authenticate = function(onSuccess, onFailure) {
      this.omci.query(
          this.omci.GET, {
            onsuccess: function(data) {
              console.warn('success', data);
              token = data.token;
              oauth = data.oauth;
              userId = data.uid;
              onSuccess();
            },
            onfailure: onFailure,
            service: 'register',
            params: {code: code}
          });
    };


    this.info = function(onSuccess, onFailure) {
      this.queryOmci(
          this.omci.GET, {
            onsuccess: onSuccess,
            onfailure: onFailure,
            service: userId,
            id: 'infos'
          });
    };

  })();

  var readParams = function(loc){
    var s = {}, q, p = (loc || location).search.substr(1).split("&");
    p.forEach(function(item){
      q = item.split('=');
      s[q.shift()] = decodeURIComponent(q.join('='));
    });
    return s;
  };

});

Omci.service.core.initialize({
  host: 'api.onemorecheckin.com',
  port: '',
  version: '1.0',
  // remoteHook: 'http://app.loft.sn.ackitup.net:4242/omci/',
  remoteHook: 'http://local.onemorecheckin.com/',
  clientId: 'V4E5YSHBAG34FPQZA2X2ABUCHQP4M1AFIYWA5ZUTQWGSIPZE', // KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH
  callback: 'http://local.onemorecheckin.com'
  // callback: location.protocol + '://' + location.host + '/' + location.pathname;

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
    api.core.queryFoursquare(
        api.core.foursquare.GET, {
          onsuccess: onSuccess,
          onfailure: onFailure,
          service: SERVICE,
          command: SEARCH,
          params: {
            categoryId: cat,
            ll: latitude + ',' + longitude,
            limit: limit || 30
          }
        });
  };
});


PhoneApp.use('Omci.service.core');
PhoneApp.pack('Omci.service.users', function(api) {
  'use strict';

  var SERVICE = 'users';

  this.badges = function(onSuccess, onFailure) {
    api.core.queryFoursquare(
        api.core.foursquare.GET, {
          onsuccess: onSuccess,
          onfailure: onFailure,
          service: SERVICE,
          id: 'self',
          command: 'badges'
        });
  };
});


