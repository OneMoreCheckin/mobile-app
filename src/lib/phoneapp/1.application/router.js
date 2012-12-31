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
    redirectsTo: null,
    connectOutlets: PhoneApp.K,
    parentRoot: null,

    init: function() {

      Pa.Route._super('init', this);

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
    currentPath: null,
    controllers: {},

    init: function() {
      Pa.Router._super('init', this);
      this.root = this.root.create();
    }
  };

  Router.toString = function() {
    return 'PhoneApp.Router';
  };

  this.Router = api.Object.extend(Router);

  this.Router.prototype.transitionTo = function(path, context) {
    var tree = resolvePath(path, this.root);
    var last = tree.length - 1;
    var currentPath = 'root';

    tree.forEach(function(r, i) {
      currentPath += '.' + r.path;
      r.route.enter(this, context);

      if (i == last) {
        this.set('currentPath', currentPath);
        r.route.connectOutlets(this, context);
      }
    }, this);

  };
});

