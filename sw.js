const version = 'turtle-forest-v14';
const assets = ['./','./index.html','./style.css','./app.mjs','./math.mjs','./audio.mjs','./profile-names.mjs','./manifest.webmanifest','./icon-192.png','./icon-512.png','./forest.webp','./piano.ogg','./digits.bin','./ink.mjs','./credits.txt','./rewards.mjs',
  './garden/garden-engine.js',
  './garden/garden-geometry.js',
  './garden/garden.css',
  './garden/assets/characters.js',
  './garden/assets/characters.css',
  './garden/integration/legacy-adapter.mjs',
  './garden/assets/garden-background.webp'
];
self.addEventListener('install',event => {
  event.waitUntil((async()=>{
    const entries=await Promise.all(assets.map(async path=>{
      const canonical=new URL(path,self.registration.scope);
      const revision=new URL(canonical);
      revision.searchParams.set('version',version);
      const response=await fetch(revision,{cache:'reload'});
      if(!response.ok) throw new Error('Missing offline asset: '+path);
      return [canonical.href,response];
    }));
    const cache=await caches.open(version);
    await Promise.all(entries.map(([url,response])=>cache.put(url,response)));
    await self.skipWaiting();
  })());
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
