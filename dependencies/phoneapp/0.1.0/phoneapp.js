(function() {
  'use strict';

  this.PhoneApp = {
    K: function() {},
    TEMPLATES: Handlebars.templates || {},
    ENV: {
      HANDLEBARS_EXPOSE_OBJECTS: []
    }
  };

  this.Pa = this.Em = this.Ember = this.PhoneApp;

}).apply(this);

(function(globalObject) {
  'use strict';

  var toUse = [];
  var lastUse;
  var toAdd = [];
  var lastAdd;

  var flush = function() {
    if (lastUse) {
      toUse.push(lastUse);
      lastUse = null;
    }
    if (lastAdd) {
      if (!lastAdd.name)
        throw new Error('NEED_A_NAME: Trying to bind "something" without any name');
      toAdd.push(lastAdd);
      lastAdd = null;
    }
  };

  var simplePull = function(glob, name, optional) {
    name.split('.').forEach(function(fragment) {
      if (!glob || !(fragment in glob))
        if (!optional)
          throw new Error('MISSING: Trying to require something that doesn\'t exist' + name);
        else
          return (glob = undefined);
        glob = glob[fragment];
    });
    return glob;
  };

  var parentPull = function(glob, name) {
    var ret = {};
    name.split('.').forEach(function(fragment) {
      ret.o = glob;
      ret.k = fragment;
      if (!(fragment in glob))
        glob[fragment] = {};
      glob = glob[fragment];
    });
    return ret;
  };

  var packer = function() {
    // Close anything going on
    flush();
    // Dereference requested stuff and flush it
    var localUse = toUse;
    var localAdd = toAdd;
    toUse = [];
    toAdd = [];

    // Add local elements to the API
    var api = {};
    localAdd.forEach(function(item) {
      if (item.name in api)
        throw new Error('ALREADY_DEFINED: You are shadowing ' + api[item.name] + ' with ' +
            item + ' for name ' + item.name);
      api[item.name] = item.value;
    });

    localUse.forEach(function(item) {
      if (item.name in api)
        throw new Error('ALREADY_DEFINED: You are shadowing name ' + item.name);
      api[item.name] = simplePull(globalObject, item.module, item.optional);
    });
    return api;
  };

  /**
   * Public API
   */

  this.use = function(a, optional) {
    flush();
    lastUse = {module: a, name: a.split('.').pop(), optional: optional};
    return this;
  };

  this.add = function(a, optional) {
    if ((a === undefined) && !optional)
      throw new Error('UNDEFINED: Requesting something local that is undefined');
    flush();
    lastAdd = {value: a};
    return this;
  };

  this.as = function(a) {
    if (lastUse)
      lastUse.name = a;
    else if (lastAdd)
      lastAdd.name = a;
    flush();
  };

  this.pack = function(name, factory) {
    var api = packer();
    var r = parentPull(globalObject, name);
    var ret = factory.apply(r.o[r.k], [api]);
    if (ret)
      r.o[r.k] = ret;
  };

  this.run = function(factory) {
    var api = packer();
    factory.apply({}, [api]);
  };

}).apply(PhoneApp, [window]);

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
      if (bindCheck.test(key)) {
        PhoneApp.Binding.bind(this, key.substr(0, key.length - 7), w);
        // Depending on wether the *Binding property comes from o or from a parent class...
        if (this.hasOwnProperty(key))
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


PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp.types', function(api) {
  /*jshint camelcase:false*/
  'use strict';
  Array.prototype.replace = function(index, removeCount, adds) {
    var m;
    if (adds === undefined)
      adds = [];
    if (!adds || adds.constructor != Array)
      adds = [adds];
    m = adds.map(function(item) {return item;});
    m.unshift(removeCount);
    m.unshift(index);
    var remed = Array.prototype.splice.apply(this, m);
    if ('__hashcache__' in this)
      this.__hashcache__.forEach(function(item) {
        window.setTimeout(function() {
          item.apply(this, [index, adds, remed]);
        }.bind(this), 1);
      }, this);
    return remed;
  };

  Array.prototype.popObject = function() {
    return this.replace(this.length - 1, 1);
  };

  Array.prototype.pushObject = function(o) {
    return this.replace(this.length, 0, o);
  };

  Array.prototype.shiftObject = function() {
    return this.replace(0, 1);
  };

  Array.prototype.unshiftObject = function(o) {
    return this.replace(0, 0, o);
  };

  Array.prototype.removeObject = function(o) {
    var needle = this.indexOf(o);
    if (needle != -1)
      return this.replace(needle, 1);
  };

  Array.prototype.insertAt = function(index, o) {
    return this.replace(index, 0, o);
  };

  Array.prototype.removeAt = function(index) {
    return this.replace(index, 1);
  };

  Array.prototype.clear = function() {
    return this.replace(0, this.length);
  };

  Array.prototype.removeArrayObserver = function(listener) {
    if (!('__hashcache__' in this))
      return;
    var needle = this.__hashcache__.indexOf(listener);
    if (needle != -1)
      this.__hashcache__.splice(needle, 1);
  };

  Array.prototype.addArrayObserver = function(listener) {
    if (!('__hashcache__' in this))
      this.__hashcache__ = [];
    this.__hashcache__.push(listener);
  };

  var swap = function(arr, i, j) {
    if (i == j)
      return;
    var tmp = arr[i];
    tmp = arr.replace(j, 1, tmp);
    arr.replace(i, 1, tmp);
  };

  var quickSort = function(arr, compare, left, right) {
    if (left >= right)
      return;
    swap(arr, left, Math.floor((left + right) / 2));
    var i;
    var last = left;
    for (i = left + 1; i <= right; i++)
      if (compare(arr[i], arr[left]) < 0)
        swap(arr, ++last, i);
      swap(arr, left, last);
    quickSort(arr, compare, left, last - 1);
    quickSort(arr, compare, last + 1, right);
  };

  Array.prototype.quickSort = function(compare) {
    quickSort(this, compare, 0, this.length - 1);
    return this;
  };

  this.ArrayController = api.Object.extend({
    length: 0,
    init: function() {
      api.Object._super('init', this);

      var arr = false;
      var c = false;
      var m = false;
      var s = false;
      var t = [];

      var filter = function() {
        return true;
      };

      var map = function(item) {
        return item;
      };

      var sort = function(a, b) {
        return (a < b) ? -1 : (a == b ? 0 : 1);
      };

      var limit = Infinity;

      var obs = (function(index, added, removed) {
        removed.forEach(function(item) {
          var needle = c.indexOf(item, index);
          if (needle != -1) {
            c.splice(needle, 1);
            item = m.splice(needle, 1).pop();
            needle = s.indexOf(item);
            s.splice(needle, 1);
            if (needle < t.length)
              t.replace(needle, 1);
          }
        });

        // removed.forEach(function(item) {
        //   var needle = t.indexOf(item);
        //   if(needle != -1)
        //     t.replace(needle, 1);
        // });


        added.forEach(function(item) {
          if (filter(item)) {
            c.splice(index, 0, item);
            item = map(item);
            m.splice(index, 0, item);
            var needle = 0;
            s.some(function(sub, idx) {
              if (sort(item, sub) >= 0)
                needle = idx + 1;
              return sort(item, sub) < 0;
            });
            s.splice(needle, 0, item);
            if (needle <= t.length && needle < limit)
              t.replace(needle, 0, item);
          }
        });

        // Overflow?
        if (t.length > limit)
          t.replace(limit, t.length - limit);

        // Underflow?
        if (limit != Infinity && t.length < limit && t.length < s.length)
          t.replace(t.length, 0, s.slice(t.length, limit));

        this.set('length', t.length);
      }.bind(this));

      this.destroy = function() {
        arr.removeArrayObserver(obs);
        arr = false;
        c = false;
        m = false;
        s = false;
        this.set('length', 0);
        t.clear();
      };

      Object.defineProperty(this, 'original', {
        get: function() {
          return arr;
        }
      });

      var docc = false;

      if (this.sort !== undefined)
        sort = this.sort;

      if (this.filter !== undefined)
        filter = this.filter;

      if (this.map !== undefined)
        map = this.map;

      if (this.limit !== undefined)
        limit = this.limit;

      if (this.content !== undefined) {
        arr = this.content;
        docc = true;
      }

      Object.defineProperty(this, 'content', {
        enumerable: true,
        get: function() {
          return t;
        },
        set: function(a) {
          if (arr)
            arr.removeArrayObserver(obs);
          arr = a;
          arr.addArrayObserver(obs);
          c = arr.filter(filter);
          m = c.map(map);
          s = Array.from(m);
          s.quickSort(sort);
          t.clear();
          s.some(function(item) {
            t.pushObject(item);
            return t.length == limit;
          });
          this.set('length', t.length);
        }
      });

      Object.defineProperty(this, 'filter', {
        get: function() {
          return filter;
        },
        set: function(callback) {
          filter = callback;
          if (arr) {
            c = arr.filter(filter);
            m = c.map(map);
            s = Array.from(m);
            s.quickSort(sort);
            t.clear();
            s.some(function(item) {
              t.pushObject(item);
              return t.length == limit;
            });
            this.set('length', t.length);
          }
        }
      });

      Object.defineProperty(this, 'map', {
        get: function() {
          return map;
        },
        set: function(callback) {
          map = callback;
          if (arr) {
            m = c.map(map);
            s = Array.from(m);
            s.quickSort(sort);
            t.clear();
            s.some(function(item) {
              t.pushObject(item);
              return t.length == limit;
            });
            this.set('length', t.length);
          }
        }
      });

      Object.defineProperty(this, 'sort', {
        get: function() {
          return sort;
        },
        set: function(callback) {
          sort = callback;
          if (arr) {
            s.quickSort(sort);
            t.clear();
            s.some(function(item) {
              t.pushObject(item);
              return t.length == limit;
            });
            this.set('length', t.length);
          }
        }
      });

      Object.defineProperty(this, 'limit', {
        get: function() {
          return limit;
        },
        set: function(value) {
          limit = value;
          if (arr) {
            if (t.length > limit)
              t.replace(limit, t.length - limit);
            else {
              t.replace.apply(t, [t.length, 0, s.slice(t.length, limit)]);
            }
            this.set('length', t.length);
          }
        }
      });

      // Force reassign
      if (docc)
        this.content = arr;
    }
  });

});


PhoneApp.add(Error).as('NativeError');
PhoneApp.pack('PhoneApp.types', function(api) {
  /*global printStackTrace:false*/
  'use strict';

  // Possibly pb related to X-Domain limitation shit
  this.Error = function(name, message) {
    // Error behavior is strange...
    var b = api.NativeError.apply(this, [message]);
    // Not too sure this leads anywhere safe though (google code fux...)
    if ((this == window) || (this === undefined))
      return;
    this.message = b.message;
    this.stack = b.stack;
    this.name = name;
    if (!this.stack)
      this.stack = (typeof printStackTrace != 'undefined') ? printStackTrace() : [];
  };

  Object.getOwnPropertyNames(api.NativeError.prototype).forEach(function(i) {
    if (i != 'constructor')
      this.Error.prototype[i] = api.NativeError.prototype[i];
  }, this);

  ['NOT_IMPLEMENTED', 'UNSPECIFIED', 'NOT_INITIALIZED', 'WRONG_ARGUMENTS',
   'UNSUPPORTED', 'NATURAL_BORN_CRASH'].forEach(function(item, idx) {
    this.Error[item] = this.Error.prototype[item] = idx;
  }, this);

  this.Error.prototype.toString = function() {
    return this.name + ': ' + this.message + '\nStack: ' +
        ((typeof this.stack == 'array') ? this.stack.join('\n') : this.stack);
  };

});

PhoneApp.use('PhoneApp.types.Error');
PhoneApp.pack('PhoneApp.service', function(api) {
  'use strict';
  this.Error = function(name, message, details) {
    api.Error.apply(this, arguments);
    this.details = details;
  };

  this.Error.prototype = Object.create(api.Error.prototype);

  ['OPENING_FAILED', 'SEND_FAILED', 'FAILED_UID', 'MEANINGLESS_DATA', 'BAD_REQUEST',
   'MISSING', 'BAD_REQUEST', 'UNAUTHORIZED', 'INVALID_SIGNATURE', 'WRONG_CREDENTIALS',
   'SHOULD_NOT_HAPPEN', 'SERVICE_UNAVAILABLE', 'UNAUTHORIZED', 'UNSPECIFIED'].
      forEach(function(item) {
        this[item] = this.prototype[item] = item;
      }, this.Error);

});

PhoneApp.add(XMLHttpRequest).as('XMLHttpRequest');
PhoneApp.use('PhoneApp.service.Error');
PhoneApp.pack('PhoneApp.service', function(api) {
  /*global File, DOMParser, Blob*/
  'use strict';

  var hasModern = (typeof File != 'undefined') && (typeof Blob != 'undefined');

  this.SimpleClient = function() {
    var host;
    var port = '';
    var version = '';
    var scheme = '';
    var Backend = api.XMLHttpRequest;

    this.configure = function(options) {
      if (options.host)
        host = options.host;
      if (options.port)
        port = options.port;
      if (options.scheme)
        scheme = options.scheme + ':';
      if (options.version)
        version = options.version;
      if (options.backend)
        Backend = options.backend;
    };

    Object.defineProperty(this, 'Backend', {
      get: function() {
        return Backend;
      }
    });


    // Object.defineProperty(this, 'version', {
    //   get: function() {
    //     return version;
    //   }
    // });

    this.url = function(options) {
      // XXX use an IRL object instead of that crap
      var url = scheme + '//' + host + (port ? ':' + port : '') + (version ? '/' + version : '');
      // Optional serviceName
      if (options.service)
        url += '/' + options.service;
      // Optional id
      if (options.id)
        url += '/' + encodeURIComponent(options.id);
      // Optional command
      if (options.command)
        url += '/' + options.command;
      // Opt parts
      if (options.additional)
        url += '/' + options.additional.map(encodeURIComponent).join('/');

      if (!options.params)
        options.params = {};

      // Build-up query string if any
      var query = [];
      Object.keys(options.params).forEach(function(i) {
        query.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.params[i]));
      });

      if (query.length)
        url += '?' + query.join('&');

      return url;
    };
  };

  var callback = function() {
    /*jshint maxcomplexity: 40, devel:true*/
    // Get the inner object and free
    var inner = this.inner;
    var failure = this.options.onfailure;
    var success = this.options.onsuccess;

    // XXX Latest chrome seems to fire OPENED synchronously
    if (!inner) {
      console.warn('BAD SHIT HAPPENED!');
      return;
    }

    if (inner.readyState == inner.FAILED_OPENING) {
      // Clean-up what we definitely don't want to dangle out
      this.inner = this.engine = this.options.onsuccess = this.options.onfailure = inner.onreadystatechange = null;
      this.error = new api.Error(api.Error.UNAUTHORIZED, 'Not authorized to access this', this);
      if (failure)
        failure(this.error);
      return;
    }

    // Ignore all-these
    if (inner.readyState != inner.DONE)
      return;

    var engine = this.engine;
    // Clean-up ref to avoid dirty leak (should be partly done by shimed XHR)
    this.inner = this.engine = this.options.onsuccess = this.options.onfailure = inner.onreadystatechange = null;

    try {
      if (inner.responseText)
        this.data = JSON.parse(inner.responseText);
    }catch (e) {
      try {
        var parser = new DOMParser();
        this.data = parser.parseFromString(inner.responseText, 'application/xml');
      }catch (e2) {
        this.data = inner.responseText;
        this.error = new api.Error(api.Error.MEANINGLESS_DATA, 'WHAT? ALBATROS?', this);
      }
    }

    switch (inner.status) {
      case 200:
      case 201:
        break;
      case 308:
        // GET follow this - not too sure this is accurate HTTP but required by Roxee
        this.options.url = inner.getResponseHeader('Location');
        engine.query(engine.GET, this.options, this.headers);
        return;
      case 400:
        this.error = new api.Error(api.Error.BAD_REQUEST, 'Bad request!', this);
        break;
      case 401:
        if (inner.getResponseHeader('WWW-Authenticate')) {
          this.error = new api.Error(api.Error.WRONG_CREDENTIALS, 'Wrong street cred', this);
        }else {
          this.error = new api.Error(api.Error.INVALID_SIGNATURE, 'Invalid singing', this);
        }
        break;
      case 402:
      case 403:
      case 405:
      case 501:
        this.error = new api.Error(api.Error.UNAUTHORIZED, 'Not authorized to access this', this);
        break;
      case 404:
        this.error = new api.Error(api.Error.MISSING, 'Missing resource', this);
        break;
      case 406:
      // 407-410 are not likely to happen
      case 411:
      case 412:
      case 413:
      case 414:
      case 415:
      case 416:
      case 417:
        this.error = new api.Error(api.Error.SHOULD_NOT_HAPPEN, 'Should never happen', this);
        break;
      case 500:
      case 503:
        this.error = new api.Error(api.Error.SERVICE_UNAVAILABLE, 'Server is down', this);
        break;

      case 0:
        this.error = new api.Error(api.Error.UNAUTHORIZED, 'Not authorized to access this', this);
        break;
      default:
        this.error = new api.Error(api.Error.UNSPECIFIED, 'WTF?', this);
        break;
    }

    if (this.error) {
      if (failure)
        // XXX pass of data is redundant, as it attached on the detail of the error under .data
        // but roxee historically needed this
        failure(this.error);
      throw this.error;
    }

    if (success)
      success(this.data);
  };


  this.SimpleClient.prototype.query = function(method, options, headers) {
    // Inner XHR
    var inner = new this.Backend();

    // Normalize values and prepare url
    method = (method || this.GET);
    var url = options.url || this.url(options);
    if (!headers)
      headers = {};
    if (!headers.Accept)
      headers.Accept = 'application/json';

    var rescope = {
      options: options,
      method: method,
      headers: headers,
      // Set response fields
      error: null,
      data: {},
      exception: null
    };

    // Attach our callback mechanism
    inner.onreadystatechange = callback.bind(rescope);

    try {
      inner.open(method, url, true);
    }catch (e) {
      rescope.exception = e.toString();
      rescope.error = new api.Error(api.Error.OPENING_FAILED, 'Failed opening likely bogus request', rescope);
      if (options.onfailure)
        options.onfailure(rescope.error);
      throw rescope.error;
    }

    // Prepare payload if any
    var payload = options.payload;

    if (method == this.POST) {
      if (!headers['Content-Type']) {
        if (hasModern && ((payload instanceof File) || (payload instanceof Blob)))
          headers['Content-Type'] = payload.type;
        else
          headers['Content-Type'] = 'application/json';
      }

      if (headers['Content-Type'] == 'application/json') {
        try {
          payload = JSON.stringify(payload);
        }catch (e) {
          headers['Content-Type'] = 'application/octet-stream';
        }
      }
    }

    Object.keys(headers).forEach(function(i) {
      inner.setRequestHeader(i, headers[i]);
    });

    try {
      inner.send(payload);
    }catch (e) {
      rescope.exception = e.toString();
      rescope.error = new api.Error(api.Error.SEND_FAILED, 'Failed sending. Bogus payload?', rescope);
      if (options.onfailure)
        options.onfailure(rescope.error);
      throw rescope.error;
    }

    // Rescope ourselves if all went well, we might need that later on
    rescope.inner = inner;
    rescope.engine = this;
  };

  this.SimpleClient.HEAD = this.SimpleClient.prototype.HEAD = 'HEAD';
  this.SimpleClient.GET = this.SimpleClient.prototype.GET = 'GET';
  this.SimpleClient.POST = this.SimpleClient.prototype.POST = 'POST';
  this.SimpleClient.PATCH = this.SimpleClient.prototype.PATCH = 'PATCH';
  this.SimpleClient.PUT = this.SimpleClient.prototype.PUT = 'PUT';
  this.SimpleClient.DELETE = this.SimpleClient.prototype.DELETE = 'DELETE';

});

PhoneApp.pack('PhoneApp', function() {
  /*global requestAnimationFrame:true*/
  'use strict';

  var animLoopFunction,
      shouldContinue = true;

  var animLoop = function(render, element) {
    var running, lastFrame = Date.now();
    var loop = function(now) {
      if (running !== false) {
        requestAnimationFrame(loop, element);
        running = render(now - lastFrame, now);
        lastFrame = now;
      }
    };
    loop();
  };

  var Run = function(delay, callback) {
    var ref = null;

    this.start = function() {
      callback();
      ref = window.setInterval(callback, delay);
    };

    this.stop = function() {
      window.clearInterval(ref);
    };
  };

  this.Run = Run;

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
    registerHook: function(callback, scope, extra) {
      hook.push({
        callback: callback, scope: scope, extra: extra
      });
    },

    removeHook: function(callback) {
      hook = hook.filter(function(c) {
        return (callback != c.callback);
      });
    },

    stop: function() {
      shouldContinue = false;
    },

    start: function() {
      shouldContinue = true;
      animLoop(animLoopFunction);
    }
  };

  animLoopFunction = function(deltaT/*, now*/) {
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

    hook.forEach(function(h) {
      h.callback.apply(h.scope, h.extra);
    });
    renderQueue = pending;
    return shouldContinue;
  };

  this.renderLoop.start();

});

PhoneApp.pack('PhoneApp.types', function() {
  /*jshint camelcase:false, devel:true*/
  'use strict';

  var dashCache = {};

  String.prototype.dasherize = function() {
    if (!this.length)
      return '';
    return dashCache[this] || (dashCache[this] = this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
  };

  // XXX Manu: better below?
  // function dasherize(str) {
  //   return str.replace(/::/g, '/')
  //          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
  //          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
  //          .replace(/_/g, '-')
  //          .toLowerCase()
  // }

  String.prototype.replaceAt = function(index, char) {
    return this.substr(0, index) + char + this.substr(index + char.length);
  };

});

PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint maxcomplexity:11*/
  /*global cordova:false*/
  'use strict';

  this.Application = api.Object.extend({
    rootElement: $('body').get(0),
    ready: PhoneApp.K,
    autoHideSplash: false,
    device: api.Object.create({
      states: {
        BACKGROUND: 'background',
        RUNNING: 'running'
      },
      state: null,
      isIphone: false,
      isIpad: false,
      isIos: false,
      isRetina: false,
      isAndroid: false,
      isMobile: (function() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent);
      }.property())
    }),
    network: api.Object.create({
      types: window.Connection || {},
      states: {
        ONLINE: 'online',
        OFFLINE: 'offline'
      },
      type: null,
      state: null
    }),

    hideSplash: function() {
      if (this.device.isMobile && navigator.splashscreen.hide)
        navigator.splashscreen.hide();
    },

    showSplash: function() {
      if (this.device.isMobile && navigator.splashscreen.show)
        navigator.splashscreen.show();
    },

    onDeviceReady: function() {
      var platform;
      var dname;

      if (window.devicePixelRatio > 1)
        this.device.set('isRetina', true);

      if (this.device.isMobile) {
        if (window.KeyboardToolbarRemover)
          cordova.require('cordova/plugin/keyboard_toolbar_remover').hide();

        if (this.autoHideSplash)
          this.hideSplash();

        if (window.device) {
          platform = window.device.platform.toLowerCase();
          dname = window.device.name.toLowerCase();

          if (platform.indexOf('ios') !== -1)
            this.device.set('isIos', true);
          else if (platform.indexOf('android') != -1)
            this.device.set('isAndroid', true);


          if (dname.indexOf('iphone') !== -1)
            this.device.set('isIphone', true);
          else if (dname.indexOf('ipad') !== -1)
            this.device.set('isIpad', true);



          var run = new PhoneApp.Run(1000, function() {
            if (navigator.connection.type == window.Connection.NONE)
                        this.network.set('state', this.network.states.OFFLINE);

            if (navigator.connection.type != this.networkType)
                        this.network.set('type', navigator.connection.type);

          }.bind(this));
          run.start();
        }
      }

      $(this.rootElement).empty();
      this.rootView.controller = this.rootController;
      this.rootView.appendTo(this.rootElement);

      if (this.router && this.router.transitionTo)
        this.router.transitionTo('index');
    },

    bindPhoneGapEvents: function() {
      document.addEventListener('deviceready', function() {
        this.onDeviceReady();
        this.ready();
      }.bind(this), false);
      document.addEventListener('pause', function() {
        this.device.set('state', this.device.states.BACKGROUND);
        this.onPause();
      }.bind(this), false);
      document.addEventListener('resume', function() {
        this.device.set('state', this.device.states.RUNNING);
        this.onResume();
      }.bind(this), false);
      document.addEventListener('online', function() {
        this.network.set('state', this.network.states.ONLINE);
      }.bind(this), false);
      document.addEventListener('offline', function() {
        this.network.set('state', this.network.states.OFFLINE);
      }.bind(this), false);
    },

    initialize: function() {
      if (this.device.isMobile)
        this.bindPhoneGapEvents();
      else
        this.onDeviceReady();
    }
  });

});

PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  'use strict';

  var resolvePath = function(path, obj) {
    var fragments = path.split('.');
    var resolvedTree = [];

    Object.keys(fragments).forEach(function(i) {
      var fragment = fragments[i];
      var isLast = (i == (fragments.length - 1));

      //Ignore if last is index
      if (isLast && fragment == 'index')
        return;

      if (fragment in obj) {
        obj = obj[fragment];
        resolvedTree.push({ path: fragment, route: obj});
      } else {
        throw new Error('unknown path ' + path);
      }
    });

    //If node has index redirects to
    if (obj.index && obj.index.redirectsTo)
      resolvedTree.push.apply(
          resolvedTree,
          resolvePath(obj.index.redirectsTo, obj)
      );

    return resolvedTree;
  };


  var Route = {
    _childs: {},
    route: null,
    enter: PhoneApp.K,
    leave: PhoneApp.K,
    redirectsTo: null,
    connectOutlets: PhoneApp.K,
    parentRoot: null,
    setup: PhoneApp.K,

    init: function() {

      Pa.Route._super('init', this);
      if (this.setup)
        this.setup();
      for (var i in this) {
        if (api.Object.isExtensionOf(this[i], Pa.Route)) {
          this[i] = this[i].create();
          this[i].parentRoot = this;
          this._childs[i] = this[i];

        }
      }

    }
  };

  Route.toString = function() {
    return 'PhoneApp.Route';
  };

  this.Route = api.Object.extend(Route);


  var Router = {
    enableLogging: false,
    root: PhoneApp.Route,
    currentPath: '',
    controllers: {},
    leaveHook: PhoneApp.K,
    enterHook: PhoneApp.K,
    connectOutletsHook: PhoneApp.K,

    init: function() {
      Pa.Router._super('init', this);
      this.root = this.root.create();
    }
  };

  this.Router = api.Object.extend(Router);

  this.Router.toString = this.Router.prototype.toString = function() {
    return 'PhoneApp.Router';
  };

  this.Router.prototype.transitionTo = function(path, context) {
    var tree = resolvePath(path, this.root);
    var last = tree.length - 1;
    var currentPath = 'root';

    var lastRouting = [];
    if (this.currentPath)
      lastRouting = resolvePath(this.currentPath, this.root);

    var lastStep;

    tree.forEach(function(r, i) {
      currentPath += '.' + r.path;
      lastStep = lastRouting.shift();

      if (lastStep && r.path == lastStep.path) {
        //same step, do nothing here
        return;
      } else if (lastStep) {
        //different paths from here
        //pop the last routing and leave
        var pop = lastRouting.pop();
        while (pop) {
          if (pop.route.leave)
            pop.route.leave(this);
          this.leaveHook(pop.route);
          pop = lastRouting.pop();
        }

        if (lastStep.route.leave)
          lastStep.route.leave(this);
        this.leaveHook(lastStep.route);
      }

      r.route.enter(this, context);
      this.enterHook(r.route, context);

      if (i == last) {
        this.set('currentPath', currentPath.replace('root.', ''));
        this.set('currentRoute', r.route);
        r.route.connectOutlets(this, context);
        this.connectOutletsHook(r.route, context);


      }
    }, this);

  };
});


PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint devel:true*/
  'use strict';



  this.Controller = api.Object.extend({
    isController: true,
    content: null,

    connectOutlet: function(params) {
      var viewClass = params.viewClass;
      var controller = params.controller || this;
      var context = params.context || null;
      var outletName = params.outletName || 'view';

      if (controller && context)
        controller.set('content', context);

      // var oldView = this.get(outletName);
      var view = viewClass.create();
      view.set('controller', controller);
      this.set(outletName, view);
    },

    removeOutlet: function(outletName) {
      this.set(outletName, null);
    }
  });

});


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
        if (!newValue.isView) {
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
          (parent.get(property) || ' ') +
             '<script id="' + this.endNodeId + '"></script>';
    };

    this.destroy = function() {
      parent.removeObserver(property, observer);
    };

  };
});

PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint devel:true, camelcase:false, regexp:false, sub:true*/
  'use strict';

  var viewAttributeBindingNumber = 0,
      viewActionBindingNumber = 0;

  var _parsePropertyPath = function(path) {
    var split = path.split(':'),
        propertyPath = split[0],
        classNames = '',
        className,
        falsyClassName,
        splitProperty = propertyPath.split('.'),
        property = splitProperty.pop(),
        parent = splitProperty.join('.');

    if (split.length > 1) {
      className = split[1];
      if (split.length === 3) { falsyClassName = split[2]; }

      classNames = ':' + className;
      if (falsyClassName) { classNames += ':' + falsyClassName; }
    }

    return {
      path: propertyPath,
      property: property,
      parent: parent,
      classNames: classNames,
      className: (className === '') ? undefined : className,
      falsyClassName: falsyClassName
    };
  };

  var renderAttribute = function(node, attr, value) {
    if (!node)
      return;
    if (value)
      node.setAttribute(attr, value);
    else
      node.removeAttribute(attr);
  };

  this.View = api.Object.extend({
    template: null,
    templateName: null,
    controller: null,

    classNames: null,

    attributeBindings: null,
    classNameBindings: null,
    attributes: null,

    willInsertElement: PhoneApp.K,
    didInsertElement: PhoneApp.K,
    willDestroyElement: PhoneApp.K,

    isView: true,

    tagName: 'div',
    element: null,

    elementId: null,
    _parentView: null,
    _childViews: null,
    _compiledTpl: null,
    _isDestroying: false,
    _meta_observers: null,
    _metamorphs: null,

    init: function() {
      /*jshint camelcase:false*/
      PhoneApp.View._super('init', this);

      this.elementId = 'phoneapp' + this.__id__;

      PhoneApp.View.views[this.elementId] = this;
      this._childViews = [];

      if (!this.attributeBindings)
        this.attributeBindings = [];

      if (!this.classNameBindings)
        this.classNameBindings = [];
      else if (typeof(this.classNameBindings) == 'string')
        this.classNameBindings = this.classNameBindings.split(/\s+/);

      if (!this.classNames)
        this.classNames = [];
      else if (typeof(this.classNames) == 'string')
        this.classNames = this.classNames.split(' ');

      if (!this.attributes)
        this.attributes = [];

      this._meta_observers = [];
      this._metamorphs = [];

      var tpl = null;

      if (this.template) {
        tpl = this.template;
      } else if (this.templateName) {
        tpl = PhoneApp.TEMPLATES[this.templateName];
        if (!tpl)
          throw new Error('unknown template : ' + this.templateName);
      }

      this._compiledTpl = tpl || PhoneApp.K;
    },

    context: function() {
      var controller = this.controller;

      //XXX return this._parentView.context ?
      if (!controller && this._parentView && this._parentView.controller)
        controller = this._parentView.controller;
      var context = {};
      PhoneApp.ENV.HANDLEBARS_EXPOSE_OBJECTS.forEach(function(i) {
        context[i] = window[i];
      });

      context.controller = controller;
      context.view = this;
      return context;

    }.property('controller'),

    $: function(sel) {
      return sel ? $(this.element).find(sel) : $(this.element);
    },


    appendTo: function(parentNode) {
      this.willInsertElement();
      var node = this.render();
      $(node).appendTo(parentNode);
      this.didInsertElement();
    },

    insertChildAt: function(view, position) {
      var insertedBefore = !!view.element;

      if (!insertedBefore)
        view.willInsertElement();

      PhoneApp.renderLoop.schedule(function() {
        this.element.insertBefore((view.element || view.render()), this.element.children[position]);

        if (!insertedBefore)
          view.didInsertElement();
      }, this);
      view._parentView = this;
      this._childViews.insertAt(position, view);
      return view;
    },

    appendChild: function(view) {
      view.willInsertElement();
      PhoneApp.renderLoop.add(view, 'render', function() {
        this.didInsertElement();
      });
      view._parentView = this;
      this._childViews.push(view);
      return view;
    },

    rerender: function() {
      this._metamorphs.forEach(function(m) {
        m.destroy();
      });

      return Pa.renderLoop.schedule(function() {
        this.render(this.element);
      }, this);
    },

    renderWrapper: function() {
      var attributes = [],
          staticClass = '',
          node;

      this.attributeBindings.forEach(function(attr) {
        var value = attr;

        if (attr.indexOf(':') > -1) {
          attr = attr.split(':');
          value = attr.pop();
          attr = attr.pop();
        }
        attributes.push({attribute: attr, value: value});
      }, this);

      staticClass = this.classNames.join(' ');

      if (this.classNameBindings)
        attributes.push({attribute: 'class', value: this.classNameBindings});

      attributes = this._computeAttributesBindings(attributes);

      if (staticClass)
        attributes['class'] += ' ' + staticClass;

      node = document.createElement(this.tagName);

      this.attributes.forEach(function(attr) {
        if (!attr)
          return;

        var infos = attr.split('=');
        node.setAttribute(infos.shift(), infos.shift());
      });
      Object.keys(attributes).forEach(function(attr) {
        if (!attributes[attr])
          return;

        node.setAttribute(attr, attributes[attr]);
      });

      node.setAttribute('id', this.elementId);
      return node;
    },

    render: function(wrapper) {
      if (this._isDestroying)
        throw new Error('Trying to render a destroyed view');

      if (!wrapper)
        wrapper = this.renderWrapper();

      this.element = wrapper;
      this.element.innerHTML = this._compiledTpl(this.context) || '';

      return this.element;
    },

    _computeAttributesBindings: function(attributes, bindingId) {
      var gA = {};
      gA['class'] = '';
      gA['style'] = '';
      var view = this;

      attributes.forEach(function(binding) {
        var currentAttribute = binding.attribute,
            currentValue = binding.value,
            currentId = bindingId ? '[data-phoneapp-binding="' + bindingId + '"]' : null,
            node;


        if (currentAttribute == 'class') {

          if (typeof(currentValue) == 'string')
            currentValue = currentValue.split(/\s+/);

          currentValue.forEach(function(attr) {
            var infos = _parsePropertyPath(attr),
                observer;


            if (infos.parent.indexOf('view') === 0) {
              infos.parent = infos.parent.replace(/view(.)?/, '');
              infos.path = infos.path.replace(/view(.)?/, '');
              attr = infos.path;
            }

            if (!infos.path && infos.className) {
              gA['class'] += ' ' + infos.className;
              return;
            }



            infos.parent = infos.parent ? this.get(infos.parent) : this;

            observer = function(attr, old, newValue, justCompute) {
              if (view._isDestroying)
                return;

              if (!node && !justCompute)
                node = (!currentId) ?
                    view.element :
                    view.element.querySelector(currentId);

              if (node)
                gA['class'] = node.getAttribute('class') || '';

              var type = typeof(newValue);
              if (type == 'boolean' || type == 'number') {
                if (!infos.className)
                  infos.className = infos.property.dasherize();
                gA['class'] = gA['class'].replace(infos.className, '')
                                         .replace(infos.falsyClassName, '');

                if (newValue)
                  gA['class'] += ' ' + infos.className;
                else if (infos.falsyClassName)
                  gA['class'] += ' ' + infos.falsyClassName;

              } else if (type == 'string') {
                gA['class'] = gA['class'].replace(old, newValue);
              }

              if (justCompute)
                return;

              Pa.renderLoop.schedule(
                  renderAttribute, view, [node, 'class', gA['class']]
              );


            };


            observer(infos.property, '', this.get(infos.path), true);

            this._meta_observers.push({
              parent: infos.parent,
              property: infos.property,
              callback: observer
            });
            infos.parent.addObserver(infos.property, observer);


          }, this);

        } else if (currentAttribute == 'style') {
          if (typeof(currentValue) == 'string')
            currentValue = currentValue.split(/\s+/);

          currentValue.forEach(function(attr) {
            var infos = _parsePropertyPath(attr),
                observer;

            infos.styleName = infos.className;
            infos.styleValue = infos.falsyClassName;
            infos.isBinding = (infos.styleValue.indexOf('{{this}}') != -1);
            if (!infos.path && !infos.isBinding) {
              gA.style += ' ' + infos.styleName + ':' + infos.styleValue;
              return;
            }

            infos.parent = infos.parent ? this.get(infos.parent) : this;

            observer = function(attr, old, newValue, justCompute) {
              if (view._isDestroying)
                return;

              if (!node && !justCompute)
                node = (!currentId) ?
                    view.element :
                    view.element.querySelector(currentId);

              if (node)
                gA.style = node.getAttribute('style');

              var styles = {};
              (gA.style || '').split(';').forEach(function(i) {
                if (!i)
                  return;
                var s = i.split(':'); styles[s.shift().trim()] = s.shift();
              });

              if (newValue)
                styles[infos.styleName.trim()] = infos.styleValue.replace('{{this}}', newValue);
              else
                delete styles[infos.styleName.trim()];


              gA.style = '';
              Object.keys(styles).forEach(function(k) {
                gA.style += k + ':' + styles[k] + ';';
              });

              if (justCompute)
                return;


              Pa.renderLoop.schedule(
                  renderAttribute, view, [node, 'style', gA.style]
              );


            };
            observer(infos.property, '', this.get(infos.path), true);

            this._meta_observers.push({
              parent: infos.parent,
              property: infos.property,
              callback: observer
            });
            infos.parent.addObserver(infos.property, observer);


          }, this);
        } else {
          var split = currentValue.split('.'),
              property = split.pop(),
              observes = split.join('.'),
              observer;

          if (observes.indexOf('view') === 0) {
            observes = observes.replace(/view(.)?/, '');
            currentValue = currentValue.replace(/view(.)?/, '');
          }

          observes = observes ? this.get(observes) : this;

          observer = function(attr, old, newValue, justCompute) {
            if (view._isDestroying)
              return;

            if (gA[currentAttribute] == newValue)
              return;

            gA[currentAttribute] = newValue;

            if (justCompute)
              return;

            if (!node)
              node = (!currentId) ?
                  view.element :
                  view.element.querySelector(currentId);

            Pa.renderLoop.schedule(
                renderAttribute, view, [node, currentAttribute, gA[currentAttribute]]
            );
          };

          observer(property, '', this.get(currentValue), true);
          this._meta_observers.push({
            parent: observes,
            property: property,
            callback: observer
          });
          observes.addObserver(property, observer);
        }



      }, this);

      return gA;

    },

    _addAction: function(on, callback, context, scope) {
      var id = ++viewActionBindingNumber;
      var selector = '[data-phoneapp-action="' + id + '"]';
      $(this.element).on(on, selector, function(e) {
        e.context = context;
        callback.call(scope, e);
      }.bind(this));
      return 'data-phoneapp-action=' + id;
    },

    _addAttributeBindings: function(params) {

      var currentId = ++viewAttributeBindingNumber,
          attributes;

      attributes = this._computeAttributesBindings(params, currentId);

      var boostrap = 'data-phoneapp-binding=' + currentId;
      Object.keys(attributes).forEach(function(attr) {
        if (!attributes[attr])
          return;

        boostrap += ' ' + attr + '="' + attributes[attr] + '"';
      });
      return boostrap;
    },

    _addMetamorph: function(parent, property) {
      var m = new PhoneApp.Metamorph(this, parent, property);
      this._metamorphs.push(m);
      return m;
    },


    destroy: function() {
      this.willDestroyElement();
      this._isDestroying = true;

      this._meta_observers.forEach(function(obs) {
        obs.parent.removeObserver(obs.property, obs.callback);
      });

      this._metamorphs.forEach(function(m) {
        m.destroy();
      });

      //remove myself from my parent if my parent isn't destroying himsself
      if (this._parentView && !this._parentView._isDestroying)
        this._parentView._childViews.removeObject(this);

      //remove dom listeners
      this.$().off();

      //Parent has already destroyed dom element
      if (this._parentView && this._parentView._isDestroying) {
        this._destroyElement();
      } else {
        PhoneApp.renderLoop.add(this, 'destroy', this._destroyElement);
      }
    },

    _destroyElement: function() {
      delete PhoneApp.View.views[this.elementId];

      //remove my childs
      this._childViews.forEach(function(v) {
        v.destroy();
      });

      PhoneApp.View._super('destroy', this);
    }
  });

  this.View.views = {};

});


PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(/*api*/) {
  'use strict';

  this.CollectionView = this.View.extend({
    content: null,
    itemViewClass: Pa.View,
    _childTemplate: null,
    _domTree: null,
    _replaceTree: null,

    init: function() {
      PhoneApp.CollectionView._super('init', this);
      this._replaceTree = {};
    },

    didInsertElement: function() {
      if (!this.content)
        return;

      if (this.content.content.length)
        this._domController(0, this.content.content, []);

      this._domController = this._domController.bind(this);
      this.content.content.addArrayObserver(this._domController);

      this.addObserver('content', function(key, old, newArray) {
        old.content.removeArrayObserver(this._domController);
        newArray.content.addArrayObserver(this._domController);
      });
    },

    _domController: function(index, added, removed) {
      // var childNodes = this.element.children;

      added.forEach(function(item, addedIndex) {
        var realIndex = index + addedIndex;
        var viewClass;

        if (realIndex in this._replaceTree) {
          viewClass = this._replaceTree[realIndex];
          delete this._replaceTree[realIndex];
        } else {
          viewClass = this.itemViewClass.create({
            tagName: 'li'
          });
          viewClass._compiledTpl = this._childTemplate;
          viewClass.controller = this.controller;
          viewClass.content = item;
        }
        this.insertChildAt(viewClass, realIndex);
      }, this);

      removed.forEach(function(item) {
        // var node = childNodes[index];
        // if (!node) {
        //   console.error('Collection trying to remove a dom node that does not exists', index, item);
        //   return;
        // }

        var nextPosition = this.content.content.indexOf(item);
        if (nextPosition == -1) {
          this._childViews[index].destroy();
        } else {
          this._replaceTree[nextPosition] = this._childViews.removeAt(index)[0];
        }

      }, this);
    },

    willDestroyElement: function() {
      if (this.content && this.content.content)
        this.content.content.removeArrayObserver(this._domController);
    }
  });
});

PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(/*api*/) {
  'use strict';

  var setTansform = function(el, translate, transition) {
    var style = el.style;

    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration =
        style.OTransitionDuration = style.transitionDuration = transition + 'ms';
    //XXX webkit black magic. Translate3d changes the flow and follow the scroll position
    style.MozTransform = style.webkitTransform = 'translate3d(0,' + translate + 'px,0)';
    style.msTransform = style.OTransform = 'translateX(' + translate + 'px)';
  };

  var setTansformAllChildren = function(parent, translate, transition) {
    var nodes = parent.children;
    var childNode;
    for (var i = 0; i < nodes.length; i++) {
      childNode = nodes[i];
      setTansform(childNode, translate, transition);
    }
  };



  var tapToTop = function(scrollableElement) {
    var currentOffset = scrollableElement.scrollTop;
    var nodes = scrollableElement.children;
    var onAnimationEnd = function() {
      // Animation is complete, swap transform with
      // change in scrollTop after removing transition.
      this.style.webkitTransition = '-webkit-transform 0s ease-out';
      this.style.webkitTransform =
          'translate3d(0,0,0)';
      scrollableElement.scrollTop = 0;

      this.removeEventListener('webkitTransitionEnd', onAnimationEnd);
    };

    for (var i = 0; i < nodes.length; i++) {
      // Animate to position 0 with a transform.
      nodes[i].style.webkitTransition =
          '-webkit-transform 300ms ease-out';
      nodes[i].addEventListener(
          'webkitTransitionEnd', onAnimationEnd, false);
      nodes[i].style.webkitTransform =
          'translate3d(0, ' + (currentOffset) + 'px,0)';
    }
  };



  this.ScrollableView = this.View.extend({
    offsetPullToRefresh: 50,
    isScrolling: false,
    isLoading: false,
    scrollableSeclector: '.scrollable',

    didInsertElement: function() {
      var scrollable = this.element.querySelector(this.scrollableSeclector);
      var pull = scrollable.querySelector('.pull-to-refresh');

      setTansformAllChildren(scrollable, 0, 0);

      document.addEventListener('taptotop', this.scrollToTop);

      this.$().on('touchmove', function(e) {

        // ensure swiping with one touch and not pinching
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;

        Pa.renderLoop.schedule(function() {
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

      this.$().on('touchend', function(/*e*/) {
        if (!this.isActivated || this.isLoading)
          return true;
        Pa.renderLoop.schedule(function() {
          var top = scrollable.scrollTop;

          if (top >= 0)
            return true;

          $(pull).removeClass('drop-to-refresh');

          if (top > -this.offsetPullToRefresh)
            return true;

          pull.style.webkitTransitionDuration = 0;
          setTansformAllChildren(scrollable, this.offsetPullToRefresh, 200);

          $(pull).addClass('loading');
          this.set('isActivated', false);
          this.set('isLoading', true);

          // window.setTimeout(function() {
          //   this.set('isLoading', false);
          //   //XXX smooth loading slide out
          //   setTansformAllChildren(scrollable, 0, 0);
          //   $(pull).removeClass('loading');
          // }.bind(this), 2000);
        }, this);
        //XXX send refresh event to collection controllers ???
        // if (self.content.refresh) {
        //   this.set('isLoading', true);
        //   this.content.refresh(didRefreshed);
        // }
      }.bind(this));

      this.addObserver('isLoading', function() {
        if (this.isLoading)
          return;

        //XXX smooth loading slide out
        setTansformAllChildren(scrollable, 0, 0);
        $(pull).removeClass('loading');
      }.bind(this));
    },

    scrollToTop: function() {
      tapToTop(this.element);
    },

    willDestroyElement: function() {
      this.$().off();
      document.removeEventListener('taptotop', this.scrollToTop);
    }
  });

});

/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

(function() {
  /*jshint maxcomplexity:11*/
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
    this.isSliding = false;
    this.lockSlide = false;



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
      if (this.lockSlide)
        return;

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
      if (this.lockSlide)
        return;
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

        if (progress > -5 && progress < this.foldedPosition + 5) {
          this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' +
              (this.deltaX < 0 ? 0 : this.deltaX) + 'px,0,0)';
          this.isSliding = true;
        }
        e.stopPropagation();

        if (e.stopImmediatePropagation)
          e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }



    },

    onTouchEnd: function(e) {
      if (this.lockSlide)
        return;

      this.locked = undefined;
      this.direction = 0;
      this.isScrolling = undefined;

      // if not scrolling vertically
      if (!this.isScrolling) {
        // call slide function with slide end value based on isValidSlide and isPastBounds tests
        this.slide();
      }

      if (this.isSliding) {
        e.stopPropagation();
        if (e.stopImmediatePropagation)
          e.stopImmediatePropagation();
        e.preventDefault();
      }
      this.isSliding = false;

    }

  };
})();

(function() {
  'use strict';
  Handlebars.registerHelper('action', function(path, context, options) {
    var scope = null;

    if (!options && context.hash) {
      options = context;
      context = this;
    }

    if (typeof(path) == 'string') {
      var infos = path.split('.');
      var first = infos[0] || '';

      if (first === 'view') {
        infos.shift();
        path = this.view.get(infos.join('.'));
        infos.pop();
        infos = infos.join('.');
        scope = infos ? this.view.get(infos) : this.view;
      } else if (first == 'controller') {
        infos.shift();
        path = this.controller.get(infos.join('.'));
        infos.pop();
        infos = infos.join('.');
        scope = infos ? this.controller.get(infos) : this.controller;
      } else {
        path = Pa.get(path);
        infos.pop();
        scope = Pa.get(infos.join('.'));
      }
    }

    return new Handlebars.SafeString(
        this.view._addAction(options.hash.on, path, context, scope)
    );
  });

})();

(function() {
  'use strict';

  Handlebars.registerHelper('bindAttr', function(options) {
    var params = [];

    Object.keys(options.hash).forEach(function(name) {
      params.push({attribute: name, value: options.hash[name]});
    });
    return new Handlebars.SafeString(this.view._addAttributeBindings(params));

  });

  Handlebars.registerHelper('bind', function(path) {
    var view = this.view;

    var infos = path.split('.');
    var property = infos.pop();

    if (infos.indexOf('view') === 0)
      infos.shift();

    var parent = infos.join('.');
    parent = parent ? view.get(parent) : view;

    var m = this.view._addMetamorph(parent, property);
    return new Handlebars.SafeString(m.renderWrapper());
  });
})();

(function() {
  'use strict';

  Handlebars.registerHelper('collection', function(path, options) {
    if (arguments.length == 1) {
      options = path;
      path = Pa.CollectionView;
    }



    var overload = {};
    var currentView = null;
    var newView;


    var bindToView = null;


    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    if (options.fn)
      overload._childTemplate = options.fn;

    Object.keys(options.hash).forEach(function(k) {
      overload[k] = options.hash[k];
    });

    if (!overload.controller)
      overload.controller = this.controller;

    if (!path.apply)
      throw new Error('collection view is already instantiated');

    if (overload.bindToView) {
      bindToView = overload.bindToView;
      delete overload.bindToView;
    }

    newView = path.create(overload);

    //XXX clear bindToView when destroying newView
    if (bindToView)
      currentView.set(bindToView, newView);


    currentView.appendChild(newView);

    return new Handlebars.SafeString(newView.renderWrapper().outerHTML);
  });

})();

(function() {
  'use strict';

  Handlebars.registerHelper('outlet', function(path, options) {
    var outletName = 'view';

    if (typeof(path) == 'string')
      outletName = path;

    if (path.fn || (options && options.fn))
      throw new Error('Outlet can not be a block');

    var currentView = null;

    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    this.controller.set('view', null);

    var m = currentView._addMetamorph(this.controller, outletName);
    return new Handlebars.SafeString(m.renderWrapper());

  });
})();

(function() {
  /*jshint camelcase:false*/
  /*global Handlebars:true*/
  'use strict';

  Handlebars.registerHelper('view', function(path, options) {
    if (!path)
      throw new Error('Unknown view');


    var overload = {};
    var currentView = null;
    var bindToView = null;


    currentView = this.view;

    if (!currentView.isView)
      throw new Error('currentView is not a view :)');

    if (options.fn)
      overload.template = options.fn;

    Object.keys(options.hash).forEach(function(k) {
      overload[k] = options.hash[k];
    });

    if (!overload.controller)
      overload.controller = this.controller;


    if (overload.bindToView) {
      bindToView = overload.bindToView;
      delete overload.bindToView;
    }


    var newView = path.create(overload);
    //XXX clear bindToView when destroying newView
    if (bindToView)
      currentView.set(bindToView, newView);


    currentView.appendChild(newView);

    return new Handlebars.SafeString(newView.renderWrapper().outerHTML);
  });

})();

