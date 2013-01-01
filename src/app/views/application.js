PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  var shuffle = function(elems) {

    var allElems = (function() {
      var ret = [], l = elems.length;
      while (l--) { ret[ret.length] = elems[l]; }
      return ret;
    })();

    var shuffled = (function() {
      var l = allElems.length, ret = [];
      while (l--) {
        var random = Math.floor(Math.random() * allElems.length),
            randEl = allElems[random].cloneNode(true);
        allElems.splice(random, 1);
        ret[ret.length] = randEl;
      }
      return ret;
    })(), l = elems.length;

    while (l--) {
      elems[l].parentNode.insertBefore(shuffled[l], elems[l].nextSibling);
      elems[l].parentNode.removeChild(elems[l]);
    }

  }

  this.Application = Pa.View.extend({
    classNames: ['omci', 'application'],
    templateName: 'application',

    didInsertElement: function() {
      Omci.hideSplash();
      Omci.model.user.bootstrap(function() {
        console.log('success');
        Omci.router.transitionTo('application');

      }, function() {

      });
      console.warn('root view inserted');
      this.menu = new Swipe(document.getElementById('container'));
      //this.menu.activate(true);
      var unscrollable = function(e) { e.preventDefault(); };
      this.$('#menu').on('touchmove', unscrollable);
      // this.menu = new Swipe(document.getElementById('container'));
      // this.menu.activate(true);
      // var unscrollable = function(e) { e.preventDefault(); };
      // this.$('#menu').on('touchmove', unscrollable);

      // $('#page').hide();
      // window.setTimeout(function () {

      //     $('#page').show();
      // }, 5000);
      //

      ChildBrowser.install();
    },

    willDestroyElement: function() {
      console.warn('wild delete root view');
    },

    toggleMenu: function(e) {
      this.menu.activate(!this.menu.activated);
    },

    sort: function(e) {
      var node = e.target;
      var sort = node.getAttribute('data-sort');
      $(node).siblings().removeClass('active');
      $(node).addClass('active');

      Pa.renderLoop.schedule(function() {
        shuffle($('.badges li'));
      });

    }
  });
});
