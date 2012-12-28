PhoneApp.pack('PhoneApp', function() {
  'use strict';

  (function() {
    ['ms', 'moz', 'webkit', 'o'].some(function(prefix) {
      window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame']
                                 || window[prefix + 'CancelRequestAnimationFrame'];
      return window.requestAnimationFrame;
    });

    if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function(callback, element) {
        var currTime = Date.now();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        lastTime = currTime + timeToCall;
        return window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
      };
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }());



  var animLoop = function(render, element ) {
    var running, lastFrame = Date.now();
    function loop(now) {
      if (running !== false) {
        requestAnimationFrame(loop, element);
        running = render(now - lastFrame, now);
        lastFrame = now;
      }
    }
    loop();
  };

  var Run = function(delay, callback) {
    var ref = null;

    this.start = function() {
      ref = window.setInterval(callback, delay);
    };

    this.stop = function() {
      window.clearInterval(ref);
    };
  };

  this.Run = Run;

  // var renderQueue = {};
  // var renderIdx = 0;

  // this.renderLoop = {
  //   add: function(view, operation, callback) {
  //     renderIdx++;
  //     // console.log(' **** add to run loop', view, operation);
  //     renderQueue[renderIdx] = {
  //       view: view, operation: operation, callback: callback
  //     };
  //   },
  //   flush: function(id) {
  //     var op = renderQueue[id];
  //     // console.log('*** flush ', op);
  //     // XXX defere callbacks
  //     if (op.callback)
  //       // window.setTimeout(function(){
  //       op.callback.call(op.view, op.operation);
  //       // }, 1);

  //     delete renderQueue[id];
  //   }

  // };

  // animLoop(function(deltaT, now ) {
  //   if(deltaT > 160)
  //     return;
  //   // rendering code goes here
  //   // return false; will stop the loop
  //   // var lim = 2000;
  //   Object.keys(renderQueue).some(function(id, idx){
  //     if(!idx)
  //       console.time('fucjk');
  //     else if(idx > 4990)
  //       console.timeEnd('fucjk');
  //     // if(idx > lim)
  //     //   return true;
  //     var op = renderQueue[id];
  //     var domNode = document.getElementById(op.view.elementId);

  //     if (op.operation == 'render'){
  //       if(!domNode)
  //         return
  //       op.view.render(domNode);
  //     }else if (op.operation == 'destroy' && domNode){
  //       op.view.element.remove();
  //     }

  //     var op = renderQueue[id];
  //     // console.log('*** flush ', op);
  //     // XXX defere callbacks
  //     if (op.callback)
  //       // window.setTimeout(function(){
  //       op.callback.call(op.view, op.operation);
  //       // }, 1);

  //     delete renderQueue[id];

  //     // PhoneApp.renderLoop.flush(id);
  //   });

  //   return true;
  // });



  var renderQueue = [];
  var hook = [];

  this.renderLoop = {
    add: function(view, operation, callback) {
      renderQueue.push({
        view: view, operation: operation, callback: callback
      });
    },
    schedule: function(callback, scope, extra) {
      renderQueue.push({
        view: scope, operation: 'schedule', callback: callback, extra: extra
      });
    },
    hook: function(callback) {
      if (hook.indexOf(callback) == -1)
        hook.push(callback);
    }
  };

  animLoop(function(deltaT, now ) {
    if (deltaT > 160)
      return;
    var item = renderQueue.shift();
    var v;
    var pending = [];
    while (item) {
      v = item.view;

      if (item.operation == 'schedule') {
        item.callback.apply(v, item.extra);
        item = renderQueue.shift();
        continue;
      }

      var domNode = document.getElementById(v.elementId);

      if (item.operation == 'render') {
        if (!domNode) {
          pending.push(item);
          item = renderQueue.shift();
          continue;
        }
        v.render(domNode);
      }else if (item.operation == 'destroy' && domNode) {
        v.element.parentNode.removeChild(v.element);
      }

      if (item.callback)
        // window.setTimeout(function(){
        item.callback.call(v, item.operation);
      item = renderQueue.shift();
    }

    hook.forEach(function(callback) {
      callback();
    });
    renderQueue = pending;
    return true;
  });

});
