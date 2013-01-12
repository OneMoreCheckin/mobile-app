PhoneApp.pack('PhoneApp.types', function() {
  /*jshint camelcase:false, devel:true*/
  'use strict';

  var mutableCount = 0;
  var hashed = {};

  this.Object = function() {
    this.__class__ = '[PhoneApp.Object]';
  };

  this.Object.prototype.toString = function() {
    return this.__class__;
  };

  var makeProperty = function(scope, key, w) {
    var initial;
    var needCompute = true;
    var initialArgs;
    var s, ke;
    w.__property__.forEach(function(item) {
      var tup = pullPoint(this, item) || pullPoint(window, item);
      if (tup) {
        s = tup.shift();
        ke = tup.shift();
        var hashTable = hashed[this.__id__];
        s.addObserver(ke, function(k, o, n) {
          initialArgs = [undefined, s, ke, n];
          // No observer? Don't recompute immediately
          if (!hashTable[key]) {
            needCompute = true;
            return;
          }
          // Otherwise, recompute
          var ov = initial;
          var rn = w.apply(scope, initialArgs);
          // If it changed, fire observers
          if (ov != rn) {
            initial = rn;
            hashTable[key].forEach(function(cbk) {
              window.setTimeout(function() {
                if (cbk.collapse && (scope[key] !== rn))
                  return;
                cbk.apply(scope, [key, ov, rn]);
              }, 1);
            });
          }
        });
      }else {
        console.error('Trying to property non-existent', item);
      }
    }, scope);

    // XXX Make properties observable
    Object.defineProperty(scope, key, {
      enumerable: true,
      configurable: true,
      // writable: false,
      get: function() {
        // XXX Optimization compute only at first demand
        if (needCompute) {
          needCompute = false;
          if (!initialArgs)
            initialArgs = [undefined, s, ke, s && s[ke]];
          initial = w.apply(this, initialArgs);
        }
        return initial;
      },
      set: function(value) {
        if (!initialArgs)
          initialArgs = [value, s, ke];
        else
          initialArgs[0] = value;
        initial = w.apply(this, initialArgs);
        initialArgs[0] = undefined;
        return initial;
        // XXX notify?
      }
    });
  };



  var bindCheck = /[A-Za-z0-9]Binding$/;

  this.Object.create = this.Object.prototype.create = function(o) {
    /*jshint forin:false*/
    var ret = new (this.extend(o))();
    hashed[ret.__id__ = mutableCount++] = {};

    var doo = [];
    for (var i in ret)
      doo.push(i);

    doo.forEach(function(key) {
      var w = this[key];
      if (!w)
        return;

      // Binding syntax helper
      if(bindCheck.test(key)){
        PhoneApp.Binding.bind(this, key.substr(0, key.length - 7), w);
        // Depending on wether the *Binding property comes from o or from a parent class...
        if(this.hasOwnProperty(key))
          delete this[key];
        else
          delete Object.getPrototypeOf(this)[key];
        return;
      }

      if (w.hasOwnProperty('__observes__')) {
        // Resolve points
        w.__observes__.forEach(function(item) {
          var tup = pullPoint(this, item) || pullPoint(window, item);
          if (tup) {
            var s = tup.shift();
            var ke = tup.shift();
            if (!('addObserver' in s))
              throw new Error('NOT_OBSERVABLE: ' + s);
            s.addObserver(ke, function(/*k, o, n*/) {
              w.apply(s, [s, ke]);
            });
          }else {
            console.error('Trying to observe non existent', item);
          }
        }, this);
      }

      if (w.hasOwnProperty('__property__')) {
        makeProperty(this, key, w);
      }
    }, ret);

    ret.init();
    // if (typeof ret.__id__ == 'undefined') {
    //   console.error('You broke init you perv!!! Observes and Properties won\'t work on this one!', ret);
    //   throw new Error('BANG_BANG!');
    // }

    return ret;
  };

  this.Object._super = this.Object.prototype._super = function(methodName, scope, args) {
    return this.prototype[methodName].apply(scope || this, args);
  };

  this.Object.extend = this.Object.prototype.extend = function(o) {
    /*jshint newcap:false*/
    o = o || {};
    var construct;
    if (o.constructor != Function) {
      construct = function() {
        Object.keys(o).forEach(function(k) {
          this[k] = o[k];
        }, this);
      };
    }else {
      construct = o;
    }

    construct.prototype = new this();
    construct.extend = this.extend;
    construct.create = this.create;
    // construct.isExtensionOf = this.isExtensionOf;
    construct._super = this._super;
    return construct;
  };


  this.Object.prototype.init = function() {
    // console.log('-> Base PhoneApp Object init');
  };

  this.Object.prototype.addObserver = function(key, listener, collapse) {
    var m;
    if (!(key in hashed[this.__id__]))
      hashed[this.__id__][key] = [];
    m = hashed[this.__id__][key];
    if (m.indexOf(listener) == -1) {
      listener.collapse = (collapse === undefined) || collapse;
      m.push(listener);
    }
  };

  this.Object.prototype.removeObserver = function(key, listener) {
    if (!(key in hashed[this.__id__]))
      return;
    var m = hashed[this.__id__][key];
    var n = m.indexOf(listener);
    if (n == -1)
      return;
    m.splice(n, 1);
  };


  this.Object.prototype.set = function(key, value) {
    var tup = pullConstructivePoint(this, key);
    var scope = tup.shift();
    key = tup.shift();
    var ov = scope[key];
    if (value === ov)
      return;
    scope[key] = value;
    (hashed[scope.__id__][key] || []).forEach(function(cbk) {
      window.setTimeout(function() {
        if (cbk.collapse && (scope[key] !== value))
          return;
        cbk.apply(scope, [key, ov, value]);
      }, 1);
    });
  };

  this.Object.prototype.destroy = function() {
    /*jshint forin:false*/
    delete hashed[this.__id__];
    for (var i in this)
      delete this[i];
  };

  this.Object.isExtensionOf = function(Class, ParentClass) {
    return Class && Class.prototype && (Class.prototype instanceof ParentClass);
  };

  /**
   * Property and Observes helpers
   */
  var pullPoint = function(scope, strKey) {
    var po = strKey.split('.');
    while (scope && po.length > 1) {
      scope = scope[po.shift()];
    }
    if (scope && !(po[po.length - 1] in scope))
      scope = null;
    return scope ? [scope, po.shift()] : undefined;
  };

  var pullConstructivePoint = function(scope, strKey) {
    var po = strKey.split('.'), k;
    while (po.length > 1) {
      k = po.shift();
      if (!(k in scope))
        scope[k] = {};
      scope = scope[k];
    }
    return [scope, po.shift()];
  };

  PhoneApp.get = this.Object.prototype.get = function(path) {
    var ret = pullPoint(this, path) || pullPoint(window, path);
    if (ret)
      ret = (ret.shift())[ret.pop()];
    return ret;
  };

  var f;
  var t;
  PhoneApp.Binding = {
    oneWay: function(path) {
      return (function(n, s, k, v) {
        return v;
      }.property(path));
    },
    bothWays: function(path) {
      return (function(n, s, k, v) {
        if (n === undefined)
          return v;
        s.set(k, n);
        return n;
      }.property(path));
    },
    from: function(path) {
      f = path;
      return this;
    },
    to: function(key) {
      t = key;
      return this;
    },
    connect: function(scope) {
      this.bind(scope, t, f);
      f = undefined;
      t = undefined;
    },
    bind: function(scope, key, path) {
      makeProperty(scope, key, this.bothWays(path));
    }
  };

  // (MyApp.anotherObject, "value", "MyApp.someController.value");


  // totoBinding = Ember.Binding.oneWay('App.user.fullName')

  // binding = Ember.Binding.from(this.valueBinding).to("value");

  Function.prototype.observes = function() {
    this.__observes__ = Array.prototype.slice.call(arguments);
    return this;
  };

  Function.prototype.property = function() {
    this.__property__ = Array.prototype.slice.call(arguments);
    return this;
  };

});

