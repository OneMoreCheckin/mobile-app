PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  this.Splash = Pa.View.extend({
    classNames: ['test-splash'],

    template: Handlebars.compile('coucou')
  });
});
