(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['application'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, escapeExpression=this.escapeExpression;


  buffer += "<div id=\"splash\">\n  <div id=\"splash-logo\"></div>\n  <button id=\"splash-connect\" type=\"button\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.login", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Connect to Foursquare</button>\n  <div id=\"splash-message\" class=\"retry\">\n    <div class=\"front\">\n      <span class=\"title\">Network Error</span>\n      <span class=\"description\">Please check<br /> your connection</span>\n    </div>\n    <span class=\"back\">\n      <div class=\"bg-circle\"></div>\n      <hr />\n      <div class=\"border-circle\"></div>\n      <div class=\"inner-circle\">\n        <div class=\"rotative\"></div>\n      </div>\n      <div class=\"center-circle\"></div>\n    </span>\n  </div>\n</div>\n\n<div id=\"menu\">\n  <div id=\"menu-header\">\n    <div class=\"avatar\" ";
  stack1 = {};
  stack1['style'] = "Omci.model.user.avatar:background-image:url({{this}})";
  stack1 = helpers.bindAttr.call(depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + "></div>\n      ";
  stack1 = helpers.bind.call(depth0, "Omci.model.user.formatedName", {hash:{},data:data});
  buffer += escapeExpression(stack1) + "\n  </div>\n  <h3>Badges</h3>\n  <ul>\n    <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.goTo", "foursquare", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + " ";
  stack1 = {};
  stack1['data-badge'] = "Omci.model.user.badges.foursquare.length";
  stack1 = helpers.bindAttr.call(depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + " class=\"is-active\">Foursquare</li>\n    <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.goTo", "cities", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + " ";
  stack1 = {};
  stack1['data-badge'] = "Omci.model.user.badges.cities.length";
  stack1 = helpers.bindAttr.call(depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Cities</li>\n    <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.goTo", "expertise", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + " ";
  stack1 = {};
  stack1['data-badge'] = "Omci.model.user.badges.expertise.length";
  stack1 = helpers.bindAttr.call(depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Expertise</li>\n    <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.goTo", "partner", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + " ";
  stack1 = {};
  stack1['data-badge'] = "Omci.model.user.badges.partner.length";
  stack1 = helpers.bindAttr.call(depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Partner</li>\n  </ul>\n  <h3>Profile</h3>\n  <ul>\n    <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.logout", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Logout</li>\n  </ul>\n</div>\n\n<div id=\"container\">\n  \n</div>\n\n";
  return buffer;});
templates['badges/cities'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"illustration\" style=\"background-image:url(";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.image;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ")\"></div>\n    <h4>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</h4>\n    <p>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.details;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</p>\n    <div class=\"infos\">\n        <div class=\"progress\" style=\"width:";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.complete;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "%\"></div>\n        <div class=\"text\">\n       <span class=\"number\">";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.more;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span> <span class=\"label\">more check-ins</span>  <span class=\"expect\"><small>/</small>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.infos;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.expect;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span>\n       </div> \n    </div>\n  ";
  return buffer;}

  buffer += "<div class=\"container-header\">\n    <span class=\"title\">Cities</span>\n\n  <button type=\"button\" class=\"toggle-menu\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "Omci.rootView.toggleMenu", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">\n    <span></span>\n    <span></span>\n    <span></span>\n  </button>\n</div>\n<div class=\"scrollable\">\n  <div class=\"pull-to-refresh\">\n    <p class=\"default\">Pull down to refresh</p>\n    <p class=\"ok-refresh\">Release to refresh</p>\n    <p class=\"loading\">Loading ...</p>\n  </div>\n  <div class=\"filters\">\n    <ul>\n      <li class=\"active\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "nearest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Nearest</li>\n      <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "easiest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Easiest</li>\n    </ul>\n  </div>\n  ";
  stack1 = {};
  stack2 = depth0.view;
  stack2 = stack2 == null || stack2 === false ? stack2 : stack2.content;
  stack1['content'] = stack2;
  stack1['tagName'] = "ul";
  stack1['classNames'] = "badges";
  stack1 = helpers.collection.call(depth0, {hash:stack1,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;});
templates['badges/expertise'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"illustration\" style=\"background-image:url(";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.image;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ")\"></div>\n    <h4>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</h4>\n    <p>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.details;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</p>\n    <div class=\"infos\">\n        <div class=\"progress\" style=\"width:";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.complete;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "%\"></div>\n        <div class=\"text\">\n       <span class=\"number\">";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.more;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span> <span class=\"label\">more check-ins</span>  <span class=\"expect\"><small>/</small>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.infos;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.expect;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span>\n       </div> \n    </div>\n  ";
  return buffer;}

  buffer += "<div class=\"container-header\">\n    <span class=\"title\">Expertise</span>\n\n  <button type=\"button\" class=\"toggle-menu\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "Omci.rootView.toggleMenu", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">\n    <span></span>\n    <span></span>\n    <span></span>\n  </button>\n</div>\n<div class=\"scrollable\">\n  <div class=\"pull-to-refresh\">\n    <p class=\"default\">Pull down to refresh</p>\n    <p class=\"ok-refresh\">Release to refresh</p>\n    <p class=\"loading\">Loading ...</p>\n  </div>\n  <div class=\"filters\">\n    <ul>\n      <li class=\"active\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "nearest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Nearest</li>\n      <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "easiest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Easiest</li>\n      <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "level", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">By level</li>\n    </ul>\n  </div>\n  ";
  stack1 = {};
  stack2 = depth0.view;
  stack2 = stack2 == null || stack2 === false ? stack2 : stack2.content;
  stack1['content'] = stack2;
  stack1['tagName'] = "ul";
  stack1['classNames'] = "badges";
  stack1 = helpers.collection.call(depth0, {hash:stack1,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;});
templates['badges/foursquare'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n    ";
  buffer += "\n    <div class=\"illustration\" style=\"background-image:url(";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.image;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ")\"></div>\n    <h4>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</h4>\n    <p>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.details;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</p>\n    <div class=\"infos\">\n        <div class=\"progress\" style=\"width:";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.complete;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "%\"></div>\n        <div class=\"text\">\n       <span class=\"number\">";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.more;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span> <span class=\"label\">\n       ";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.more;
  foundHelper = helpers.ifequal;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, 1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data}) : helperMissing.call(depth0, "ifequal", stack1, 1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n       </span>  \n       </div> \n    </div>\n  ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\n        more check-in\n       ";}

function program4(depth0,data) {
  
  
  return "\n        more check-ins\n       ";}

  buffer += "<div class=\"container-header\">\n  <span class=\"title\">Foursquare</span>\n\n  <button type=\"button\" class=\"toggle-menu\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "Omci.rootView.toggleMenu", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">\n    <span></span>\n    <span></span>\n    <span></span>\n  </button>\n\n</div>\n<div class=\"scrollable\">\n  <div class=\"pull-to-refresh\">\n    <p class=\"default\">Pull down to refresh</p>\n    <p class=\"ok-refresh\">Release to refresh</p>\n    <p class=\"loading\">Loading ...</p>\n  </div>\n  <div class=\"filters\">\n    <ul>\n      <li class=\"active\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "nearest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Nearest</li>\n      <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "easiest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Easiest</li>\n    </ul>\n  </div>\n  ";
  stack1 = {};
  stack2 = depth0.view;
  stack2 = stack2 == null || stack2 === false ? stack2 : stack2.content;
  stack1['content'] = stack2;
  stack1['tagName'] = "ul";
  stack1['classNames'] = "badges";
  stack1 = helpers.collection.call(depth0, {hash:stack1,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;});
templates['badges/partner'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"illustration\" style=\"background-image:url(";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.image;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ")\"></div>\n    <h4>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</h4>\n    <p>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.details;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</p>\n    <div class=\"infos\">\n        <div class=\"progress\" style=\"width:";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.complete;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "%\"></div>\n        <div class=\"text\">\n       <span class=\"number\">";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.more;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span> <span class=\"label\">more check-ins</span>  <span class=\"expect\"><small>/</small>";
  stack1 = depth0.view;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.content;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.infos;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.expect;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</span>\n       </div> \n    </div>\n  ";
  return buffer;}

  buffer += "<div class=\"container-header\">\n    <span class=\"title\">Partner</span>\n\n  <button type=\"button\" class=\"toggle-menu\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "Omci.rootView.toggleMenu", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">\n    <span></span>\n    <span></span>\n    <span></span>\n  </button>\n</div>\n<div class=\"scrollable\">\n  <div class=\"pull-to-refresh\">\n    <p class=\"default\">Pull down to refresh</p>\n    <p class=\"ok-refresh\">Release to refresh</p>\n    <p class=\"loading\">Loading ...</p>\n  </div>\n  <div class=\"filters\">\n    <ul>\n      <li class=\"active\" ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "nearest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Nearest</li>\n      <li ";
  stack1 = {};
  stack1['on'] = "tap";
  stack1 = helpers.action.call(depth0, "view.sort", "easiest", {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + ">Easiest</li>\n    </ul>\n  </div>\n  ";
  stack1 = {};
  stack2 = depth0.view;
  stack2 = stack2 == null || stack2 === false ? stack2 : stack2.content;
  stack1['content'] = stack2;
  stack1['tagName'] = "ul";
  stack1['classNames'] = "badges";
  stack1 = helpers.collection.call(depth0, {hash:stack1,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;});
})();