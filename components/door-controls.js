import { sha256 } from './sha256.js';
/** Build-gated bridge to the ORIGINAL IL2CPP setters. Never writes Unity memory. */
const BUILD_SHA256 = 'e332b42051b117e0492744084cd5065ba6fd7d38b0178876bed500106ada35ba';
export const DOOR_IDS = Object.freeze({ LF: 1, LB: 2, RF: 4, RB: 8 });
const IDS = Object.values(DOOR_IDS);

/** Must be awaited after Unity has loaded and selected the exterior scene.
 * wasmUrl must identify the unchanged wasm used by this instance. Build-specific,
 * intentionally fails closed on changed builds, missing tables, or ambiguous cars.
 */
export async function createDoorControls(unityInstance, { wasmUrl = '/unity-player/Build/ZY.wasm' } = {}) {
  const M = unityInstance?.Module;
  if (!M?.asm?._g || !M.HEAPU32) throw new Error('Original loaded Unity Module is required.');
  const response = await fetch(wasmUrl);
  if (!response.ok) throw new Error(`Cannot verify Unity build: ${response.status}`);
  const hash = await sha256(await response.arrayBuffer());
  if (hash !== BUILD_SHA256) throw new Error('Unsupported Unity build; original door bridge disabled.');
  const word = p => M.HEAPU32[p >>> 2];
  const pointer = p => Number.isInteger(p) && p >= 1024 && p % 4 === 0 && p + 352 < M.HEAPU8.length;
  const string = p => {
    if (!Number.isInteger(p) || p < 1024 || p >= M.HEAPU8.length) return '';
    let s = '';
    for (let i = 0; i < 128 && M.HEAPU8[p + i]; i++) s += String.fromCharCode(M.HEAPU8[p + i]);
    return s;
  };
  const className = p => pointer(p) && pointer(word(p)) ? string(word(word(p) + 8)) : '';
  const namespace = p => pointer(p) && pointer(word(p)) ? string(word(word(p) + 12)) : '';
  // Original Il2CppCodeGenModule: name/count/methodPointers. Verify all slots.
  const module = 2069616;
  if (string(word(module)) !== 'com.ziz.configurator.Runtime.dll' || word(module + 4) !== 206) {
    throw new Error('IL2CPP codegen registration does not match verified build.');
  }
  const methods = word(module + 8);
  const slots = { setDoor: 26448, setWindow: 26453, toggleDoor: 26447, toggleWindow: 26452 };
  for (const [token, slot] of [[0x42, slots.setDoor], [0x47, slots.setWindow], [0x41, slots.toggleDoor], [0x46, slots.toggleWindow]]) {
    if (word(methods + (token - 1) * 4) !== slot || typeof M.asm._g.get(slot) !== 'function') {
      throw new Error('Original method registration mismatch.');
    }
  }
  const dictionary = p => {
    if (!pointer(p) || !className(p).startsWith('Dictionary') || word(p + 16) !== 4) return null;
    const entries = word(p + 12);
    if (!pointer(entries) || word(entries + 12) < 4) return null;
    const out = {};
    for (let i = 0; i < 4; i++) {
      const e = entries + 16 + i * 16;
      const id = word(e + 8), anim = word(e + 12);
      if (!IDS.includes(id) || !pointer(anim) || !className(anim).includes('Anim')) return null;
      out[id] = anim;
    }
    return Object.keys(out).length === 4 ? out : null;
  };
  const cars = [];
  // Each mount resolves live addresses anew; only type-validated object headers.
  const H = M.HEAPU32;
  let carClass = 0;
  for (let i = 256; i < H.length - 88; i++) {
    const k = H[i];
    if (carClass) {
      if (k !== carClass) continue;
    } else {
      if (!pointer(k) || string(word(k + 8)) !== 'CarConfigurator' || string(word(k + 12)) !== 'Configurator') continue;
      carClass = k;
    }
    const p = i * 4;
    if (word(p + 4) !== 0 || !dictionary(word(p + 292)) || !dictionary(word(p + 296))) continue;
    if (![168, 172, 176, 180].every(o => className(word(p + o)).startsWith('Trigger') && namespace(word(p + o)) === 'Configurator')) continue;
    cars.push(p);
  }
  const linked = new Set();
  for (let i = 256; i < H.length - 14; i++) {
    if (!cars.includes(H[i + 13])) continue;
    if (className(i * 4) === 'Main' && namespace(i * 4) === 'Configurator' && word(i * 4 + 4) === 0) linked.add(H[i + 13]);
  }
  if (linked.size !== 1) throw new Error('No unambiguous live Main.car with four door/window animations.');
  const car = [...linked][0];
  const idOf = id => {
    const value = typeof id === 'string' ? DOOR_IDS[id] : id;
    if (!IDS.includes(value)) throw new RangeError('Door ID must be LF/LB/RF/RB or 1/2/4/8.');
    return value;
  };
  const check = () => {
    if (className(car) !== 'CarConfigurator' || !dictionary(word(car + 292)) || !dictionary(word(car + 296))) {
      throw new Error('Unity scene changed; recreate door controls for this mount.');
    }
  };
  const set = (slot, id, open, animate) => {
    check();
    if (typeof open !== 'boolean' || typeof animate !== 'boolean') throw new TypeError('open and animate must be booleans.');
    M.asm._g.get(slot)(car, idOf(id), Number(open), Number(animate), 0);
    return { dispatched: true }; // Actual phase must be observed, not inferred.
  };
  const toggle = (slot, id) => { check(); M.asm._g.get(slot)(car, idOf(id), 0); return { dispatched: true }; };
  const read = offset => {
    const entries = dictionary(word(car + offset));
    return Object.fromEntries(Object.entries(DOOR_IDS).map(([name, id]) => {
      const a = entries[id];
      return [name, { phase: M.HEAPF32[(a + 32) >>> 2], direction: M.HEAPF32[(a + 40) >>> 2] }];
    }));
  };
  return Object.freeze({
    buildHash: hash,
    setDoor: (id, open, animate = true) => set(slots.setDoor, id, open, animate),
    setWindow: (id, open, animate = true) => set(slots.setWindow, id, open, animate),
    toggleDoor: id => toggle(slots.toggleDoor, id),
    toggleWindow: id => toggle(slots.toggleWindow, id),
    getState() { check(); return { doors: read(292), windows: read(296) }; },
  });
}
