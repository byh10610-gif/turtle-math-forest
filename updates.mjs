export const RELEASE = 15;

export async function watchForUpdates(onUpdate, onReady) {
  if (!('serviceWorker' in navigator)) return;
  const workers = navigator.serviceWorker;
  const askRelease = () => workers.controller?.postMessage('GET_RELEASE');
  workers.addEventListener('message', event => {
    const data = event.data;
    if (event.source===workers.controller&&data?.type==='release'&&data.release>RELEASE) onUpdate();
  });
  workers.addEventListener('controllerchange', askRelease);
  const registration = await workers.register('./sw.js',{updateViaCache:'none'});
  let checking = false;
  async function check() {
    if (checking || document.hidden || !navigator.onLine) return;
    checking = true;
    try { await registration.update(); }
    catch { /* The active offline version remains usable. */ }
    finally { checking=false; askRelease(); }
  }
  window.addEventListener('online',check);
  window.addEventListener('pageshow',check);
  document.addEventListener('visibilitychange',check);
  navigator.serviceWorker.ready.then(onReady);
  askRelease();
  void check();
}
