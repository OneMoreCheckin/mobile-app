PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  var setTansform = function (el, translate, transition) {
    var style = el.style;

    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
          style.OTransitionDuration = style.transitionDuration =  transition + 'ms';
      //XXX webkit black magic. Translate3d changes the flow and follow the scroll position
    style.MozTransform = style.webkitTransform = 'translate3d(0,'+translate+'px,0)';
    style.msTransform = style.OTransform = 'translateX('+translate+'px)';
  };

  var setTansformAllChildren = function (parent, translate, transition) {
    var nodes = parent.children;
    var childNode;
    for (var i =0; i < nodes.length; i ++) {
      childNode = nodes[i];
      setTansform(childNode, translate, transition);
    }
  }

  

  var tapToTop = (function (scrollableElement) {
    var currentOffset = scrollableElement.scrollTop;
    var nodes = scrollableElement.children;
    var onAnimationEnd = function () {
      // Animation is complete, swap transform with
      // change in scrollTop after removing transition.
      this.style.webkitTransition = '-webkit-transform 0s ease-out';
      this.style.webkitTransform =
          'translate3d(0,0,0)';
      scrollableElement.scrollTop = 0;

      this.removeEventListener('webkitTransitionEnd', onAnimationEnd);
    };
     
    for (var i =0; i < nodes.length; i++) {
      // Animate to position 0 with a transform.
      nodes[i].style.webkitTransition =
          '-webkit-transform 300ms ease-out';
      nodes[i].addEventListener(
          'webkitTransitionEnd', onAnimationEnd, false);
      nodes[i].style.webkitTransform =
          'translate3d(0, ' + (currentOffset) +'px,0)';
    }
  });



  this.ScrollableView = this.View.extend({
    offsetPullToRefresh: 50,
    isScrolling: false,
    isLoading: false,

    didInsertElement: function () {
      var scrollable = this.element;
      var pull = scrollable.querySelector('.pull-to-refresh');

      setTansformAllChildren(scrollable, 0, 0);

      document.addEventListener('taptotop', this.scrollToTop);
      
      this.$().on('touchmove', function (e) {

        // ensure swiping with one touch and not pinching
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;

        Pa.renderLoop.schedule(function () {
          var top = scrollable.scrollTop;
        
          if (top >= 0 || this.isLoading)
            return true;


          if (top <= -this.offsetPullToRefresh)
            $(pull).addClass('drop-to-refresh');
          else
            $(pull).removeClass('drop-to-refresh');

          this.set('isActivated', true);
        }, this);
        

        return true;
      }.bind(this));

      this.$().on('touchend', function (e) {
        if (!this.isActivated || this.isLoading)
          return true;
        Pa.renderLoop.schedule(function () {
          var top = scrollable.scrollTop;

          if (top >= 0)
            return true;

          $(pull).removeClass('drop-to-refresh');
          
          if (top > -this.offsetPullToRefresh)
            return true;

          pull.style.webkitTransitionDuration = 0;
          setTansformAllChildren(this.element, this.offsetPullToRefresh, 200);

          $(pull).addClass('loading');
          this.set('isActivated', false);
          this.set('isLoading', true);

          window.setTimeout(function () {
            this.set('isLoading', false);
            //XXX smooth loading slide out
            setTansformAllChildren(this.element, 0, 0);
            $(pull).removeClass('loading');
          }.bind(this), 2000);
        }, this);
        //XXX send refresh event to collection controllers ???
        // if (self.content.refresh) {
        //   this.set('isLoading', true);
        //   this.content.refresh(didRefreshed);
        // }
      }.bind(this));
    },

    scrollToTop: function () {
      tapToTop(this.element);
    },

    willDestroyElement: function () {
      this.$().off();
      document.removeEventListener('taptotop', this.scrollToTop);
    }
  });

});