(function () {
  'use strict';

  cordova.define("cordova/plugin/UserVoice", function(require, exports, module) {
    var exec = require('cordova/exec');

    var UserVoice = function () {

    };

    UserVoice.prototype.open = function(id) {
      exec(function () {},function () {}, "UserVoicePlugin", "open", []);
    };

    module.exports = new UserVoice();
  });
})();