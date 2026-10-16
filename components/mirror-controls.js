import { sha256 } from './sha256.js';

// Original build only; native timing evidence in .publish/mirror-fix-probe.
const HASHES = Object.freeze({
  wasm: 'e332b42051b117e0492744084cd5065ba6fd7d38b0178876bed500106ada35ba',
  data: '6d7394f4410750ee80f7fdb6e8049c71c484ad9c23367f09e8cb95f4db261d6f',
});
const REGISTRATIONS = [
  [2069616, 'com.ziz.configurator.Runtime.dll', 206, [[0x53, 26465]]],
  [2069548, 'com.ziz.common.Runtime.dll', 74, [[16, 26326], [18, 26328]]],
  [2069752, 'com.ziz.tools.Runtime.dll', 140, [[31, 26658], [33, 26660], [36, 26663]]],
  [2068256, 'UnityEngine.CoreModule.dll', 3411, [[1501, 15893], [2260, 16595]]],
];

/** Preserve original commands/lighting, but apply their native eased value on local Z. */
export async function createMirrorControls(unityInstance, {
  wasmUrl = '/unity-player/Build/ZY.wasm',
  dataUrl = '/unity-player/Build/ZY.data',
  isAlive = () => true,
} = {}) {
  const M = unityInstance?.Module;
  let destroyed = false, failure = null, active = false, vector = 0;
  const alive = () => {
    if (destroyed || !isAlive() || unityInstance?.Module !== M || !M?.HEAPU8
      || !M.HEAPU32 || !M.HEAPF32 || !M.asm?._g?.get) {
      throw new Error('Original live Unity Module is required for mirror controls.');
    }
    if (failure) throw failure;
  };
  alive();
  await Promise.all([[wasmUrl, HASHES.wasm], [dataUrl, HASHES.data]].map(async ([url, expected]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot verify mirror build: ${response.status}`);
    if (await sha256(await response.arrayBuffer()) !== expected) throw new Error('Unsupported Unity build; mirror bridge disabled.');
  }));
  alive(); // Mount may have gone away during asynchronous hashing; allocate nothing then.
  const range = (p, size = 4) => Number.isInteger(p) && p >= 1024 && p % 4 === 0 && p <= M.HEAPU8.length - size;
  const word = p => {
    if (!range(p)) throw new Error('Invalid mirror heap pointer.');
    return M.HEAPU32[p >>> 2];
  };
  const float = p => {
    if (!range(p)) throw new Error('Invalid mirror float pointer.');
    const value = M.HEAPF32[p >>> 2];
    if (!Number.isFinite(value)) throw new Error('Invalid native mirror value.');
    return value;
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
    if (!range(p, 16)) return false;
    const klass = word(p);
    return range(klass, 16) && text(word(klass + 8)) === name && text(word(klass + 12)) === ns;
  };
  const live = (p, name, ns) => typed(p, name, ns) && word(p + 8) !== 0;
  const registration = () => {
    alive();
    for (const [address, name, count, entries] of REGISTRATIONS) {
      if (text(word(address)) !== name || word(address + 4) !== count) throw new Error('Mirror codegen module mismatch.');
      const methods = word(address + 8);
      if (!range(methods, count * 4)) throw new Error('Invalid mirror method registration.');
      for (const [rid, slot] of entries) {
        if (word(methods + (rid - 1) * 4) !== slot || typeof M.asm._g.get(slot) !== 'function') {
          throw new Error('Original mirror native registration mismatch.');
        }
      }
    }
  };
  const linked = p => {
    if (!range(p, 84) || !live(p, 'Main') || word(p + 4) !== 0) return false;
    const c = word(p + 52), a = word(p + 80);
    return range(c, 288) && live(c, 'CarConfigurator') && word(c + 16) === 3
      && live(a, 'API') && word(a + 16) === p
      && live(word(c + 60), 'Transform', 'UnityEngine')
      && live(word(c + 68), 'Transform', 'UnityEngine')
      && typed(word(c + 284), 'AnimEx', 'Common.Tools');
  };
  let mainClass = 0;
  const resolve = () => {
    let match = 0;
    for (let p = 1024; p <= M.HEAPU8.length - 84; p += 4) {
      if (mainClass && M.HEAPU32[p >>> 2] !== mainClass) continue;
      if (!mainClass && !typed(p, 'Main')) continue;
      if (!linked(p)) continue;
      if (match) throw new Error('Ambiguous live mirror Main / car / API graph.');
      match = p;
      mainClass = word(p);
    }
    if (!match) throw new Error('No unique live mirror Main / car / API graph.');
    return match;
  };
  registration();
  const main = resolve(), car = word(main + 52), api = word(main + 80);
  const anim = word(car + 284), mirrors = [word(car + 60), word(car + 68)];
  const call = (slot, ...args) => M.asm._g.get(slot)(...args, 0);
  const animation = () => {
    if (!linked(main) || word(main + 52) !== car || word(main + 80) !== api
      || word(car + 284) !== anim || word(car + 60) !== mirrors[0] || word(car + 68) !== mirrors[1]) {
      throw new Error('Unity mirror graph changed during animation.');
    }
    if (!range(anim, 60) || !typed(anim, 'AnimEx', 'Common.Tools')
      || float(anim + 48) !== 3 || word(anim + 52) !== 3 || M.HEAPU8[anim + 37] !== 0) {
      throw new Error('Unsupported native mirror animation duration/ease/loop.');
    }
    const phase = float(anim + 32), status = word(anim + 16), values = word(anim + 44);
    if (phase < 0 || phase > 3 || ![0, 1, 2].includes(status)
      || !range(values, 20) || word(values + 12) !== 1) throw new Error('Invalid native mirror animation state.');
    const value = float(values + 16);
    if (value < 0 || value > 1) throw new Error('Invalid cached native mirror value.');
    return { phase, value, status };
  };
  const check = () => {
    registration();
    if (resolve() !== main || word(main + 52) !== car || word(main + 80) !== api
      || word(car + 284) !== anim || word(car + 60) !== mirrors[0] || word(car + 68) !== mirrors[1]
      || mirrors[0] === mirrors[1]) throw new Error('Unity mirror graph changed; recreate controls for this mount.');
    return animation();
  };
  const pause = () => { if (word(anim + 16) === 1) call(26658, anim); };
  const oldPre = M.preMainLoop;
  if (oldPre != null && typeof oldPre !== 'function') throw new Error('Invalid existing Unity pre hook.');
  const record = error => {
    failure = error instanceof Error ? error : new Error(String(error));
    active = false;
    // Do not allow a failed bridge to leave native animation running on the wrong axis.
    try { pause(); } catch { /* Preserve the originating failure for subsequent commands. */ }
  };
  function wrappedPre(...args) {
    let result;
    try { result = oldPre?.apply(this, args); }
    catch (error) { if (!destroyed) record(error); throw error; }
    if (destroyed || result === false || !active || failure) return result;
    try {
      alive();
      const state = animation();
      if (state.status === 1) throw new Error('Mirror animation unexpectedly running outside native stepping.');
      call(26660, anim, state.phase);
      call(26663, anim); // Exactly one native delta-time update; no JS clock or heap writes.
      const next = animation();
      pause(); // pause is legal only while status == 1; endpoints are already stopped.
      call(15893, vector, 0, 0, -70 * next.value);
      for (const transform of mirrors) call(16595, transform, vector);
      if (next.phase === 0 || next.phase === 3) active = false;
    } catch (error) { record(error); }
    return result;
  }
  const command = (method, value) => {
    check();
    if (M.preMainLoop !== wrappedPre) throw new Error('Mirror pre hook was replaced; recreate controls.');
    try {
      unityInstance.SendMessage('API', method, value);
      pause(); // Synchronous, before the next native frame, including rapid reversals.
      animation();
      active = true;
      return { dispatched: true, state: read() };
    } catch (error) { record(error); throw failure; }
  };
  const read = () => ({ ...check(), active });
  const boolean = value => {
    if (typeof value !== 'boolean') throw new TypeError('Mirror state must be boolean.');
    return value;
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    active = false; // A newer hook can retain wrappedPre: it is now inert before freeing.
    if (M.preMainLoop === wrappedPre) M.preMainLoop = oldPre;
    if (vector) { const p = vector; vector = 0; M.asm.Tg(p); }
  };
  try {
    check();
    if (typeof unityInstance.SendMessage !== 'function' || typeof M.asm.Sg !== 'function'
      || typeof M.asm.Tg !== 'function') throw new Error('Original mirror dispatch/allocator required.');
    alive();
    vector = M.asm.Sg(16);
    if (!range(vector, 16)) throw new Error('Mirror native scratch allocation failed.');
    call(15893, vector, 0, 0, 0);
    if ([0, 4, 8].some(offset => float(vector + offset) !== 0)) throw new Error('Mirror Vector3 constructor ABI mismatch.');
    M.preMainLoop = wrappedPre;
    return Object.freeze({
      buildHashes: HASHES,
      setMirrorsExpanded: value => command('setRearview', boolean(value) ? 0 : 1),
      setLocked: value => command('carLockStatus', boolean(value) ? 0 : 1),
      getState: read,
      destroy,
    });
  } catch (error) { destroy(); throw error; }
}
