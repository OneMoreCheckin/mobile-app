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
      if(options.host)
        host = options.host;
      if(options.port)
        port = options.port;
      if(options.scheme)
        scheme = options.scheme + ':';
      if(options.version)
        version = options.version;
      if(options.backend)
        Backend = options.backend;
    };

    Object.defineProperty(this, 'Backend', {
      get: function(){
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
    if(!inner){
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

    if(this.error){
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
    if(!headers.Accept)
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
      if(options.onfailure)
        options.onfailure(rescope.error);
      throw rescope.error;
    }

    // Prepare payload if any
    var payload = options.payload;

    if (method == this.POST) {
      if(!headers['Content-Type']){
        if (hasModern && ((payload instanceof File) || (payload instanceof Blob)))
          headers['Content-Type'] = payload.type;
        else
          headers['Content-Type'] = 'application/json';
      }

      if(headers['Content-Type'] == 'application/json') {
        try{
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
      if(options.onfailure)
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
