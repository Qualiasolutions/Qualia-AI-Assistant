if(!self.define){let e,s={};const a=(a,n)=>(a=new URL(a+".js",n).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(n,i)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const r=e=>a(e,t),o={module:{uri:t},exports:c,require:r};s[t]=Promise.all(n.map((e=>o[e]||r(e)))).then((e=>(i(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"7cdfbf03a8738b16f0aa7148e4a39d4e"},{url:"/_next/static/FupBV7OzFSz4G_xUA_pJM/_buildManifest.js",revision:"4f867529c6bec4dcf260575cd076733c"},{url:"/_next/static/FupBV7OzFSz4G_xUA_pJM/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/341.2903e54d3da731c1.js",revision:"2903e54d3da731c1"},{url:"/_next/static/chunks/472.a3826d29d6854395.js",revision:"a3826d29d6854395"},{url:"/_next/static/chunks/4bd1b696-0c44ec2b0dcef0fd.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/54-40e88c6567f05b93.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/684-05fb636a5842eca3.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/_not-found/page-004fe34f82d833d0.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/api/assistant/route-a453b6672974c93a.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/api/auth/login/route-df97dd34ccb7a213.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/api/auth/user/route-8ea0acf812d072a3.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/api/leads/route-46480331392f2736.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/auth/page-900af2a33b28cff8.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/chat/page-0d0f855b6f609386.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/layout-c161fc4ffad21ec5.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/app/page-bba8582cf506f96f.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/ee560e2c-4b7c54608555feb4.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/framework-859199dea06580b0.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/main-app-b281775307ac88aa.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/main-b7a374b42b45e53f.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/pages/_app-a66f9296699c5863.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/pages/_error-7688f4c9a69e67c8.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-8229581dee3ccd33.js",revision:"FupBV7OzFSz4G_xUA_pJM"},{url:"/_next/static/css/101adc725475dc5a.css",revision:"101adc725475dc5a"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/favicon.svg",revision:"d16681c927d210a8ffb6c962ebcff370"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.svg",revision:"d4a70e58c6652c135000e7e9ced11df7"},{url:"/icons/icon-512x512.svg",revision:"b396bdd2387a55ac658542cc787cf60c"},{url:"/manifest.json",revision:"adb6d0422fae847a191b20558536c9cf"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
