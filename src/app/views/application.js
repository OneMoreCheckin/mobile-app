PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  this.Application = Pa.View.extend({
    classNames: ['omci', 'application'],
    templateName: 'application',

    didInsertElement: function() {
      console.warn('root view inserted');
      this.menu = new Swipe(document.getElementById('container'));
      //this.menu.activate(true);
      var unscrollable = function(e) { e.preventDefault(); };
      this.$('#menu').on('touchmove', unscrollable);
      Omci.hideSplash();
    },

    willDestroyElement: function() {
      console.warn('wild delete root view');
    },

    toggleMenu: function (e) {
      this.menu.activate(!this.menu.activated);
    }
  });
});
