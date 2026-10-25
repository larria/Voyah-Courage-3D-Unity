import { sha256 } from './sha256.js';

// These offsets and registrations belong only to the unchanged original build.
const HASHES = Object.freeze({
  wasm: 'e332b42051b117e0492744084cd5065ba6fd7d38b0178876bed500106ada35ba',
  data: '6d7394f4410750ee80f7fdb6e8049c71c484ad9c23367f09e8cb95f4db261d6f',
});
const REGISTRATIONS = [
  [2069616, 'com.ziz.configurator.Runtime.dll', 206, [[0x1f, 26413]]],
  [2068256, 'UnityEngine.CoreModule.dll', 3411, [[1831, 16208], [1892, 16241], [1893, 16242], [1894, 16243], [1814, 16191], [1889, 16238], [2019, 16364], [2270, 16605], [2280, 16615], [2287, 16622], [2266, 16601], [2267, 16602], [1543, 15935]]],
];

/** Lazy, fail-closed bridge. Reads current heap views; never writes Unity memory. */
export async function createChargingControls(unityInstance, {
  wasmUrl = '/unity-player/Build/ZY.wasm',
  dataUrl = '/unity-player/Build/ZY.data',
  isAlive = () => true,
} = {}) {
  const M = unityInstance?.Module;
  let destroyed = false, scratch = 0;
  const alive = () => {
    if (destroyed || !isAlive() || unityInstance.Module !== M || !M?.HEAPU8 || !M.HEAPU32 || !M.HEAPF32 || !M.asm?._g?.get) {
      throw new Error('Original live Unity Module is required for charging controls.');
    }
  };
  alive();
  await Promise.all([[wasmUrl, HASHES.wasm], [dataUrl, HASHES.data]].map(async ([url, expected]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot verify charging build: ${response.status}`);
    if (await sha256(await response.arrayBuffer()) !== expected) throw new Error('Unsupported Unity build; charging bridge disabled.');
  }));
  alive();
  const range = (p, size = 4) => Number.isInteger(p) && p >= 1024 && p % 4 === 0 && p <= M.HEAPU8.length - size;
  const word = p => {
    if (!range(p)) throw new Error('Invalid charging heap pointer.');
    return M.HEAPU32[p >>> 2];
  };
  const text = p => {
    if (!Number.isInteger(p) || p < 1024 || p >= M.HEAPU8.length) return '';
    let value = '';
    for (let i = 0; i < 128 && p + i < M.HEAPU8.length; i++) {
      const byte = M.HEAPU8[p + i];
      if (!byte) return value;
      value += String.fromCharCode(byte);
    }
    return '';
  };
  const typed = (p, name, ns = 'Configurator') => {
    if (!range(p, 84)) return false;
    const klass = word(p);
    return range(klass, 16) && text(word(klass + 8)) === name && text(word(klass + 12)) === ns;
  };
  const live = (p, name, ns) => typed(p, name, ns) && word(p + 8) !== 0;
  const registration = () => {
    alive();
    for (const [address, name, count, entries] of REGISTRATIONS) {
      if (text(word(address)) !== name || word(address + 4) !== count) throw new Error('Charging codegen module mismatch.');
      const methods = word(address + 8);
      if (!range(methods, count * 4)) throw new Error('Invalid charging method registration.');
      for (const [rid, slot] of entries) {
        if (word(methods + (rid - 1) * 4) !== slot || typeof M.asm._g.get(slot) !== 'function') throw new Error('Original charging method registration mismatch.');
      }
    }
  };
  const linked = p => live(p, 'Main') && word(p + 4) === 0
    && live(word(p + 52), 'CarConfigurator') && live(word(p + 76), 'SceneCharging')
    && live(word(p + 80), 'API') && word(word(p + 80) + 16) === p
    && live(word(word(p + 76) + 16), 'Material', 'UnityEngine');
  registration();
  let mainClass = 0;
  const resolve = () => {
    const matches = [];
    // Retain class identity, not a heap view: Unity memory can grow between calls.
    for (let p = 1024; p <= M.HEAPU8.length - 84; p += 4) {
      const klass = M.HEAPU32[p >>> 2];
      if (mainClass && klass !== mainClass) continue;
      if (!mainClass && !typed(p, 'Main')) continue;
      if (linked(p)) { mainClass = klass; matches.push(p); }
      if (matches.length > 1) break;
    }
    if (matches.length !== 1) throw new Error('No unique live Main -> car / sceneCharging / API charging graph.');
    return matches[0];
  };
  const main = resolve(), car = word(main + 52), scene = word(main + 76), api = word(main + 80);
  const material = word(scene + 16);
  const call = (slot, ...args) => M.asm._g.get(slot)(...args, 0);
  const gameObject = call(16208, scene);
  const nativeName = p => {
    const s = call(16364, p);
    if (!typed(s, 'String', 'System')) throw new Error('Invalid native charging node name.');
    const length = word(s + 8);
    if (length > 128 || !range(s, 12 + length * 2)) throw new Error('Invalid charging node string bounds.');
    return String.fromCharCode(...M.HEAPU16.subarray((s + 12) >>> 1, ((s + 12) >>> 1) + length));
  };
  const root = call(16238, call(16208, car));
  const resolvePort = () => {
    if (!live(root, 'Transform', 'UnityEngine')) throw new Error('Invalid charging car root.');
    let top = root;
    for (let i = 0; ; i++) {
      if (i > 24) throw new Error('Charging parent hierarchy exceeds bounds.');
      const parent = call(16605, top);
      if (!parent) break;
      if (!live(parent, 'Transform', 'UnityEngine')) throw new Error('Invalid charging parent.');
      top = parent;
    }
    const matches = []; let count = 0;
    const walk = (t, path, depth) => {
      if (++count > 2000 || depth > 24 || !live(t, 'Transform', 'UnityEngine')) throw new Error('Invalid charging hierarchy.');
      const name = nativeName(t); path = path ? `${path}/${name}` : name;
      if (path === 'ZY/ZY-new/ZY/WG/CDK') matches.push(t);
      const children = call(16615, t);
      if (!Number.isInteger(children) || children < 0 || children > 500) throw new Error('Invalid charging children.');
      for (let i = 0; i < children; i++) walk(call(16622, t, i), path, depth + 1);
    };
    walk(top, '', 0);
    if (matches.length !== 1) throw new Error('No unique live charging-port pivot.');
    const port = matches[0];
    if (call(16615, port) !== 1 || nativeName(call(16622, port, 0)) !== 'cdk') throw new Error('Charging-port child mismatch.');
    return port;
  };
  const port = resolvePort();
  const quaternion = () => {
    call(16601, scratch, port);
    const q = Array.from(M.HEAPF32.subarray(scratch >>> 2, (scratch >>> 2) + 4));
    if (q.some(x => !Number.isFinite(x)) || Math.abs(Math.hypot(...q) - 1) > 0.001) throw new Error('Invalid charging quaternion ABI.');
    return q;
  };
  let closed, opened;
  const check = () => {
    registration();
    if (resolve() !== main || word(main + 52) !== car || word(main + 76) !== scene || word(main + 80) !== api
      || word(scene + 16) !== material || resolvePort() !== port || !live(gameObject, 'GameObject', 'UnityEngine') || call(16208, scene) !== gameObject) {
      throw new Error('Unity charging scene changed; recreate controls for this mount.');
    }
  };
  const dispatch = (slot, ...args) => { check(); return call(slot, ...args); };
  const read = () => {
    check();
    const activeSelf = Boolean(call(16242, gameObject));
    const activeInHierarchy = Boolean(call(16243, gameObject));
    const enabled = Boolean(call(16191, scene));
    const mode = word(scene + 40);
    const offset = M.HEAPF32[(scene + 24) >>> 2], speed = M.HEAPF32[(scene + 20) >>> 2];
    if (![0, 1].includes(mode) || !Number.isFinite(offset) || !Number.isFinite(speed)) throw new Error('Invalid charging state in verified scene.');
    const rotation = quaternion();
    const same = target => rotation.every((v, i) => Math.abs(v - target[i]) < 0.00001);
    if (!same(closed) && !same(opened)) throw new Error('Charging pivot changed outside this bridge.');
    return { portOpen: same(opened), cableVisible: activeSelf, activeInHierarchy, enabled, charging: activeInHierarchy && enabled && mode === 0,
      mode: mode === 0 ? 'flowing' : 'static', offset, speed };
  };
  const setPort = open => {
    const state = read();
    if (!open && state.cableVisible) throw new Error('Cannot close charging port while cable is visible.');
    if (state.portOpen !== open) {
      call(15935, scratch, ...(open ? opened : closed));
      call(16602, port, scratch);
    }
    return { dispatched: true, state: read() };
  };
  const set = (charging, visible) => {
    if (visible) setPort(true);
    // SetActive invokes original OnEnable/OnDisable; never invoke lifecycle manually.
    if (visible && !read().cableVisible) dispatch(16241, gameObject, 1);
    dispatch(26413, api, Number(charging));
    if (!visible && read().cableVisible) dispatch(16241, gameObject, 0);
    if (!visible) setPort(false);
    return { dispatched: true, state: read() };
  };
  const boolean = value => { if (typeof value !== 'boolean') throw new TypeError('Charging state must be boolean.'); return value; };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    if (scratch) { const p = scratch; scratch = 0; M.asm.Tg(p); }
  };
  try {
    check();
    if (typeof M.asm.Sg !== 'function' || typeof M.asm.Tg !== 'function') throw new Error('Charging allocator unavailable.');
    scratch = M.asm.Sg(16);
    if (!range(scratch, 16)) throw new Error('Charging scratch allocation failed.');
    closed = quaternion();
    const expected = [-0.1305262, 0, 0, 0.9914449];
    if (closed.some((v, i) => Math.abs(v - expected[i]) > 0.00001)) throw new Error('Unsupported charging pivot closed pose.');
    const [x, y, z, w] = closed, a = -0.5, s = Math.sqrt(3) / 2;
    opened = [x * s - z * a, w * a + y * s, x * a + z * s, w * s - y * a];
    call(15935, scratch, ...closed);
    call(16602, port, scratch);
    if (quaternion().some((v, i) => Math.abs(v - closed[i]) > 0.000001)) throw new Error('Charging quaternion setter ABI mismatch.');
    return Object.freeze({
      buildHashes: HASHES,
      setChargingPortOpen: value => setPort(boolean(value)),
      setCharging: value => set(boolean(value), value || read().cableVisible),
      setChargingCableVisible: value => set(false, boolean(value)),
      getState: read,
      destroy,
    });
  } catch (error) { destroy(); throw error; }
}
