/*
 console-shim 1.0.2
 https://github.com/kayahr/console-shim
 Copyright (C) 2011 Klaus Reimer <k@ailis.de>
 Licensed under the MIT license
 (See http://www.opensource.org/licenses/mit-license)
*/
'use strict';(function(){var c=function(a,j,b){var c=Array.prototype.slice.call(arguments,2);return function(){var b=c.concat(Array.prototype.slice.call(arguments,0));a.apply(j,b)}};if(!window.console)window.console={};var a=window.console;if(!a.log)if(window.log4javascript){var b=log4javascript.getDefaultLogger();a.log=c(b.info,b);a.debug=c(b.debug,b);a.info=c(b.info,b);a.warn=c(b.warn,b);a.error=c(b.error,b)}else a.log=function(){};if(!a.debug)a.debug=a.log;if(!a.info)a.info=a.log;if(!a.warn)a.warn=
a.log;if(!a.error)a.error=a.log;if(window.__consoleShimTest__!=null||eval("/*@cc_on @_jscript_version <= 9@*/"))b=function(d){var b,c,g,d=Array.prototype.slice.call(arguments,0);g=d.shift();c=d.length;if(c>1&&window.__consoleShimTest__!==false){typeof d[0]!="string"&&(d.unshift("%o"),c+=1);for(b=(b=d[0].match(/%[a-z]/g))?b.length+1:1;b<c;b+=1)d[0]+=" %o"}Function.apply.call(g,a,d)},a.log=c(b,window,a.log),a.debug=c(b,window,a.debug),a.info=c(b,window,a.info),a.warn=c(b,window,a.warn),a.error=c(b,
window,a.error);a.assert||(a.assert=function(){var d=Array.prototype.slice.call(arguments,0);d.shift()||(d[0]="Assertion failed: "+d[0],a.error.apply(a,d))});if(!a.dir)a.dir=a.log;if(!a.dirxml)a.dirxml=a.log;if(!a.exception)a.exception=a.error;if(!a.time||!a.timeEnd){var f={};a.time=function(a){f[a]=(new Date).getTime()};a.timeEnd=function(b){var c=f[b];c&&(a.log(b+": "+((new Date).getTime()-c)+"ms"),delete f[b])}}a.table||(a.table=function(b,c){var e,g,f,h,i;if(b&&b instanceof Array&&b.length){if(!c||
!(c instanceof Array))for(e in c=[],b[0])b[0].hasOwnProperty(e)&&c.push(e);for(e=0,g=b.length;e<g;e+=1){f=[];for(h=0,i=c.length;h<i;h+=1)f.push(b[e][c[h]]);Function.apply.call(a.log,a,f)}}});a.clear||(a.clear=function(){});a.trace||(a.trace=function(){});a.group||(a.group=function(){});a.groupCollapsed||(a.groupCollapsed=function(){});a.groupEnd||(a.groupEnd=function(){});a.timeStamp||(a.timeStamp=function(){});a.profile||(a.profile=function(){});a.profileEnd||(a.profileEnd=function(){});a.count||
(a.count=function(){})})();
