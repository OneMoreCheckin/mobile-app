/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

(function(){
  'use strict';

  window.Swipe = function(element, options) {

    // return immediately if element doesn't exist
    if (!element) return null;

    // retreive options
    this.options = options || {};
    this.speed = this.options.speed || 300;
    this.callback = this.options.callback || function() {};
    this.foldedPosition = this.options.foldedPosition || 85;
    this.activated = false;



    // reference dom elements
    this.element = element;

    // trigger slider initialization
    this.setup();


    // add event listeners
    if (this.element.addEventListener) {
      this.element.addEventListener('touchstart', this, false);
      this.element.addEventListener('touchmove', this, false);
      this.element.addEventListener('touchend', this, false);
      this.element.addEventListener('touchcancel', this, false);
      this.element.addEventListener('webkitTransitionEnd', this, false);
      this.element.addEventListener('msTransitionEnd', this, false);
      this.element.addEventListener('oTransitionEnd', this, false);
      this.element.addEventListener('transitionend', this, false);
      window.addEventListener('resize', this, false);
    }

  };

  window.Swipe.prototype = {

    setup: function() {


      // determine width of each slide
      this.width = Math.ceil(('getBoundingClientRect' in this.element) ?
          this.element.getBoundingClientRect().width : this.element.offsetWidth);

      // Fix width for Android WebView (i.e. PhoneGap)
      if (this.width === 0 && typeof window.getComputedStyle === 'function') {
        this.width = window.getComputedStyle(this.element, null).width.replace('px', '');
      }

      // return immediately if measurement fails
      if (!this.width) return null;

      // hide slider element but keep positioning during setup
      var origVisibility = this.element.style.visibility;
      this.element.style.visibility = 'hidden';
      var origSpeed = this.speed;
      this.speed = 0;
      // set start position and force translate to remove initial flickering
      this.slide();
      this.speed = origSpeed;

      // restore the visibility of the slider element
      this.element.style.visibility = origVisibility;

    },

    activate: function(value) {
      this.activated = value;
      this.slide();
    },

    slide: function() {

      var style = this.element.style;

      // fallback to default speed
      var duration = this.speed;

      // set duration speed (0 represents 1-to-1 scrolling)
      style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
          style.OTransitionDuration = style.transitionDuration = duration + 'ms';

      var position = this.activated ? 0 : (this.foldedPosition * this.width / 100);

      // translate to given index position
      style.MozTransform = style.webkitTransform = 'translate3d(' + position + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + position + 'px)';
    },

    handleEvent: function(e) {
      switch (e.type) {
        case 'touchstart': this.onTouchStart(e); break;
        case 'touchmove': this.onTouchMove(e); break;
        case 'touchcancel' :
        case 'touchend': this.onTouchEnd(e); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'transitionend': this.transitionEnd(e); break;
        case 'resize': this.setup(); break;
      }
    },

    transitionEnd: function(e) {
      this.callback(e);
    },

    onTouchStart: function(e) {

      this.start = {

        // get touch coordinates for delta calculations in onTouchMove
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY,

        // set initial timestamp of touch sequence
        time: Number(new Date()),
        position: this.activated ? 0 : (this.foldedPosition * this.width / 100)

      };

      // used for testing first onTouchMove event
      this.isScrolling = undefined;
      this.direction = 0;
      this.locked = undefined;

      // reset deltaX
      this.deltaX = 0;

      
      // set transition time to 0 for 1-to-1 touch movement
      this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;

      // e.stopPropagation();
    },

    onTouchMove: function(e) {

      // ensure swiping with one touch and not pinching
      if (e.touches.length > 1 || e.scale && e.scale !== 1) return;

      this.deltaX = e.touches[0].pageX - this.start.pageX + this.start.position;

      if (this.direction === 0)
        this.direction = (e.touches[0].pageX - this.start.pageX < 0) ? 1 : 2;

      // determine if scrolling test has run - one time test
      if (typeof this.isScrolling == 'undefined') {
        this.isScrolling = !!(this.isScrolling ||
              Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY));
      }

      if (this.locked === undefined) {
        this.locked = (this.direction == 1 && this.deltaX < 0 || this.direction == 2 && this.deltaX > this.width);
      }

      // if user is not trying to scroll vertically
      if (!this.isScrolling && !this.locked) {
        var progress = this.deltaX * 100 / this.width;

        if (progress < 80 && !this.activated && this.direction == 1)
          this.activated = true;
        else if (progress > 20 && this.activated && this.direction == 2)
          this.activated = false;
        // increase resistance if first or last slide
        // this.deltaX =
        //   this.deltaX / ( Math.abs(this.deltaX) / this.width + 1 ); //resistance


        // translate immediately 1-to-1

        if (progress > -5 && progress < this.foldedPosition + 5)
          this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' +
              (this.deltaX < 0 ? 0 : this.deltaX) + 'px,0,0)';
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }



    },

    onTouchEnd: function(/*e*/) {
      this.locked = undefined;
      this.direction = 0;
      this.isScrolling = undefined;

      // if not scrolling vertically
      if (!this.isScrolling) {

        // call slide function with slide end value based on isValidSlide and isPastBounds tests
        this.slide();
        // e.stopPropagation();
      }


    }

  };
})();
