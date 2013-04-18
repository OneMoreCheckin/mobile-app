/**
 * This is the *most minimal* bootstrapper possible.
 * It is meant to serve as a loader for an (actually useful) bootstrapper.
 * Don't use directly unless you know what you freaking do.
 * Bad things can still happen here, and nasty bugs are lurking.
 * Code adapted from getify JSLabs' gister.
 * This must work without any shim support, in most browsers.
 *
 * @file
 * @summary Tiny bootstrapper for companion script.
 *
 * @author WebItUp
 * @author Getify
 * @version 1.1.0
 *
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">MIT</a>.
 * @copyright All rights reserved <a href="http://www.webitup.fr">copyright WebItUp</a>
 * @see https://gist.github.com/603980
 * @name https://github.com/jsBoot/spitfire.js/blob/master/src/gulliver.js#62-f14fa4a0754ddf2a106d57504b97442407cd7d48
 */


(function() {
  /*jshint browser:true */
  'use strict';

  /**
   * The purpose is to provide a *minimal* loader, which only purpose is to
   * load a single (other!) file / library / loader.
   * Said script should reside alongside gulliver - its uri will be resolved
   * relatively to that of the gulliver script itself (assuming its name hasn't been
   * changed, or that the optional "name" param matches its new name).
   * Note that using it separately is not so much of a hot idea (you are better of
   * linking a complete loader instead...).
   * This might be useful inline though.
   *
   * @function gulliver
   * @summary Gulliver is a very tiny loader.
   * @example
   *   gulliver(function(){
   *     console.log('Library loaded');
   *   }, 'somelibrary.js');
   * @param       {Function} callback A function to call once the script is loaded.
   * @param       {String} uri        Uri of the script to load, relatively to gulliver itself.
   * @param       {String} [name=gulliver] "Name" of the gulliver script itself to resolve
   * the loaded script path and port hash options.
   * @returns     {undefined}
   */

  this.gulliver = function(callback, uri, name) {
    var head = document.head || document.getElementsByTagName('head');

    // loading code borrowed directly from LABjs itself
    var tout = function() {
      if ('item' in head) { // check if ref is still a live node list
        if (!head[0]) { // append_to node not yet ready
          setTimeout(tout, 25);
          return;
        }
        head = head[0]; // reassign from live node list ref to pure node ref --
        // avoids nasty IE bug where changes to DOM invalidate live node lists
      }
      // Get gulliver itself to guess options
      var scripts = document.getElementsByTagName('script');
      var re = new RegExp('(.*)\\/' + (name || 'gulliver') + '((?:-min)?\\.js)');
      for (var x = 0, baseGulliPath; x < scripts.length; x++) {
        baseGulliPath = scripts[x];
        if (baseGulliPath.src && (baseGulliPath = baseGulliPath.src.match(re))) {
          baseGulliPath.shift();
          uri = baseGulliPath.shift() + '/' + uri + baseGulliPath.shift();
          break;
        }
      }
      var scriptElem = document.createElement('script'),
          scriptdone = false;
      scriptElem.onload = scriptElem.onreadystatechange = function() {
        if ((scriptElem.readyState && scriptElem.readyState !== 'complete' &&
            scriptElem.readyState !== 'loaded') || scriptdone) {
          return false;
        }
        scriptElem.onload = scriptElem.onreadystatechange = null;
        scriptdone = true;
        callback();
      };
      scriptElem.src = uri;
      head.insertBefore(scriptElem, head.firstChild);
    };

    setTimeout(tout, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if ((document.readyState === null) && document.addEventListener) {
      var handler = function() {
        document.removeEventListener('DOMContentLoaded', handler, false);
        document.readyState = 'complete';
      };
      document.readyState = 'loading';
      document.addEventListener('DOMContentLoaded', handler, false);
    }
  };
}).apply(this);
