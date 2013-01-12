PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  this.Application = Pa.View.extend({
    classNames: ['omci', 'application'],
    templateName: 'application',

    didInsertElement: function() {
      Omci.model.user.bootstrap(function() {
        //Authenticated : OK
        Omci.rootView.$('#splash').addClass('quick-hide');
        Pa.renderLoop.schedule(function () {
          Omci.hideSplash();
        });
        
      }, function() {
        Omci.hideSplash();
      });
      console.warn('root view inserted');
      this.menu = new Swipe(document.getElementById('container'));
      
      // window.setTimeout(function () {
      //   cordova.exec(function() {console.log('ok')}, function() {console.log('pas bon')}, 'TapToTop', 'install', []);
      // }, 5000);
      // this.menu.activate(true);
      // var unscrollable = function(e) { e.preventDefault(); };
      // this.$('#menu').on('touchmove', unscrollable);

      ChildBrowser.install();
    },

    willDestroyElement: function() {
      console.warn('wild delete root view');
    },

    toggleMenu: function(e) {
      this.menu.activate(!this.menu.activated);
    },

    logout: function (e) {
      Omci.model.user.logout();
      $('#splash-loading').hide();
      $('#splash-connect').show();
      this.$('#splash').removeClass('hide').removeClass('quick-hide');
    },
    login: function (e) {
      $('#splash-connect').hide();
      $('#splash-loading').show();
      Omci.model.user.authenticate(function () {  
        Omci.rootView.$('#splash').addClass('hide');
      }, function () {
        console.error('authentication fail');
      });
    }
  });
});
