/*
 <a href="http://en.wikipedia.org/wiki/MIT_License">MIT</a>.
 @copyright All rights reserved <a href="http://www.webitup.fr">copyright WebItUp</a>
 @see https://gist.github.com/603980
 @name https://github.com/jsBoot/spitfire.js/blob/master/src/gulliver.js#61-cf5eb006aad1e3ff52667ff791884991903ded05
*/
'use strict';(function(){this.gulliver=function(i,e,j){var c=document.head||document.getElementsByTagName("head"),g=function(){if("item"in c){if(!c[0]){setTimeout(g,25);return}c=c[0]}for(var d=document.getElementsByTagName("script"),k=RegExp("(.*)\\/"+(j||"gulliver")+"((?:-min)?\\.js)"),f=0,b;f<d.length;f++)if(b=d[f],b.src&&(b=b.src.match(k))){b.shift();e=b.shift()+"/"+e+b.shift();break}var a=document.createElement("script"),h=false;a.onload=a.onreadystatechange=function(){if(a.readyState&&a.readyState!==
"complete"&&a.readyState!=="loaded"||h)return false;a.onload=a.onreadystatechange=null;h=true;i()};a.src=e;c.insertBefore(a,c.firstChild)};setTimeout(g,0);if(document.readyState===null&&document.addEventListener){var d=function(){document.removeEventListener("DOMContentLoaded",d,false);document.readyState="complete"};document.readyState="loading";document.addEventListener("DOMContentLoaded",d,false)}}}).apply(this);
