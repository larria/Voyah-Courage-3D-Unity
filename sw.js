/* Root-scoped, version-pinned PWA; never precache Unity data/wasm. */
const BASE = new URL('./', self.location.href);
const VERSION = new URL(self.location.href).searchParams.get('v');
const PREFIX = `zhiyin:${BASE.pathname}:`;
const META = `${PREFIX}snapshots`;
const inflight = new Map();
const snapshots = new Map();
const pins = new Map();
const url = path => new URL(path, BASE).href;
const shellName = version => `${PREFIX}shell:${version}`;
const large = item => /\.(data|wasm)$/.test(item.path);
async function notify(detail) {
  for (const client of await self.clients.matchAll({ includeUncontrolled: true })) client.postMessage({ type: 'PWA_STATUS', ...detail });
}
async function store(cache, key, response) {
  try { await (await caches.open(cache)).put(key, response); return true; }
  catch (error) { await notify({ state: 'degraded', message: `缓存不可用，已降级：${error.message}` }); return false; }
}
async function snapshot(version) {
  if (snapshots.has(version)) return snapshots.get(version);
  const saved = await caches.match(url(`__pwa_snapshot__/${version}`), { cacheName: META });
  if (!saved) throw new Error(`Missing version snapshot ${version}`);
  const value = await saved.json(); snapshots.set(version, value); return value;
}
async function verified(response, item) {
  if (!response.ok || response.type === 'opaque') throw new Error(`资源请求失败：${item.path}`);
  const bytes = await response.clone().arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
  if (bytes.byteLength !== item.bytes || hash !== item.sha256) throw new Error(`资源校验失败：${item.path}`);
  return response;
}
async function resource(version, item) {
  const name = large(item) ? `${PREFIX}blob:${item.sha256}` : shellName(version);
  const key = large(item) ? url(`__pwa_blob__/${item.sha256}`) : url(item.path);
  const id = `${name}:${key}`;
  if (inflight.has(id)) return (await inflight.get(id)).clone();
  const work = (async () => {
    let cached;
    try { cached = await caches.match(key, { cacheName: name }); } catch { /* Network fallback. */ }
    if (cached) return cached;
    const response = await verified(await fetch(url(item.path), { cache: 'no-store' }), item);
    const stored = await store(name, key, response.clone());
    if (large(item)) await notify({ state: stored ? 'cached' : 'degraded', path: item.path, version });
    return response;
  })();
  inflight.set(id, work);
  try { return (await work).clone(); } finally { inflight.delete(id); }
}
self.addEventListener('install', event => event.waitUntil((async () => {
  if (!VERSION || !/^\d+\.\d+\.\d+$/.test(VERSION)) throw new Error('Missing SW version');
  const versionResponse = await fetch(url('version.json'), { cache: 'no-store' });
  if (!versionResponse.ok || (await versionResponse.clone().json()).version !== VERSION) throw new Error('Deployment version mismatch');
  const response = await fetch(url('offline-manifest.json'), { cache: 'no-store' });
  if (!response.ok) throw new Error('Manifest unavailable');
  const manifest = await response.clone().json();
  if (!Array.isArray(manifest.files) || manifest.version !== VERSION) throw new Error('Invalid manifest or manifest version mismatch');
  const paths = new Set();
  for (const item of manifest.files) {
    if (typeof item.path !== 'string' || item.path.split('/').some(p => !p || p === '.' || p === '..') || /[\\?#]/.test(item.path) || item.path === 'offline-manifest.json' || paths.has(item.path) || !Number.isSafeInteger(item.bytes) || item.bytes < 0 || !/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error('Invalid manifest entry');
    paths.add(item.path);
  }
  snapshots.set(VERSION, manifest);
  if (!await store(META, url(`__pwa_snapshot__/${VERSION}`), new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } }))) {
    throw new Error('Cannot persist version snapshot; refusing unsafe worker activation');
  }
  if (!await store(shellName(VERSION), url('offline-manifest.json'), response)) throw new Error('Cannot persist offline manifest');
  // Sequential shell downloads bound peak memory; waiting workers never fetch large assets.
  for (const item of manifest.files.filter(item => !large(item) && item.path !== 'sw.js')) await resource(VERSION, item);
  await store(shellName(VERSION), url('version.json'), versionResponse);
})()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
async function clientVersion(id) {
  if (!id) return VERSION;
  if (pins.has(id)) return pins.get(id);
  try {
    const saved = await caches.match(url(`__pwa_client__/${id}`), { cacheName: META });
    if (saved) { const version = await saved.text(); pins.set(id, version); return version; }
  } catch { /* Fresh clients use current version. */ }
  return VERSION;
}
async function pin(id, version) {
  if (!id) return;
  pins.set(id, version);
  await store(META, url(`__pwa_client__/${id}`), new Response(version));
}
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (event.data?.type !== 'PWA_BIND') return;
  event.waitUntil((async () => {
    const version = await clientVersion(event.source.id);
    await pin(event.source.id, version);
    const manifest = await snapshot(version);
    // sw.js is intentionally excluded: worker scripts are managed by the browser,
    // not by the runtime resource cache. Include every other manifest resource.
    const resources = manifest.files.filter(item => item.path !== 'sw.js');
    let shellReady = true, blobsReady = true;
    for (const item of resources) {
      let cached = false;
      try {
        cached = Boolean(await caches.match(large(item) ? url(`__pwa_blob__/${item.sha256}`) : url(item.path),
          { cacheName: large(item) ? `${PREFIX}blob:${item.sha256}` : shellName(version) }));
      } catch { /* Report incomplete. */ }
      if (!cached) { if (large(item)) blobsReady = false; else shellReady = false; }
    }
    for (const path of ['offline-manifest.json', 'version.json']) {
      try { if (!await caches.match(url(path), { cacheName: shellName(version) })) shellReady = false; }
      catch { shellReady = false; }
    }
    event.ports[0]?.postMessage({ version, state: !shellReady ? 'degraded' : blobsReady ? 'offline-ready' : 'shell-ready',
      ...(!shellReady ? { message: '离线壳缓存不完整，联网时按需恢复' } : {}) });
  })().catch(error => event.ports[0]?.postMessage({ version: VERSION, state: 'degraded', message: error.message })));
});
self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestURL.origin !== BASE.origin || !requestURL.pathname.startsWith(BASE.pathname)) return;
  const path = decodeURIComponent(requestURL.pathname.slice(BASE.pathname.length));
  if (path === 'sw.js' || (path === 'version.json' && requestURL.searchParams.has('check'))) return;
  event.respondWith((async () => {
    const navigation = event.request.mode === 'navigate';
    const version = navigation ? VERSION : await clientVersion(event.clientId);
    if (navigation) await pin(event.resultingClientId, version);
    const manifest = await snapshot(version);
    const resolved = path === '' ? 'index.html' : path.endsWith('/') ? `${path}index.html` : path;
    const item = manifest.files.find(item => item.path === resolved);
    if (item) return resource(version, item);
    if (path === 'version.json' || path === 'offline-manifest.json') {
      const cached = await caches.match(url(path), { cacheName: shellName(version) });
      if (cached) return cached;
    }
    return fetch(event.request);
  })().catch(async error => {
    await notify({ state: 'error', message: error.message });
    // Fail closed on a missing pinned asset rather than deliver a newer, incompatible build.
    return new Response(error.message, { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
