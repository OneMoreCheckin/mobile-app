// With the exception of native xhr vs mingus xhr
// and the rescope of host/port/version
// removal of XUID reading
// this is unaltered from jsboot

PhoneApp.add(XMLHttpRequest).as('XMLHttpRequest');
PhoneApp.use('PhoneApp.service.Error');
PhoneApp.pack('PhoneApp.service', function(api) {
  /*global File, DOMParser, Blob*/
  'use strict';

  this.SimpleClient = function() {
    var host;
    var port;
    var version;
    var scheme;
    var userId;

    Object.defineProperty(this, 'userId', {
      get: function() {
        return userId;
      },
      set: function(v) {
        userId = v;
      }
    });

    Object.defineProperty(this, 'hostPort', {
      get: function() {
        return host + (port ? ':' + port : '');
      }
    });

    Object.defineProperty(this, 'version', {
      get: function() {
        return version;
      }
    });

    this.configure = function(h, p, v, s) {
      host = h;
      port = p;
      scheme = s || '';
      version = v;
      userId = null;
    };

    this.url = function(options) {
      // XXX use an IRL object instead of that crap
      var url = scheme + '//' + host + (port ? ':' + port : '') + '/' + version;
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
      if (options.params)
        Object.keys(options.params).forEach(function(i) {
          query.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.params[i]));
        });

      if (query.length)
        url += '?' + query.join('&');

      return url;
    };

  };

  var callback = function() {
    /*jshint maxcomplexity: 40*/
    // Free stuff
    var inner = this.inner;
    var failure = this.onfailure;
    var success = this.onsuccess;
    var restart = this.restart;

    if (inner.readyState == inner.FAILED_OPENING) {
      // options.error = new err(err.UNAUTHORIZED);
      // Clean-up
      this.onsuccess = this.onfailure = this.inner = this.restart = inner.onreadystatechange = null;
      this.error = new api.Error(api.Error.UNAUTHORIZED, 'Not authorized to access this', this);
      if (failure)
        failure(this.error);
      return;
    }

    // Ignore all-these
    if (inner.readyState != inner.DONE)
      return;

    // Clean-up now for good
    this.onsuccess = this.onfailure = this.inner = this.restart = inner.onreadystatechange = null;

    try {
      this.data = {};
      if (inner.responseText) {
        this.data = JSON.parse(inner.responseText);
      }
    }catch (e) {
      try {
        var parser = new DOMParser();
        this.data = parser.parseFromString(inner.responseText, 'application/xml');
      }catch (e2) {
        this.error = new api.Error(api.Error.MEANINGLESS_DATA, 'WHAT? ALBATROS?', this);
      }
      this.data.responseText = inner.responseText;
    }

    switch (inner.status) {
      case 200:
      case 201:
        break;
      case 308:
        this.id = null;
        this.params = {};
        this.url = inner.getResponseHeader('Location');
        restart.engine.query(restart.GET, this, restart.headers);
        return;
      case 400:
        this.error = new api.Error(api.Error.BAD_REQUEST, 'Bad request!', this);
        var errorInfo = {code: 100, error: 'GENERIC_ERROR'};
        try {
          errorInfo = JSON.parse(inner.responseText);
        }catch (e) {
        }
        this.data = errorInfo;
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

    if (success && !this.error)
      success(this.data);
    // XXX Roxee depends on this old API
    if (failure && this.error)
      failure(this.error, this.data);
  };


  this.SimpleClient.prototype.query = function(method, options, headers) {
    // Default method
    method = (method || this.GET);
    var url = options.url || this.url(options);

    // If no headers are provided, set Accept to app/json
    if (!headers)
      headers = {};
    headers.Accept = 'application/json';
    // Add our signature here - XXX shit
    // XXX doesn't work with foursquare API...
    // headers['X-IID'] = 'web';

    // Inner XHR
    var inner = new api.XMLHttpRequest();
    // Reference the inner xhr and other useful objects to possibly restart
    options.inner = inner;

    // Set response fields
    options.error = null;
    options.data = null;

    // Attach our callback mech
    inner.onreadystatechange = callback.bind(options);

    try {
      inner.open(method, url, true);
    }catch (e) {
      options.exception = e.toString();
      throw new api.Error(api.Error.OPENING_FAILED, 'Failed opening likely bogus request', options);
    }

    // Prepare payload if any
    var payload = options.payload;

    if (method == this.POST) {
      if ((typeof File != 'undefined') && (typeof Blob != 'undefined') && ((payload instanceof File) ||
          (payload instanceof Blob))) {
        headers['Content-Type'] = payload.type;
      }else {
        try {
          if (!('Content-Type' in headers) || (headers['Content-Type'] == 'application/json')) {
            payload = JSON.stringify(payload);
            headers['Content-Type'] = 'application/json';
          }
        }catch (e) {
          if (!('Content-Type' in headers))
            headers['Content-Type'] = 'image/jpeg';
        }
      }
    }

    Object.keys(headers).forEach(function(i) {
      inner.setRequestHeader(i, headers[i]);
    });

    // For restarters
    options.restart = {
      engine: this,
      method: method,
      headers: headers
    };

    try {
      inner.send(payload);
    }catch (e) {
      options.exception = e;
      throw new api.Error(api.Error.SEND_FAILED, 'Failed sending. Bogus payload?', options);
    }
  };

  this.SimpleClient.HEAD = this.SimpleClient.prototype.HEAD = 'HEAD';
  this.SimpleClient.GET = this.SimpleClient.prototype.GET = 'GET';
  this.SimpleClient.POST = this.SimpleClient.prototype.POST = 'POST';
  this.SimpleClient.PATCH = this.SimpleClient.prototype.PATCH = 'PATCH';
  this.SimpleClient.PUT = this.SimpleClient.prototype.PUT = 'PUT';
  this.SimpleClient.DELETE = this.SimpleClient.prototype.DELETE = 'DELETE';

});
