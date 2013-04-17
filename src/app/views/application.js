PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';
  var huhu = false;

  this.Application = Pa.View.extend({
    classNames: ['omci', 'application'],
    templateName: 'application',
    userLogged: false,

    didInsertElement: function() {
      console.warn('root view inserted');
      Omci.router = Omci.router.create();
      Omci.router.transitionTo('index');

      Omci.model.user.bootstrap(function() {
        //Authenticated : OK
        console.log('boot ok');
        Omci.rootView.analytics.sendView('/home');
        $('#splash').removeClass('network-error');
        Omci.rootView.set('userLogged', true);
        
      }, function() {
        console.log('boot fail');
        Pa.renderLoop.schedule(function () {
          Omci.hideSplash();
          $('#splash').addClass('play');
        });
      });

      this.analytics = cordova.require('cordova/plugin/GoogleAnalytics');
      this.analytics.startTrackerWithAccountID('UA-27075824-11');
      this.analytics.sendView('/splash');

      this.feedback = cordova.require('cordova/plugin/UserVoice');

      this.menu = new Swipe(document.getElementById('container'));
      // this.menu.activate(true);

      // window.plugins.childBrowser.onClose = function () {
      //     if (Omci.network.state == Omci.network.states.OFFLINE) {
      //       $('#splash').removeClass('loading').addClass('network-error');
      //     }
      // }

      $('#container').on('touchend', function (e) {
        if (this.menu.activated)
          return true;

        if ($(e.target).hasClass('toggle-menu'))
          return;

        var path = Omci.router.currentPath.split('.');
        path.pop();
        path = '/' + path.join('/');
        Omci.rootView.analytics.sendView(path);
        this.menu.activate(true);

        e.preventDefault();
        if (e.stopImmediatePropagation)
          e.stopImmediatePropagation();
        return false;
      }.bind(this));
    },

    onBrowserClosed: function () {
      if (Omci.network.state == Omci.network.states.OFFLINE) {
        $('#splash').removeClass('loading').addClass('network-error');
      } else {
        $('#splash').removeClass('loading').removeClass('network-error');
      }
    },


    badgesReady: function () {
      if (!Omci.model.user.dataReady)
        return;

      console.warn('DATA READY');
      window.setTimeout(function () {
       Pa.renderLoop.schedule(function () {
          $('#splash').removeClass('loading');
          Omci.rootView.$('#splash').addClass('quick-hide');
          $('#splash').removeClass('play');
        });
      }, 100);
      window.setTimeout(function () {
       Pa.renderLoop.schedule(function () {
          Omci.hideSplash();
       });
      }, 100);

    }.observes('Omci.model.user.dataReady'),

    networkStatusUpdated: function () {
      if (!this.userLogged && Omci.network.state == Omci.network.states.OFFLINE)
        $('#splash').addClass('network-error').removeClass('loading');

      if (!Omci.network.state == Omci.network.states.ONLINE)
        $('#splash').removeClass('network-error');
    }.observes('Omci.network.state'),

    willDestroyElement: function() {
      console.warn('wild delete root view');
    },

    toggleMenu: function(e) {
      if (this.menu.activated)
        this.analytics.sendView('/home');

      this.menu.activate(!this.menu.activated);
    },

    goTo: function (e) {
      this.menu.activate(true);
      Omci.router.transitionTo('badges.' + e.context);
      this.analytics.sendView('/badges/'+e.context);

      Pa.renderLoop.schedule(function () {
        $('#menu li').removeClass('is-active');
        $(e.target).addClass('is-active');
      });
    },

    showFeedback: function () {
      this.feedback.open();
      this.analytics.sendView('/feedback');
    },

    logout: function (e) {
      // location.href="fb://page/240965326008435";
      // return;
      // 
      var callback = function (key) {
        if (key != 2)
          return;

        this.analytics.sendView('/logout');
        Omci.model.user.logout();
        this.$('#splash').removeClass('hide').removeClass('quick-hide').addClass('play');

      }.bind(this);

      if (Omci.device.isMobile)
        navigator.notification.confirm('Are you sure you want to logout?', callback , 'Logout', 'No,Yes');
      else
        callback(2);
    },
    login: function (e) {
      $('#splash').addClass('loading');
      Omci.model.user.authenticate(function () {
        console.warn('authenticate');
        Omci.rootView.analytics.sendView('/home');
        $('#splash').removeClass('network-error');
        Omci.rootView.set('userLogged', true);
      }, function () {
        $('#splash').removeClass('loading');
        Omci.rootView.set('userLogged', false);
        console.error('authentication fail');
      });
    }
  });
});
