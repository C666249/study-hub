/* GlassMatch PWA · resilient offline navigation.
   Independent asset prefetch: one unavailable image must never abort service worker install. */
const CACHE='glassmatch-v4-1-bilingual-20261117';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./search-lexi-v4.js','./search-lexi-v4.css'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async(path)=>{
      try{
        const request=new Request(new URL(path,self.registration.scope),{cache:'no-cache'});
        const response=await fetch(request);
        if(response.ok)await cache.put(request,response.clone());
      }catch(err){/* temporary network loss must not poison install */}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const current=await caches.open(CACHE);
    const ready=await current.match(new URL('./index.html',self.registration.scope)) || await current.match(new URL('./',self.registration.scope));
    if(ready){
      const names=await caches.keys();
      await Promise.all(names.filter(n=>n.startsWith('glassmatch-')&&n!==CACHE).map(n=>caches.delete(n)));
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      let response;
      try{
        response=await fetch(req);
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(new URL('./index.html',self.registration.scope),copy)).catch(()=>{}));
          return response;
        }
        if(response.status>=400&&response.status<500)return response;
      }catch(err){/* fall back to stored shell */}
      const fallback=await caches.match(req,{ignoreSearch:true})||
        await caches.match(new URL('./index.html',self.registration.scope),{ignoreSearch:true})||
        await caches.match(new URL('./',self.registration.scope),{ignoreSearch:true});
      if(fallback)return fallback;
      return new Response(
        '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GlassMatch 暂时无法加载</title><body style="font:16px/1.8 system-ui;padding:30px;color:#234"><h2>GlassMatch 暂时无法连接</h2><p>当前网页无法从 GitHub Pages 加载，本机也尚未缓存离线首页。请检查 VPN 或网络后重试。</p><p><a href="./">重新加载 GlassMatch</a></p></body></html>',
        {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}
      );
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(req);
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}));
      }
      return response;
    }catch(err){return Response.error();}
  })());
});
