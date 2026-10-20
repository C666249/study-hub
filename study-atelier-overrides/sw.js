/* Study Atelier v0.2: cache version and network-first code, preserve offline study. */
const CACHE='atelier-v02-20261020';
const SHELL=['./','./index.html','./styles.css','./upgrade.css','./app.js','./upgrade.js','./chapter-data.js','./quiz-data.js','./data.js','./topics.js','./favicon.svg','./manifest.webmanifest','./icon-192.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('atelier-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(/\/originals\/|\.(pdf|doc|docx)(\?|$)/i.test(url.pathname))return;
  const network=()=>fetch(req).then(response=>{
     if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}return response;
  });
  event.respondWith(network().catch(()=>caches.match(req).then(x=>x||Response.error())));
});
