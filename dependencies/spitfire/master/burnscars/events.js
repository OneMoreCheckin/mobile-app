// IE quick and dirty fix - XXX beware of NASTY side effects
// Will break feature detection for some illformed jquery plugins
if (!('addEventListener' in window))
  (function() {
    /*global attachEvent:true,detachEvent:true*/
    'use strict';
    window.addEventListener = function(name, listener/*, phase*/) {
      attachEvent('on' + name, listener);
    };
    window.removeEventListener = function(name, listener/*, phase*/) {
      detachEvent('on' + name, listener);
    };

    // XXX note that this WILL impact jquery ready event, by entirely replacing its mechanic...
    document.addEventListener = function(name, listener/*, phase*/) {
      var hasFired = false;
      if (name == 'DOMContentLoaded') {
        // ensure firing before onload,
        // maybe late but safe also for iframes

        var readyChange = function() {
          if (document.readyState === 'complete') {
            document.detachEvent('onreadystatechange', readyChange);
            hasFired = true;
            listener();
          }
        };
        document.attachEvent('onreadystatechange', readyChange);
        // If not an iframe
        // continually check to see if the document is ready
        if (document.documentElement.doScroll && window == window.top) (function() {
          if (hasFired)
            return;

          try {
            // Use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll('left');
          } catch (error) {
            // XXX ???
            setTimeout(document.addEventListener, 0);
            return;
          }

          // and execute any waiting functions
          hasFired = true;
          listener();
        })();

        // A fallback to window.onload, that will always work
        var load = function() {
          window.removeEventListener('load', load);
          if (hasFired)
            return;
          hasFired = true;
          listener();
        };

        window.addEventListener('load', load, false);

      }else {
        attachEvent('on' + name, listener);
      }
    };

    document.removeEventListener = function(name, listener/*, phase*/) {
      // XXX no way yet to handle DOMContentLoaded - need a stack and keep track of listeners hooks
      if (name != 'DOMContentLoaded') {
        detachEvent('on' + name, listener);
      }
    };
  })();
