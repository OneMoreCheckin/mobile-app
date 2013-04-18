// Based on a free third-party service - our choice right now
// http://www.calormen.com/polyfill/geo.js

// Paul Irish gister on google jsapi
// https://gist.github.com/366184

// Mobile oriented solutions
// http://code.google.com/p/geo-location-javascript/

// if (!navigator.geolocation)
//   (function() {
//     navigator.geolocation = {
//       // Total crap just to not crash - might investigate misusing google APIs intead
//       getCurrentPosition: function(cbk) {
//         window.setTimeout(function() {
//           cbk({coords: {latitude: null, longitude: null}});
//         }, 1);
//       }
//     };
//   })();



// W3C Geolocation API (Level 1) "Polyfill" Implementation
// This uses freegeoip.org to estimate location from IP address
// by Joshua Bell - http://calormen.com/polyfill

// PUBLIC DOMAIN
if (!navigator.geolocation)
  (function() {
    'use strict';

    var GEOIP_SERVICE_JSONP = 'http://freegeoip.net/json/google.com?callback=';
    var SERVICE_THROTTLE_QPS = 1000 / (60 * 60); // 1000/hour
    var POLITENESS_FACTOR = 2;
    var POLL_TIMER_MS = (1000 / SERVICE_THROTTLE_QPS) * POLITENESS_FACTOR;

    var DISTANCE_THRESHOLD_M = 20;
    var EARTH_RADIUS_M = 6.384e6;

    // TODO: Implement user prompt and store preference w/ cookies

    function hasOP(o, p) {
      return Object.prototype.hasOwnProperty.call(o, p);
    }

    /** @constructor */
    function PositionError(code, message) {
      this.code = code;
      this.message = message;
    }
    PositionError.PERMISSION_DENIED = 1;
    PositionError.POSITION_UNAVAILABLE = 2;
    PositionError.TIMEOUT = 3;
    PositionError.prototype = new Error();

    /** @constructor */
    function Coordinates(data) {
      this.accuracy = EARTH_RADIUS_M * Math.PI;
      this.altitude = null;
      this.altitudeAccuracy = null;
      this.heading = null;
      this.latitude = Number(data.latitude);
      this.longitude = Number(data.longitude);
      this.speed = null;
    }

    /** @constructor */
    function Geoposition(data) {
      this.timestamp = Number(new Date());
      this.coords = new Coordinates(data);
    }

    Geoposition.distance = function(p1, p2) {
      if (p1 === p2) {
        return 0;
      }
      if (!p1 || !p2) {
        return Infinity;
      }
      // c/o http://jsp.vs19.net/lr/sphere-distance.php
      function angle(b1, l1, b2, l2) {
        function d2r(d) { return d * Math.PI / 180; }
        var p1 = Math.cos(d2r(l1 - l2)),
            p2 = Math.cos(d2r(b1 - b2)),
            p3 = Math.cos(d2r(b1 + b2));
        return Math.acos(((p1 * (p2 + p3)) + (p2 - p3)) / 2);
      }
      return EARTH_RADIUS_M * angle(p1.coords.latitude, p1.coords.longitude,
                                    p2.coords.latitude, p2.coords.longitude);
    };

    /** @constructor */
    function GeolocationPolyfill() {

      var cached = null;

      function dispatch(handler, data) {
        if (typeof handler === 'function') {
          setTimeout(function() { handler(data); }, 0);
        } else if (typeof handler === 'object' && handler && 'handleEvent' in handler) {
          handler = handler.handleEvent;
          setTimeout(function() { handler(data); }, 0);
        }
      }

      function acquireLocation(onSuccess) {
        var script = document.createElement('SCRIPT'),
            cbname = '_geoip_callback_' + Math.floor(Math.random() * (1 << 30));
        function cleanup() {
          if (script.parentNode) { script.parentNode.removeChild(script); }
          try { delete window[cbname]; } catch (ex) { window[cbname] = (void 0); /*IE8-*/ }
        }
        window[cbname] = function(data) {
          cleanup();
          onSuccess(new Geoposition(data));
        };
        script.onerror = function(/*e*/) {
          cleanup();
          // XXX wtf?
          // onError(e);
        };
        script.src = GEOIP_SERVICE_JSONP + encodeURIComponent(cbname);
        (document.head || document.body || document.documentElement).appendChild(script);
        return cleanup;
      }


      this.getCurrentPosition = function(successCallback, errorCallback, options) {
        if (!successCallback) { throw new TypeError('The successCallback parameter is null.'); }

        var maximumAge;
        if (options && hasOP(options, 'maximumAge') && Number(options.maximumAge) >= 0) {
          maximumAge = Number(options.maximumAge);
        } else {
          maximumAge = 0;
        }

        var timeout;
        if (options && hasOP(options, 'timeout')) {
          if (Number(options.timeout) >= 0) {
            timeout = Number(options.timeout);
          } else {
            timeout = 0;
          }
        } else {
          timeout = Infinity;
        }

        var enableHighAccuracy;
        if (options && hasOP(options, 'enableHighAccuracy')) {
          enableHighAccuracy = Boolean(enableHighAccuracy);
        } else {
          enableHighAccuracy = false;
        }

        if (cached && ((Number(new Date()) - cached.timestamp) < maximumAge)) {
          dispatch(successCallback, cached);
          return;
        }

        if (timeout === 0) {
          dispatch(errorCallback, new PositionError(PositionError.TIMEOUT, 'Timed out'));
          return;
        }

        function onSuccess(position) {
          cached = position;
          if (!timedOut) {
            if (timerId) { clearTimeout(timerId); }
            dispatch(successCallback, position);
          }
        }

        function onFailure() {
          if (!timedOut) {
            if (timerId) { clearTimeout(timerId); }
            dispatch(errorCallback, new PositionError(PositionError.POSITION_UNAVAILABLE, 'Position unavailable'));
          }
        }

        var cancelOperation = acquireLocation(onSuccess, onFailure, enableHighAccuracy);

        var timedOut = false, timerId = 0;
        if (isFinite(timeout)) {
          timerId = setTimeout(function() {
            timedOut = true;
            cancelOperation();
            dispatch(errorCallback, new PositionError(PositionError.TIMEOUT, 'Timed out'));
          }, timeout);
        }
      };

      var timers = [], counter = 0;

      this.watchPosition = function(successCallback, errorCallback, options) {
        if (!successCallback) { throw new TypeError('The successCallback parameter is null.'); }

        var maximumAge;
        if (options && hasOP(options, 'maximumAge') && Number(options.maximumAge) >= 0) {
          maximumAge = Number(options.maximumAge);
        } else {
          maximumAge = 0;
        }

        var timeout;
        if (options && hasOP(options, 'timeout')) {
          if (Number(options.timeout) >= 0) {
            timeout = Number(options.timeout);
          } else {
            timeout = 0;
          }
        } else {
          timeout = Infinity;
        }

        var enableHighAccuracy;
        if (options && hasOP(options, 'enableHighAccuracy')) {
          enableHighAccuracy = Boolean(enableHighAccuracy);
        } else {
          enableHighAccuracy = false;
        }

        if (cached && ((Number(new Date()) - cached.timestamp) < maximumAge)) {
          dispatch(successCallback, cached);
        }

        var lastPosition = null, timerId = 0;
        function acquisitionSteps() {
          function onSuccess(position) {
            cached = position;
            if (!timedOut && !timerDetails.cleared) {
              if (timerId) { clearTimeout(timerId); timerId = 0; }

              if (Geoposition.distance(lastPosition, position) >= DISTANCE_THRESHOLD_M) {
                lastPosition = position;
                dispatch(successCallback, position);
              }
            }
          }

          function onFailure() {
            if (!timedOut && !timerDetails.cleared) {
              if (timerId) { clearTimeout(timerId); timerId = 0; }
              dispatch(errorCallback, new PositionError(PositionError.POSITION_UNAVAILABLE, 'Position unavailable'));
            }
          }

          var cancelOperation = acquireLocation(onSuccess, onFailure, enableHighAccuracy);

          var timedOut = false;
          if (isFinite(timeout) && !timerId) {
            timerId = setTimeout(function() {
              timedOut = true;
              timerId = 0;
              cancelOperation();
              if (!timerDetails.cleared) {
                dispatch(errorCallback, new PositionError(PositionError.TIMEOUT, 'Timed out'));
              }
            }, timeout);
          }
        }

        acquisitionSteps();

        function systemEvent() {
          acquisitionSteps();
        }

        var intervalId = setInterval(systemEvent, POLL_TIMER_MS);
        var timerDetails = {
          intervalId: intervalId,
          cleared: false
        };

        var watchId = ++counter;
        timers[watchId] = timerDetails;
        return watchId;
      };

      this.clearWatch = function(watchId) {
        watchId = Number(watchId);
        if (!hasOP(timers, watchId)) {
          return;
        }

        var timerDetails = timers[watchId];
        delete timers[watchId];
        clearInterval(timerDetails.intervalId);
        timerDetails.cleared = true;
      };
    }

    // Exports
    if (!navigator.geolocation) {
      navigator.geolocation = new GeolocationPolyfill();
      window.PositionError = PositionError;
    }
  })();

/*

// What browsers actually do
https://maps.googleapis.com/maps/api/browserlocation/json?browser=firefox&sensor=true&wifi=mac:10-9a
-dd-8e-31-9f%7Cssid:Encapsula%C3%83%C2%A7i%C3%83%C2%B2n%7Css:-58&wifi=mac:2e-f1-f8-cc-32-83%7Cssid:
freephonie%7Css:-60&wifi=mac:2e-f1-f8-cc-32-82%7Cssid:FreeWifi%7Css:-61&wifi=mac:2e-f1-f8-cc-32-80%
7Cssid:freebox_DHXAKI%7Css:-62&wifi=mac:10-9a-dd-8e-3a-dd%7Cssid:Encapsula%C3%83%C2%A7i%C3%83%C2%B2n
%7Css:-64&wifi=mac:f4-ca-e5-f3-cd-2c%7Cssid:Freebox-4B5180%7Css:-66&wifi=mac:f4-ca-e5-f3-cd-2d%7Cssid
:FreeWifi%7Css:-67&wifi=mac:82-73-d9-2f-f8-8a%7Cssid:FreeWifi%7Css:-68&wifi=mac:00-24-d4-e8-b5-24%7C
ssid:Freebox-AE3CFB%7Css:-69&wifi=mac:82-73-d9-2f-f8-8b%7Cssid:freephonie%7Css:-70&wifi=mac:82-73-d9
-2f-f8-88%7Cssid:myWifi%7Css:-70&wifi=mac:00-24-d4-e8-b5-25%7Cssid:FreeWifi%7Css:-70&wifi=mac:56-2e
-2d-fc-8b-68%7Cssid:isam%7Css:-73&wifi=mac:56-2e-2d-fc-8b-6a%7Cssid:FreeWifi%7Css:-73&wifi=mac:00-1
9-70-3d-21-6a%7Cssid:Livebox-4fd8%7Css:-75&wifi=mac:00-1a-2b-4f-7e-a9%7Cssid:NUMERICABLE_SES_33459%
7Css:-76&wifi=mac:00-1f-9f-e5-b5-7d%7Cssid:Bbox-8DC76E%7Css:-78&wifi=mac:56-2e-2d-fc-8b-6b%7Cssid:f
reephonie%7Css:-78&wifi=mac:00-1d-8b-57-d8-c8%7Cssid:ALICE-LAN-9B9AA2%7Css:-79&wifi=mac:00-18-e7-4f
-bd-43%7Cssid:Livebox-5975%7Css:-79&wifi=mac:00-16-cf-a3-e6-1b%7Cssid:Livebox-A038%7Css:-82&wifi=ma
c:1e-7f-bf-0d-c6-46%7Cssid:FreeWifi%7Css:-82&wifi=mac:1e-7f-bf-0d-c6-47%7Cssid:freephonie%7Css:-82&
wifi=mac:00-1d-19-fc-c4-7c%7Cssid:DartyBox_104A%7Css:-83&wifi=mac:00-1d-d9-5d-c2-a1%7Cssid:Livebox-
B7F0%7Css:-84&wifi=mac:aa-25-15-d4-77-cd%7Cssid:SFR%20WiFi%20Public%7Css:-84&wifi=mac:00-1a-2b-83-6
d-57%7Cssid:NUMERICABLE-A74E%7Css:-84&wifi=mac:00-25-15-d4-77-cc%7Cssid:SFR_77C8%7Css:-84&wifi=mac:
00-1f-f3-09-cf-6f%7Cssid:Apple%20Network%20AS-1207%7Css:-84&wifi=mac:06-1d-19-fc-c4-7c%7Cssid:Darty
Box_104A_WEP%7Css:-86&wifi=mac:1e-7f-bf-0d-c6-44%7Cssid:freebox_abecat120%7Css:-86&wifi=mac:36-25-b
3-37-d6-4f%7Cssid:hpsetup%7Css:-86&wifi=mac:00-0e-9b-8c-6b-93%7Cssid:Livebox-8504%7Css:-89


// Misusing the loader?
//   <script src="//www.google.com/jsapi"></script>
//    .script("//www.google.com/jsapi")
        // console.warn(google.loader.ClientLocation.latitude);
        // console.warn(google.loader.ClientLocation.longitude);

// Actually using the maps API?
//    .script("//maps.googleapis.com/maps/api/js?sensor=true")

  var geocoder;
  var map;
  function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  }


  initialize();

  geocoder.geocode( { 'address': "18 rue frédérick lemaitre, 75020 Paris"}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      console.error("Geocode was not successful for the following reason: " + status);
    }
  });
*/

