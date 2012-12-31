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
