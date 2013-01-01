PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  this.Youhou = Pa.View.extend({
    templateName: 'menu',
    didInsertElement: function () {
      console.warn('did insert menu *********************');
    }
  });
});