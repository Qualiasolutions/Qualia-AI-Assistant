if(!self.define){let e,s={};const a=(a,t)=>(a=new URL(a+".js",t).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(t,n)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const r=e=>a(e,i),o={module:{uri:i},exports:c,require:r};s[i]=Promise.all(t.map((e=>o[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-00a24876"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"45e3de7fd8b46837171ef34c9354a7c9"},{url:"/_next/static/chunks/341.34f2b76c309db662.js",revision:"34f2b76c309db662"},{url:"/_next/static/chunks/398-7f7a9937569c8635.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/472.a3826d29d6854395.js",revision:"a3826d29d6854395"},{url:"/_next/static/chunks/485-e4ec857676d71c05.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/4bd1b696-4fa3f48d6e8b9ac3.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/684-0d8ca10be3906d62.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/_not-found/page-1b09f6ef81a754c6.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/assistant/route-626d5083df70f2af.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/auth/login/route-b62cf00c3f606bb4.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/auth/logout/route-70303fabf6dc7f7e.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/auth/register/route-b8557784d06fa3ed.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/auth/user/route-644512c41da3f865.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/leads/route-2a28b96a9c12c1bf.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/search/route-d258237a88321346.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/api/text-to-speech/route-e1e56582e9874840.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/auth/page-e97e7a7615ad47cc.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/chat/page-2a4f7707adeab7cf.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/layout-41ff130b16453083.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/page-46d36c9edc489fa0.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/app/settings/page-27d83f4d1028dc62.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/ee560e2c-1229be5c116ee9ae.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/framework-6d868e9bc95e10d8.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/main-app-54e3101180e72a0c.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/main-f181ba841c2bbd4e.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/pages/_app-f49b2a5977e4bd4f.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/pages/_error-c67e5ae945ee3c40.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-98cf78e24d244efd.js",revision:"ntmha0NNz7_CksCeaN_-T"},{url:"/_next/static/css/437090a0285cdae6.css",revision:"437090a0285cdae6"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/ntmha0NNz7_CksCeaN_-T/_buildManifest.js",revision:"92cc69834bd2cd23e5ec8c77926e4e49"},{url:"/_next/static/ntmha0NNz7_CksCeaN_-T/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/favicon.svg",revision:"d16681c927d210a8ffb6c962ebcff370"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.svg",revision:"d4a70e58c6652c135000e7e9ced11df7"},{url:"/icons/icon-512x512.svg",revision:"b396bdd2387a55ac658542cc787cf60c"},{url:"/manifest.json",revision:"4818b74df60ffbf8c327c759a44d398d"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/api\/(?!auth\/)/i,new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/.*/i,new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET")}));
