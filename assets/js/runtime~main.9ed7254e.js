(()=>{"use strict";var e,t,r,a,o,f={},n={};function b(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={id:e,loaded:!1,exports:{}};return f[e].call(r.exports,r,r.exports,b),r.loaded=!0,r.exports}b.m=f,b.c=n,e=[],b.O=(t,r,a,o)=>{if(!r){var f=1/0;for(d=0;d<e.length;d++){for(var[r,a,o]=e[d],n=!0,c=0;c<r.length;c++)(!1&o||f>=o)&&Object.keys(b.O).every((e=>b.O[e](r[c])))?r.splice(c--,1):(n=!1,o<f&&(f=o));if(n){e.splice(d--,1);var i=a();void 0!==i&&(t=i)}}return t}o=o||0;for(var d=e.length;d>0&&e[d-1][2]>o;d--)e[d]=e[d-1];e[d]=[r,a,o]},b.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return b.d(t,{a:t}),t},r=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,b.t=function(e,a){if(1&a&&(e=this(e)),8&a)return e;if("object"==typeof e&&e){if(4&a&&e.__esModule)return e;if(16&a&&"function"==typeof e.then)return e}var o=Object.create(null);b.r(o);var f={};t=t||[null,r({}),r([]),r(r)];for(var n=2&a&&e;"object"==typeof n&&!~t.indexOf(n);n=r(n))Object.getOwnPropertyNames(n).forEach((t=>f[t]=()=>e[t]));return f.default=()=>e,b.d(o,f),o},b.d=(e,t)=>{for(var r in t)b.o(t,r)&&!b.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},b.f={},b.e=e=>Promise.all(Object.keys(b.f).reduce(((t,r)=>(b.f[r](e,t),t)),[])),b.u=e=>"assets/js/"+({53:"935f2afb",83:"c31773f8",91:"7956b02b",105:"e0b41884",121:"bbcc1203",128:"a09c2993",133:"74860b1a",140:"f6624ac6",207:"5fbc5cf1",217:"d9e16301",222:"2b810e00",226:"849404ec",247:"c73e0d38",285:"62d444b9",349:"adb5656e",484:"813ea2aa",514:"1be78505",518:"042e7587",617:"aa829a7d",732:"0af7b35c",798:"d92a3c43",836:"0480b142",847:"b1381a87",918:"17896441",930:"fa4d91bf",966:"fc38421c",973:"78f86360"}[e]||e)+"."+{53:"0515b994",83:"cf0b18e2",91:"d15ad191",105:"60acb1b5",121:"d0c8436a",128:"7d771a30",133:"b34d453b",140:"7f4f4a6c",207:"75815541",217:"e2204e7e",222:"57416f12",226:"f79a223b",247:"9a567053",285:"96d43566",349:"5fd0364f",484:"8f6c63bf",514:"e26aa023",518:"e0563d17",617:"b3cc16e2",732:"47a3e70c",798:"9b4e1742",836:"1f3b3884",847:"428452f4",918:"9ee3f929",930:"d890af90",966:"dc20473a",972:"6014fcc7",973:"36d82662"}[e]+".js",b.miniCssF=e=>{},b.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),b.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a={},o="immer-website:",b.l=(e,t,r,f)=>{if(a[e])a[e].push(t);else{var n,c;if(void 0!==r)for(var i=document.getElementsByTagName("script"),d=0;d<i.length;d++){var u=i[d];if(u.getAttribute("src")==e||u.getAttribute("data-webpack")==o+r){n=u;break}}n||(c=!0,(n=document.createElement("script")).charset="utf-8",n.timeout=120,b.nc&&n.setAttribute("nonce",b.nc),n.setAttribute("data-webpack",o+r),n.src=e),a[e]=[t];var l=(t,r)=>{n.onerror=n.onload=null,clearTimeout(s);var o=a[e];if(delete a[e],n.parentNode&&n.parentNode.removeChild(n),o&&o.forEach((e=>e(r))),t)return t(r)},s=setTimeout(l.bind(null,void 0,{type:"timeout",target:n}),12e4);n.onerror=l.bind(null,n.onerror),n.onload=l.bind(null,n.onload),c&&document.head.appendChild(n)}},b.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},b.p="/immer/",b.gca=function(e){return e={17896441:"918","935f2afb":"53",c31773f8:"83","7956b02b":"91",e0b41884:"105",bbcc1203:"121",a09c2993:"128","74860b1a":"133",f6624ac6:"140","5fbc5cf1":"207",d9e16301:"217","2b810e00":"222","849404ec":"226",c73e0d38:"247","62d444b9":"285",adb5656e:"349","813ea2aa":"484","1be78505":"514","042e7587":"518",aa829a7d:"617","0af7b35c":"732",d92a3c43:"798","0480b142":"836",b1381a87:"847",fa4d91bf:"930",fc38421c:"966","78f86360":"973"}[e]||e,b.p+b.u(e)},(()=>{var e={303:0,532:0};b.f.j=(t,r)=>{var a=b.o(e,t)?e[t]:void 0;if(0!==a)if(a)r.push(a[2]);else if(/^(303|532)$/.test(t))e[t]=0;else{var o=new Promise(((r,o)=>a=e[t]=[r,o]));r.push(a[2]=o);var f=b.p+b.u(t),n=new Error;b.l(f,(r=>{if(b.o(e,t)&&(0!==(a=e[t])&&(e[t]=void 0),a)){var o=r&&("load"===r.type?"missing":r.type),f=r&&r.target&&r.target.src;n.message="Loading chunk "+t+" failed.\n("+o+": "+f+")",n.name="ChunkLoadError",n.type=o,n.request=f,a[1](n)}}),"chunk-"+t,t)}},b.O.j=t=>0===e[t];var t=(t,r)=>{var a,o,[f,n,c]=r,i=0;if(f.some((t=>0!==e[t]))){for(a in n)b.o(n,a)&&(b.m[a]=n[a]);if(c)var d=c(b)}for(t&&t(r);i<f.length;i++)o=f[i],b.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return b.O(d)},r=self.webpackChunkimmer_website=self.webpackChunkimmer_website||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})()})();