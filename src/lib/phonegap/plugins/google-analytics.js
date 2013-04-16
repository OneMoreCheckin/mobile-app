(function () {
  'use strict';

  cordova.define("cordova/plugin/GoogleAnalytics", function(require, exports, module) {
    var exec = require('cordova/exec');

    var GA = function () {

    };

    GA.prototype.startTrackerWithAccountID = function(id) {
      cordova.exec(function () {},function () {}, "GoogleAnalyticsPlugin", "trackerWithTrackingId", [id]);
    };

    GA.prototype.sendView = function(pageUri) {
      if (!pageUri)
        pageUri = document.location.href;
      cordova.exec(function () {},function () {}, "GoogleAnalyticsPlugin", "trackView", [pageUri]);
    };

    GA.prototype.sendEvent = function(category,action,label,value) {
      var options = [category,
        action,
        label,
        (isNaN(parseInt(value)) ? -1 : value)];
      cordova.exec(function () {},function () {}, "GoogleAnalyticsPlugin", "trackEventWithCategory", options);
    };

    // GA.prototype.setCustomVariable = function(index,name,value) {
    //   var options = [index,
    //     name,
    //     value];
    //   cordova.exec(function () {},function () {}, "GoogleAnalyticsPlugin", "setCustomVariable", options);

    // };


    module.exports = new GA();
  });
})();