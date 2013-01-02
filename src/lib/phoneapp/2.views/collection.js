PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  var insertAt = function(parent, position, child) {
    parent.insertBefore(child, parent.children[position]);
  }

  this.CollectionView = this.View.extend({
    content: null,
    _childTemplate: null,
    toto: null,

    init: function() {
      PhoneApp.CollectionView._super('init', this);
      this.toto = [];

      this.content.limit = 0;
      window.COIN = this;
      this.content.content.addArrayObserver(function (index, added, removed) {

        added.forEach(function(item) {
          console.warn('Insert At', index, item.name);
          var testClass = Pa.View.create({
            tagName: 'li'
          });
          testClass._compiledTpl = this._childTemplate;
          testClass.controller = this.controller;
          testClass.content = added.pop();
          //XXX Insert only once in Dom
          insertAt(this.element, index, testClass.renderWrapper());
          this.appendChild(testClass);
        }, this);

        removed.forEach(function(item) {
          console.error('Remove at ', index, item.name);
          var node = this.element.children[index];
          if (!node) {
            console.error('Collection trying to remove a dom node that does not exists', index, item);
            return;
          }
            
          this.element.removeChild(this.element.children[index]);
        }, this);
        
      }.bind(this));
    }
  });
});