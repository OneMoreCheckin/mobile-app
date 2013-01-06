PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  var getSize = function (element) {
      var box, width, height;
      if ('getBoundingClientRect' in element) {
          box = element.getBoundingClientRect();
          width = Math.ceil(box.width);
          height = Math.ceil(box.height);
      }

      // Fix width for Android WebView (i.e. PhoneGap)
      if (!box && typeof window.getComputedStyle === 'function') {
        box = window.getComputedStyle(element, null);
        width = ~~(box.width.replace('px', '') * 1);
        height = ~~(box.height.replace('px', '') * 1);
      }

    return {width: width, height: height, top: box.top};
  };

  function tapToTop(scrollableElement) {
    var currentOffset = scrollableElement.scrollTop
    
    var nodes = scrollableElement.children;

    for (var i =0; i < nodes.length; i++) {
      // Animate to position 0 with a transform.
      nodes[i].style.webkitTransition =
          '-webkit-transform 300ms ease-out';
      nodes[i].addEventListener(
          'webkitTransitionEnd', onAnimationEnd, false);
      nodes[i].style.webkitTransform =
          'translate3d(0, ' + (currentOffset) +'px,0)';
    }
    
      
    function onAnimationEnd() {
      // Animation is complete, swap transform with
      // change in scrollTop after removing transition.
      for (var i =0; i < nodes.length; i++) {
        nodes[i].style.webkitTransition = '-webkit-transform 0s ease-out';
        nodes[i].style.webkitTransform =
            'translate3d(0,0,0)';

        nodes[i].removeEventListener('webkitTransitionEnd', onAnimationEnd);
        scrollableElement.scrollTop = 0;
      }
    }
}



  this.CollectionView = this.View.extend({
    content: null,
    _childTemplate: null,
    _domTree: null,
    _boundingIndex: null,

    init: function() {
      PhoneApp.CollectionView._super('init', this);
      this._domTree = document.createDocumentFragment();
      this._boundingIndex = {start:0, end: 15};
      //this.content.limit = 0;
      window.COIN = this;
      //this.TEST = document.createDocumentFragment();

      this.content.content.addArrayObserver(this._domController.bind(this));

      this.addObserver('content', function (key, old, newArray) {
        old.content.removeArrayObserver(this._domController);
        newArray.content.addArrayObserver(this._domController);
      });

    },

    didInsertElement: function () {
       // determine width of each slide
      
      var scrollable = $('.scrollable').get(0);
      var pull = $('.pull-to-refresh').get(0);
      var style = pull.style;

      var pullOffsetToRefresh = 50;

      style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
          style.OTransitionDuration = style.transitionDuration =  '0ms';
      //XXX webkit black magic. Translate3d changes the flow and follow the scroll position
      style.MozTransform = style.webkitTransform = 'translate3d(0,0,0)';
      style.msTransform = style.OTransform = 'translateX(0)';

      var isActivated = false,
          isLoading = false;

      var self = this;


      var didRefreshed = function () {
        isLoading = false;
        var nodes = scrollable.children;
        var childNode;
        for (var i =0; i < nodes.length; i ++) {
          childNode = nodes[i];
          childNode.style.webkitTransitionDuration = '500ms';
          childNode.style.webkitTransform = 'translate3d(0,0,0)';
        }
        $(pull).removeClass('loading');
      };

      document.addEventListener('taptotop', function () {
        tapToTop(scrollable);
      });

      $('#page').on('touchstart', function () {
        style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
          style.OTransitionDuration = style.transitionDuration =  '0';
      });

      $('#page').on('touchmove', function (e) {
        var top = scrollable.scrollTop;
        isActivated = false;

        if (top >= 0 || isLoading)
          return true;


        if (top >= -pullOffsetToRefresh)
          $(pull).addClass('drop-to-refresh');
        else
          $(pull).removeClass('drop-to-refresh');

        isActivated = true;

        return true;
      });

      $('#page').on('touchend', function (e) {
        if (!isActivated || isLoading)
          return true;

        var top = scrollable.scrollTop;

        if (top >= 0)
          return true;

        $(pull).removeClass('drop-to-refresh');
        
        if (top > -pullOffsetToRefresh)
          return true;

        style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
          style.OTransitionDuration = style.transitionDuration =  '0';

        
        var nodes = scrollable.children;
        var childNode;
        for (var i =0; i < nodes.length; i ++) {
          childNode = nodes[i];
          childNode.style.webkitTransitionDuration = '200ms';
          childNode.style.webkitTransform = 'translate3d(0,'+pullOffsetToRefresh+'px,0)';
        }

        $(pull).addClass('loading');

        if (self.content.refresh) {
          isLoading = true;
          self.content.refresh(didRefreshed);
        }
      });
    },

    _toggleRender: function () {
      var nodes = this._domTree.childNodes;
      var lastOffset, firstOffset;

      var maxLength = this.element.children.length;
      
      var start = this._boundingIndex.start;
      var max = this._boundingIndex.end;

      if ((start + max - 1) > nodes.length)
        max = nodes.length - start;

      for (var i = start; i < max; i++) {
        var newNode = nodes[i].cloneNode(true);
        if (i >= maxLength)
          this.element.appendChild(newNode);
        else
          this.element.replaceChild(newNode, this.element.children[i]);
      }
      
    },

    _domController: function (index, added, removed) {
      added.forEach(function(item) {
        var testClass = Pa.View.create({
          tagName: 'li'
        });
        testClass._compiledTpl = this._childTemplate;
        testClass.controller = this.controller;
        testClass.content = item;
        this._domTree.insertBefore(testClass.render(), this._domTree.childNodes[index]);

        //this.insertChildAt(testClass, index);
      }, this);

      removed.forEach(function(item) {
        console.error('***** remove', arguments);
        var node = this._domTree.childNodes[index];
        if (!node) {
          console.error('Collection trying to remove a dom node that does not exists', index, item);
          return;
        }
          
        this._domTree.removeChild(this._domTree.childNodes[index]);
      }, this);

      var modLength = added.length || removed.length;
      if (index > this._boundingIndex.end - 1 || index + modLength < this._boundingIndex.start)
        return;


      Pa.renderLoop.schedule(this._toggleRender, this);
    }
  });
});