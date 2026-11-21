const version = 'turtle-forest-v3';
const assets = ['./','./index.html','./style.css','./app.mjs','./math.mjs','./audio.mjs','./profile-names.mjs','./manifest.webmanifest','./icon-192.png','./icon-512.png','./forest.webp'];
self.addEventListener('install',event => {
  event.waitUntil(caches.open(version).then(cache=>cache.addAll(assets)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('turtle-forest-') && key!==version).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const {request}=event;
  if (request.method!=='GET' || new URL(request.url).origin!==self.location.origin) return;
  const asset=new URL(request.url);
  if (request.mode==='navigate' && asset.pathname===new URL(self.registration.scope).pathname) {
    event.respondWith(caches.open(version).then(cache=>cache.match('./index.html')).then(cached=>cached || fetch(request)));
    return;
  }
  if (assets.some(path=>new URL(path,self.registration.scope).href===asset.href)) {
    event.respondWith(caches.open(version).then(cache=>cache.match(request)).then(cached=>cached || fetch(request)));
  }
});
