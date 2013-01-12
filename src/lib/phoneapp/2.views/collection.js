PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  this.CollectionView = this.View.extend({
    content: null,
    _childTemplate: null,
    _domTree: null,
    _replaceTree: null,

    init: function() {
      PhoneApp.CollectionView._super('init', this);
      this._domTree = document.createDocumentFragment();
      this._boundingIndex = {start:0, end: 80};
      this._replaceTree = {};
      //this.content.limit = 0;
      window.COIN = this;
    },

    didInsertElement: function () {
      if (!this.content)
        return;

      if (this.content.content.length)
        this._domController(0, this.content.content, []);

      this.content.content.addArrayObserver(this._domController.bind(this));

      this.addObserver('content', function (key, old, newArray) {
        console.log('content changed');
        old.content.removeArrayObserver(this._domController);
        newArray.content.addArrayObserver(this._domController);
      });
    },

    _triggerRendering: function () {
      var nodes = this._domTree.childNodes;

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

      //delete extra nodes
      for (var i = maxLength - 1; i >=  max - start; i--) {
        this.element.removeChild(this.element.children[i]);
      }
      
    },

    _domController: function (index, added, removed) {
      added.forEach(function(item, addedIndex) {
        var realIndex = index + addedIndex;
        var testClass;

        if (realIndex in this._replaceTree) {
          testClass = this._replaceTree[realIndex];
          delete this._replaceTree[realIndex];
          this._domTree.insertBefore(testClass.element, this._domTree.childNodes[index]);
        } else {
          var testClass = Pa.View.create({
            tagName: 'li'
          });
          testClass._compiledTpl = this._childTemplate;
          testClass.controller = this.controller;
          testClass.content = item;
          this._domTree.insertBefore(testClass.render(), this._domTree.childNodes[index]);
          testClass._parentView = this;
        }

        this._childViews.insertAt(realIndex, testClass);
        //this.insertChildAt(testClass, index);
      }, this);

      removed.forEach(function(item) {
        var node = this._domTree.childNodes[index];
        if (!node) {
          console.error('Collection trying to remove a dom node that does not exists', index, item);
          return;
        }

        var nextPosition = this.content.content.indexOf(item);
        if (nextPosition == -1) {
          this._childViews[index].destroy(true);
        } else {
          this._replaceTree[nextPosition] = this._childViews.removeAt(index)[0];
        }

        
        this._domTree.removeChild(this._domTree.childNodes[index]);
      }, this);

      var modLength = added.length || removed.length;
      if (index > this._boundingIndex.end - 1 || index + modLength < this._boundingIndex.start) {
        return;
      }

      Pa.renderLoop.schedule(this._triggerRendering, this);
    }
  });
});