PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  this.Application = api.Object.extend({
    rootElement: $('body').get(0),
    ready: PhoneApp.K,
    autoHideSplash: false,
    device: Pa.Object.create({
      states: {
        BACKGROUND: 'background',
        RUNNING: 'running'
      },
      init: function() {
        Pa.Object._super('init', this);
        console.log('create');
      },
      state: null,
      isIphone: false,
      isIpad: false,
      isRetina: false,
      isAndroid: false,
      isMobile: (function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
      }).property()
    }),
    network: Pa.Object.create({
      types: window.Connection || {},
      states: {
        ONLINE: 'online',
        OFFLINE: 'offline'
      },
      type: null,
      state: null
    }),

    hideSplash: function() {
      if (this.device.isMobile && navigator.splashscreen.hide)
        navigator.splashscreen.hide();
    },

    onDeviceReady: function() {
      var platform;

      $(this.rootElement).empty();
      this.rootView.controller = this.rootController;
      this.rootController.view = this.rootView;
      this.rootView.appendTo(this.rootElement);


      if (!this.device.isMobile)
        return;

      if (window.KeyboardToolbarRemover)
        cordova.require('cordova/plugin/keyboard_toolbar_remover').hide();

      if (this.autoHideSplash)
        this.hideSplash();

      if (window.devicePixelRatio > 1)
        this.device.set('isRetina', true);


      if (window.device) {
        platform = window.device.platform.toLowerCase();
        if (platform.indexOf('iphone') !== -1)
          this.device.set('isIphone', true);
        else if (platform.indexOf('ipad') !== -1)
          this.device.set('isIpad', true);
        else if (platform.indexOf('android') != -1)
          this.device.set('isAndroid', true);




        var run = new PhoneApp.Run(1000, function() {
          if (navigator.connection.type == window.Connection.NONE)
                      this.network.set('state', this.network.states.OFFLINE);

          if (navigator.connection.type != this.networkType)
                      this.network.set('type', navigator.connection.type);

        }.bind(this));
        run.start();
      }
    },

    bindPhoneGapEvents: function() {
      document.addEventListener('deviceready', function() {
        this.onDeviceReady();
        this.ready();
      }.bind(this), false);
      document.addEventListener('pause', function() {
        this.device.set('state', this.device.states.BACKGROUND);
        this.onPause();
      }.bind(this), false);
      document.addEventListener('resume', function() {
        this.device.set('state', this.device.states.RUNNING);
        this.onResume();
      }.bind(this), false);
      document.addEventListener('online', function() {
        this.network.set('state', this.network.states.ONLINE);
      }.bind(this), false);
      document.addEventListener('offline', function() {
        this.network.set('state', this.network.states.OFFLINE);
      }.bind(this), false);
    },

    initialize: function() {
      if (this.device.isMobile)
        this.bindPhoneGapEvents();
      else
        this.onDeviceReady();
    }
  });

});
