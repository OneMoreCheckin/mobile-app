PhoneApp.pack('PhoneApp', function() {
  /*jshint devel:true*/
  'use strict';
  var metamorphCount = 0;

  this.Metamorph = (function (path) {
    this.id = ++metamorphCount;
    this.startNodeId = 'metamorph-'+this.id+'-start';
    this.endNodeId = 'metamorph-'+this.id+'-end';
    this.property = path;

    var infos = path.split('.');
    var property = infos.pop();
    var parent = PhoneApp.get(infos.join('.'));
    var observer = function (property, old, newValue) {
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
      PhoneApp.renderLoop.schedule(function () {
        nextElement.textContent = newValue;
      });

    }.bind(this);

    parent.addObserver(property, observer);

    this.renderWrapper = function () {
      return '<script id="'+this.startNodeId+'"></script>' +
              PhoneApp.get(this.property) +
             '<script id="'+this.endNodeId+'"></script>';
    };

    this.destroy = function () {
      parent.removeObserver(property, observer);
    };
    
  });
});