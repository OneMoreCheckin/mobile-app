PhoneApp.pack('PhoneApp', function() {
  /*jshint devel:true*/
  'use strict';
  var metamorphCount = 0;

  this.Metamorph = function(parentView, parent, property) {
    this.id = ++metamorphCount;
    this.startNodeId = 'metamorph-' + this.id + '-start';
    this.endNodeId = 'metamorph-' + this.id + '-end';

    var observer = (function(property, old, newValue) {
      var start = document.getElementById(this.startNodeId);
      var end = document.getElementById(this.endNodeId);

      if (!start || !end)
        throw new Error('Miss Metamorph hooks');

      var nextElement = start.nextSibling;


      // while (nextElement != end) {
      //   console.log('**** next element', nextElement);
      //   nextElement = nextElement.nextSibling;
      // }
      //
      PhoneApp.renderLoop.schedule(function() {
        if (typeof(newValue) == 'string') {
          if (nextElement == end)
            end.parentNode.insertBefore(end, document.createTextNode(newValue || ''));
          else
            nextElement.textContent = newValue || '';
        } else {
          var dom = newValue ? newValue.render() : document.createTextNode('');
          if (newValue) {
            newValue._parentView = parentView;
            parentView._childViews.push(newValue);
            newValue.willInsertElement();
          }
          if (nextElement == end) {
            end.parentNode.insertBefore(dom, end);
          } else {
            nextElement.parentNode.replaceChild(dom, nextElement);
          }

          if (newValue)
            newValue.didInsertElement();

          if (old && old.isView)
            old.destroy();
        }
      });

    }.bind(this));

    parent.addObserver(property, observer);

    this.renderWrapper = function() {
      return '<script id="' + this.startNodeId + '"></script>' +
          (parent.get(property) || '') +
             '<script id="' + this.endNodeId + '"></script>';
    };

    this.destroy = function() {
      parent.removeObserver(property, observer);
    };

  };
});
