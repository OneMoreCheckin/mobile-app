// https://github.com/marcuswestin/store.js#readme
// http://amplifyjs.com/api/store/
// https://developer.mozilla.org/en/DOM/Storage

/*jshint nonstandard:true*/
if (!window.localStorage)
  (function() {
    /*jshint regexp:false*/
    'use strict';

    window.localStorage = {
      getItem: function(sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
        return unescape(document.cookie.replace(new RegExp('(?:^|.*;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g,
            '\\$&') + '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'), '$1'));
      },
      key: function(nKeyId) { return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, '').
            split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]); },
      setItem: function(sKey, sValue) {
        if (!sKey) { return; }
        document.cookie = escape(sKey) + '=' + escape(sValue) + '; path=/';
        this.length = document.cookie.match(/\=/g).length;
      },
      length: 0,
      removeItem: function(sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) { return; }
        var sExpDate = new Date();
        sExpDate.setDate(sExpDate.getDate() - 1);
        document.cookie = escape(sKey) + '=; expires=' + sExpDate.toGMTString() + '; path=/';
        this.length--;
      },
      hasOwnProperty: function(sKey) { return (new RegExp('(?:^|;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') +
            '\\s*\\=')).test(document.cookie); }
    };
    window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
  })();

// if (!window.localStorage) {
//   Object.defineProperty(window, "localStorage", new (function () {
//     var aKeys = [], oStorage = {};
//     Object.defineProperty(oStorage, "getItem", {
//       value: function (sKey) { return sKey ? this[sKey] : null; },
//       writable: false,
//       configurable: false,
//       enumerable: false
//     });
//     Object.defineProperty(oStorage, "key", {
//       value: function (nKeyId) { return aKeys[nKeyId]; },
//       writable: false,
//       configurable: false,
//       enumerable: false
//     });
//     Object.defineProperty(oStorage, "setItem", {
//       value: function (sKey, sValue) {
//         if(!sKey) { return; }
//         document.cookie = escape(sKey) + "=" + escape(sValue) + "; path=/";
//       },
//       writable: false,
//       configurable: false,
//       enumerable: false
//     });
//     Object.defineProperty(oStorage, "length", {
//       get: function () { return aKeys.length; },
//       configurable: false,
//       enumerable: false
//     });
//     Object.defineProperty(oStorage, "removeItem", {
//       value: function (sKey) {
//         if(!sKey) { return; }
//         var sExpDate = new Date();
//         sExpDate.setDate(sExpDate.getDate() - 1);
//         document.cookie = escape(sKey) + "=; expires=" + sExpDate.toGMTString() + "; path=/";
//       },
//       writable: false,
//       configurable: false,
//       enumerable: false
//     });
//     this.get = function () {
//       var iThisIndx;
//       for (var sKey in oStorage) {
//         iThisIndx = aKeys.indexOf(sKey);
//         if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
//         else { aKeys.splice(iThisIndx, 1); }
//         delete oStorage[sKey];
//       }
//       for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
//       for (var iCouple, iKey, iCouplId = 0, aCouples = document.cookie.split(/\s*;\s*/);
//        iCouplId < aCouples.length; iCouplId++) {
//         iCouple = aCouples[iCouplId].split(/\s*=\s*/);
//         if (iCouple.length > 1) {
//           oStorage[iKey = unescape(iCouple[0])] = unescape(iCouple[1]);
//           aKeys.push(iKey);
//         }
//       }
//       return oStorage;
//     };
//     this.configurable = false;
//     this.enumerable = true;
//   })());
// }
