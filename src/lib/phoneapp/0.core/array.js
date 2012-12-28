PhoneApp.pack('PhoneApp.types', function() {
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

  Array.prototype.swap = function(i, j) {
    if (i == j)
      return;
    var tmp = this[i];
    tmp = this.replace(j, 1, tmp);
    this.replace(i, 1, tmp);
  };

  Array.prototype.quickSort = function(compare, left, right) {
    if (left >= right)
      return;
    this.swap(left, Math.floor((left + right) / 2));
    var i;
    var last = left;
    for (i = left + 1; i <= right; i++)
      if (compare(this[i], this[left]) < 0)
        this.swap(++last, i);
      this.swap(left, last);
    this.quickSort(compare, left, last - 1);
    this.quickSort(compare, last + 1, right);
    return this;
  };

  this.ArrayController = function() {
    var arr = false;
    var c = false;
    var m = false;
    var s = [];

    var filter = function() {
      return true;
    };

    var map = function(item) {
      return item;
    };

    var sort = function(a, b) {
      return (a < b) ? -1 : (a == b ? 0 : 1);
    };

    Object.defineProperty(this, 'content', {
      enumerable: true,
      get: function() {
        return s;
      },
      set: function(a) {
        if (arr)
          arr.removeArrayObserver(obs);
        arr = a;
        a.addArrayObserver(obs);
        c = a.filter(filter);
        m = c.map(map);
        s = m.filter(function() {return true;});
        s.sort(sort);
      }
    });

    var obs = function(index, added, removed) {
      removed.forEach(function(item) {
        var needle = c.indexOf(item, index);
        if (needle != -1) {
          c.splice(needle, 1);
          item = m.splice(needle, 1);
          needle = s.indexOf(item);
          s.replace(needle, 1);
        }
      });

      added.forEach(function(item) {
        if (filter(item)) {
          c.splice(index, 0, item);
          item = map(item);
          m.splice(index, 0, item);
          var needle;
          s.some(function(sub, idx) {
            needle = idx;
            return sort(sub, item) >= 0;
          });
          s.replace(needle, 0, item);
        }
      });
    };

    this.destroy = function() {
      arr.removeArrayObserver(obs);
      arr = false;
      c = false;
      m = false;
      s = false;
    };

    Object.defineProperty(this, 'filter', {
      get: function() {
        return filter;
      },
      set: function(callback) {
        filter = callback;
        if (arr) {
          c = arr.filter(filter);
          m = c.map(map);
          s = m.filter(function() {return true;});
          s.quickSort(sort, 0, s.length);
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
          s = m.filter(function() {return true;});
          s.quickSort(sort, 0, s.length);
        }
      }
    });

    Object.defineProperty(this, 'sort', {
      get: function() {
        return sort;
      },
      set: function(callback) {
        sort = callback;
        if (arr)
          s.quickSort(sort, 0, s.length);
      }
    });
  };

  PhoneApp.ArrayController = this.ArrayController;
});




// var t = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// t.addArrayObserver(function(index, add, remove){
//   console.warn('->change at index ', index, ' added ', add, ' removed ', remove);
// });

// t.quickSort(function(a, b){
//   return (a < b) ? -1 : (a == b ? 0 : 1);
// }, 0, t.length);
