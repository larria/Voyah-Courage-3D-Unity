const root = new URL('../', import.meta.url);
let registration, installedPrompt, boundVersion, reloading = false, checking = false;
const panel = document.createElement('aside');
panel.setAttribute('aria-label', '应用版本与离线状态');
panel.className = 'pwa-status';
const footer = document.querySelector('.panel-footer');
if (!footer) panel.style.cssText = 'padding:8px 12px;color:#7d8581;font:11px system-ui;display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px';
const label = document.createElement('span'); label.setAttribute('role', 'status');
const install = document.createElement('button'); install.textContent = '安装应用'; install.hidden = true;
const update = document.createElement('button'); update.textContent = '更新应用'; update.hidden = true;
for (const button of [install, update]) {
  button.type = 'button';
  if (!footer) button.style.cssText = 'padding:4px 6px;border:1px solid #d5ddd7;background:transparent;color:inherit;border-radius:4px;font:inherit;cursor:pointer';
}
panel.append(label, install, update);
if (window.top === window) (footer || document.body).append(panel);
function status(state, message) {
  const names = { 'shell-ready': '离线壳就绪，模型按需缓存', 'offline-ready': '模型离线缓存就绪', cached: '模型资源已缓存', degraded: '缓存降级', error: '资源加载失败' };
  label.textContent = `v${boundVersion || '…'} · ${message || names[state] || state}`;
}
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installedPrompt = event; install.hidden = false; });
window.addEventListener('appinstalled', () => { installedPrompt = null; install.hidden = true; });
install.onclick = async () => { if (!installedPrompt) return; await installedPrompt.prompt(); await installedPrompt.userChoice; installedPrompt = null; install.hidden = true; };
update.onclick = () => {
  if (registration?.waiting && confirm('发现新版本。更新将重新加载所有已打开的应用标签，是否继续？')) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
};
function waiting() {
  update.hidden = !registration?.waiting;
  update.textContent = '新版已就绪 · 更新';
}
function bind() {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { channel.port1.close(); reject(new Error('Service Worker 握手超时')); }, 15000);
    channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); boundVersion = event.data.version; status(event.data.state, event.data.message); resolve(event.data); };
    navigator.serviceWorker.controller.postMessage({ type: 'PWA_BIND' }, [channel.port2]);
  });
}
async function checkVersion() {
  if (!registration || checking || document.visibilityState === 'hidden') return;
  checking = true;
  try {
    const response = await fetch(new URL(`version.json?check=${Date.now()}`, root), { cache: 'no-store' });
    if (!response.ok) throw new Error('版本检查失败');
    const { version } = await response.json();
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('版本格式无效');
    if (version !== boundVersion) {
      registration = await navigator.serviceWorker.register(new URL(`sw.js?v=${version}`, root), { scope: root.pathname, updateViaCache: 'none' });
    } else await registration.update();
    waiting();
  } catch { /* Offline checks are advisory; retain the pinned working version. */ }
  finally { checking = false; }
}
export const pwaReady = (async () => {
  try {
    const response = await fetch(new URL('version.json', root), { cache: 'no-store' });
    if (!response.ok) throw new Error('无法取得应用版本');
    const { version } = await response.json();
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('版本格式无效');
    boundVersion = version;
  } catch (error) {
    status('degraded', error.message);
    return { supported: false, error: error.message };
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status('degraded', '离线缓存需要 HTTPS 或 localhost');
    return { supported: false, version: boundVersion };
  }
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }
    if (!reloading) { reloading = true; location.reload(); }
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PWA_STATUS') {
      status(event.data.state, event.data.message);
      if (event.data.state === 'cached') bind().catch(() => {});
    }
  });
  try {
    // Initial no-query lookup above is served by the pinned shell when offline.
    registration = await navigator.serviceWorker.register(new URL(`sw.js?v=${boundVersion}`, root), { scope: root.pathname, updateViaCache: 'none' });
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', waiting);
    });
    waiting();
    if (!navigator.serviceWorker.controller) await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', claimed); reject(new Error('首次离线接管超时')); }, 30000);
      function claimed() { if (navigator.serviceWorker.controller) { clearTimeout(timeout); navigator.serviceWorker.removeEventListener('controllerchange', claimed); resolve(); } }
      navigator.serviceWorker.addEventListener('controllerchange', claimed); claimed();
    });
    const result = await bind();
    document.addEventListener('visibilitychange', checkVersion);
    setInterval(checkVersion, 60000);
    void checkVersion();
    return { supported: true, ...result };
  } catch (error) { status('degraded', error.message); return { supported: false, error: error.message }; }
})();
