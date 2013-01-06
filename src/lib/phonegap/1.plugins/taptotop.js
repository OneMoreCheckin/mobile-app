(function () {
  'use strict';

  if (typeof cordova !== "undefined") {
    document.addEventListener('deviceready', function () {
      cordova.exec(null, null, 'TapToTop', 'install', []);
    });
    
  }
})();
