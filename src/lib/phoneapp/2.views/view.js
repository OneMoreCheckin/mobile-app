PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {
  /*jshint devel:true*/
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
    node.setAttribute(attr, value);
  };

  this.View = api.Object.extend({
    template: null,
    templateName: null,
    controller: null,

    classNames: null,

    attributeBindings: null,
    classNameBindings: null,

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

    context: function() {
      var controller = null;
      if (this.controller)
        controller = this.controller;

      //XXX return this._parentView.context ?
      if (this._parentView && this._parentView.controller)
        controller = this._parentView.controller;
      var context = {};
      PhoneApp.ENV.HANDLEBARS_EXPOSE_OBJECTS.forEach(function(i) {
        context[i] = window[i];
      });

      context.controller = controller;
      context.view = this;

      context.get = (function(key) {
        var path = key.split('.');
        if (path[0] == 'view')
          path.shift();

        return this.get(path.join('.'));
      }.bind(this));

      return context;

    }.property('controller'),


    init: function() {
      /*jshint camelcase:false*/
      PhoneApp.View._super('init', this);

      this.elementId = 'phoneapp' + this.__id__;
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

    $: function(sel) {
      return sel ? $(this.element).find(sel) : $(this.element);
    },

    appendTo: function(parentNode) {
      this.willInsertElement();
      var node = this.render();
      $(node).appendTo(parentNode);
      this.didInsertElement();
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
      return Pa.renderLoop.schedule(function() {
        this.render(this.element);
      }, this);
    },

    renderWrapper: function() {
      var attributes = [],
          staticClass = '',
          node;

      this.attributeBindings.forEach(function(attr) {
        attributes.push({attribute: attr, value: attr});
      }, this);

      staticClass = this.classNames.join(' ');

      if (this.classNameBindings)
        attributes.push({attribute: 'class', value: this.classNameBindings});

      attributes = this._computeAttributesBindings(attributes);

      if (staticClass)
        attributes['class'] += staticClass;

      node = document.createElement(this.tagName);

      Object.keys(attributes).forEach(function(attr) {
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
      var gA = {class: '', style: ''},
          view = this;

      attributes.forEach(function(binding) {
        var currentAttribute = binding.attribute,
            currentValue = binding.value,
            currentId = '[data-phoneapp-binding="' + bindingId + '"]',
            node,
            lastClassNames;


        if (currentAttribute == 'class') {

          if (typeof(currentValue) == 'string')
            currentValue = currentValue.split(/\s+/);

          currentValue.forEach(function(attr) {
            var infos = _parsePropertyPath(attr),
                observer;

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
                gA['class'] = node.getAttribute('class');

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
              gA['style'] += ' ' + infos.styleName+':'+infos.styleValue;
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
                gA['style'] = node.getAttribute('style');

              var styles = {};
              gA['style'].split(';').forEach(function(i) {
                if (!i)
                  return;
                var s = i.split(':'); styles[s.shift().trim()]= s.shift()
              });

              if (newValue)
                styles[infos.styleName.trim()] = infos.styleValue.replace('{{this}}', newValue);
              else
                delete styles[infos.styleName.trim()];


              gA['style'] = '';
              Object.keys(styles).forEach(function(k) {
                gA['style'] += k+':'+styles[k]+';';
              });

              if (justCompute)
                return;


              Pa.renderLoop.schedule(
                  renderAttribute, view, [node, 'style', gA['style']]
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

          observes = observes ? this.get(observes) : this;

          observer = function(attr, old, newValue, justCompute) {
            if (view._isDestroying)
              return;

            if (gA[property] == newValue)
              return;

            gA[property] = newValue;

            if (justCompute)
              return;

            if (!node)
              node = (!currentId) ?
                  view.element :
                  view.element.querySelector(currentId);

            Pa.renderLoop.schedule(
                renderAttribute, view, [node, property, gA[property]]
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

    _addAction: function(on, callback, context) {
      var id = ++viewActionBindingNumber;
      var selector = '[data-phoneapp-action="' + id + '"]';
      $(this.element).on(on, selector, function(e) {
        e.context = context;
        callback.call(this, e);
      }.bind(this));
      return 'data-phoneapp-action=' + id;
    },

    _addAttributeBindings: function(params) {

      var currentId = ++viewAttributeBindingNumber,
          attributes;

      attributes = this._computeAttributesBindings(params, currentId);

      var boostrap = 'data-phoneapp-binding=' + currentId;
      Object.keys(attributes).forEach(function(attr) {
        boostrap += ' ' + attr + '="' + attributes[attr] + '"';
      });
      return boostrap;
    },

    _addMetamorph: function (property) {
      var m = new PhoneApp.Metamorph(property);
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

      //Parent has already destroyed dom element
      if (this._parentView && this._parentView._isDestroying) {
        this._destroyElement();
      } else {
        PhoneApp.renderLoop.add(this, 'destroy', this._destroyElement);
      }
    },

    _destroyElement: function() {
      //remove my childs
      this._childViews.forEach(function(v) {
        v.destroy();
      });

      //remove myself from my parent if my parent isn't destroying himsself
      if (this._parentView && !this._parentView._isDestroying)
        this._parentView._childViews.removeObject(this);

      //remove dom listeners
      $(this.element).off();
      PhoneApp.View._super('destroy', this);
    }
  });

});

