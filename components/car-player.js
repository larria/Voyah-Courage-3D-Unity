import { createRuntimeControls } from './runtime-controls.js';
import { createDoorControls } from './door-controls.js';
import { createChargingControls } from './charging-controls.js';
const active = { player: null };
const loaders = new Map();
let canvasSequence = 0;
export const PAINTS = Object.freeze({ QGJ: '香槟金', XYH: '玄英黑', JSH: '宸星灰', NUB: '杜若白' });
export const INTERIORS = Object.freeze({ R: '旭日红', P: '深海蓝', Q: '皓月白' });
export const DOORS = Object.freeze({ LF: 1, LB: 2, RF: 4, RB: 8 });
const integerMethods = ['setCarPaint','setInteriorMaterial','setWheelType','setVersion','setRearview','setFrontLight','setDaytimeRunningLight','setpositionLampLight','setRearLogoLightLight','setCarChargingCable','setCarDoorHandle','setCarseat','jumpState','carCameraperspective','carLockStatus','carlightStatus','carSetDaytimeRunningLight','carsetpositionLampLight','carsetRearLogoLightLight','carDrivingStatus'];
const stringMethods = ['featureCodesUrl','versionTab','exteriorTab','hubTab','interiorTab','version','package','exterior','hub','interior','carStatusScene'];
const zeroMethods = ['setLightBinker','carControlFindCar'];
export const RUNTIME_METHODS = Object.freeze(Object.fromEntries([
  ...integerMethods.map(name => [name, 'integer']),
  ...stringMethods.map(name => [name, 'string']),
  ...zeroMethods.map(name => [name, 'none']),
]));
export class CarPlayerError extends Error {
  constructor(code, message) { super(message); this.name = 'CarPlayerError'; this.code = code; }
}
function loadLoader(url) {
  if (loaders.has(url)) return loaders.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new CarPlayerError('LOAD_FAILED', '无法加载 Unity loader')); };
    document.head.append(script);
  });
  loaders.set(url, promise);
  promise.catch(() => loaders.delete(url));
  return promise;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/** One original Unity runtime per document. Command resolution means dispatched, not observed. */
export class CarPlayer extends EventTarget {
  constructor(container, options = {}) {
    super();
    if (!(container instanceof HTMLElement)) throw new CarPlayerError('INVALID_ARGUMENT', 'container 必须是 HTML 元素');
    if (active.player) throw new CarPlayerError('INSTANCE_ACTIVE', '原版 Unity 当前限定为单实例；请先 await destroy()');
    const timeout = options.timeoutMs ?? 120000;
    if (!Number.isFinite(timeout) || timeout <= 0) throw new CarPlayerError('INVALID_ARGUMENT', 'timeoutMs 必须为正数');
    this._paint = options.paint ?? 'QGJ'; this._interior = options.interior ?? 'R';
    if (!Object.hasOwn(PAINTS, this._paint) || !Object.hasOwn(INTERIORS, this._interior)) throw new CarPlayerError('INVALID_ARGUMENT', '初始化颜色不支持');
    this._features = options.featureCodes ?? 'LDB,T,DR19,MPVALLSHEHAHF';
    if (typeof this._features !== 'string') throw new CarPlayerError('INVALID_ARGUMENT', 'featureCodes 必须为字符串');
    this._base = new URL(options.assetBaseUrl ?? '../unity-player/', import.meta.url);
    if (!this._base.pathname.endsWith('/')) this._base.pathname += '/';
    this.canvas = document.createElement('canvas');
    do { this.canvas.id = `voyah-canvas-${++canvasSequence}`; }
    while (document.getElementById(this.canvas.id));
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('aria-label', '岚图知音三维模型');
    Object.assign(this.canvas.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none', background: 'transparent' });
    container.append(this.canvas);
    this._phase = 'loading'; this._requested = {}; this._sequence = 0; this._disposed = false;
    active.player = this;
    this._ready = new Promise((resolve, reject) => { this._resolve = resolve; this._reject = reject; });
    this._ready.catch(() => {});
    this._timer = setTimeout(() => this._fail(new CarPlayerError('TIMEOUT', '模型初始化超时，请销毁后重试')), timeout);
    this._bootPromise = this._boot();
    // Experimental calls use only metadata-confirmed API signatures, never guessed fields.
    this.experimental = Object.freeze({
      invoke: (method, value) => this._invokeExperimental(method, value),
      methods: RUNTIME_METHODS,
    });
  }
  _emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  _assertAlive() { if (this._disposed) throw new CarPlayerError('DESTROYED', '组件已销毁'); }
  _fail(error) {
    if (this._disposed || this._phase === 'error') return;
    clearTimeout(this._timer); this._phase = 'error'; this._reject(error); this._emit('error', error);
  }
  async _boot() {
    try {
      await loadLoader(new URL('Build/ZY.loader.js', this._base).href);
      if (this._disposed || this._phase === 'error') return;
      const url = path => new URL(path, this._base).href;
      const instance = await window.createUnityInstance(this.canvas, {
        dataUrl: url('Build/ZY.data'), frameworkUrl: url('Build/ZY.framework.js'), codeUrl: url('Build/ZY.wasm'),
        streamingAssetsUrl: url('StreamingAssets'), companyName: 'EAST', productName: 'ZG', productVersion: '0.1',
        showBanner: (message, type) => { this._emit('runtime-log', { message, type }); if (type === 'error') this._fail(new CarPlayerError('RUNTIME_ERROR', message)); },
      }, progress => { if (!this._disposed) this._emit('progress', { progress }); });
      this._instance = instance;
      if (this._disposed || this._phase === 'error') { await instance.Quit(); this._instance = null; return; }
      this._phase = 'initializing';
      await delay(200);
      if (this._disposed || this._phase === 'error') return;
      instance.SendMessage('API', 'featureCodesUrl', this._features);
      await delay(200);
      if (this._disposed || this._phase === 'error') return;
      instance.SendMessage('API', 'exteriorTab', this._paint);
      instance.SendMessage('API', 'interior', this._interior);
      this._requested = { paint: this._paint, interior: this._interior };
      this._phase = 'ready'; clearTimeout(this._timer); this._resolve(this); this._emit('ready', this.getState());
    } catch (error) { this._fail(error instanceof CarPlayerError ? error : new CarPlayerError('LOAD_FAILED', String(error))); }
  }
  ready() { return this._ready; }
  getState() { return { lifecycle: this._phase, requested: structuredClone(this._requested), observed: null }; }
  getCapabilities() {
    return {
      verified: ['setPaint','setInterior','setHeadlights','setDriving','setWheelType','toggleTrunk','setDoor','setWindow'],
      preview: ['setMirrors','setCameraPreset','setDaytimeRunningLights','setPositionLights','setLocked','flashTurnSignals','findCar'],
      experimental: Object.keys(RUNTIME_METHODS),
      unavailable: ['setTrunk','setDoorSpeed','setWheelAngle'],
      buildSpecific: ['setDoor','setWindow','setCharging','setChargingCableVisible'],
      stateReadback: false, multipleInstances: false,
    };
  }
  async _send(method, value, stateKey) {
    this._assertAlive(); await this._ready; this._assertAlive();
    if (value === undefined) this._instance.SendMessage('API', method);
    else this._instance.SendMessage('API', method, value);
    if (stateKey) this._requested[stateKey] = value;
    const result = { id: ++this._sequence, method, value, status: 'dispatched', observed: false };
    this._emit('command', result); return result;
  }
  setPaint(code) {
    if (!Object.hasOwn(PAINTS, code)) return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', 'paint 必须为 QGJ/XYH/JSH/NUB'));
    return this._send('exterior', code, 'paint');
  }
  setInterior(code) {
    if (!Object.hasOwn(INTERIORS, code)) return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', 'interior 必须为 R/P/Q'));
    return this._send('interior', code, 'interior');
  }
  _boolean(method, value, key) {
    if (typeof value !== 'boolean') return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', '状态必须为 boolean'));
    return this._send(method, value ? 1 : 0, key);
  }
  setHeadlights(on) { return this._boolean('setFrontLight', on, 'headlights'); }
  setDriving(on) { return this._boolean('carDrivingStatus', on, 'driving'); }
  // Original setRearview uses 1 for folded, 0 for expanded and also changes lighting.
  setMirrors(expanded) {
    if (typeof expanded !== 'boolean') return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', '状态必须为 boolean'));
    return this._send('setRearview', expanded ? 0 : 1, 'mirrorsFolded');
  }
  setDaytimeRunningLights(on) { return this._boolean('setDaytimeRunningLight', on, 'daytimeRunningLights'); }
  setPositionLights(on) { return this._boolean('setpositionLampLight', on, 'positionLights'); }
  setLocked(locked) { return this._boolean('carLockStatus', locked, 'locked'); }
  flashTurnSignals() { return this._send('setLightBinker'); }
  findCar() { return this._send('carControlFindCar'); }
  setWheelType(index) {
    if (!Number.isInteger(index) || index < 0 || index > 1) return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', '轮毂 index 仅支持已验证的 0 或 1'));
    return this._send('setWheelType', index, 'wheelType');
  }
  setCameraPreset(index) {
    if (!Number.isInteger(index) || index < 0 || index > 2) return Promise.reject(new CarPlayerError('UNSUPPORTED', '目前仅支持已探测相机 preset=0/1/2，其余请使用实验接口'));
    return this._send('carCameraperspective', index, 'camera');
  }
  async _getChargingControls() {
    this._assertAlive(); await this._ready; this._assertAlive();
    if (!this._chargingControlsPromise) {
      const instance = this._instance;
      const pending = createChargingControls(instance, {
        wasmUrl: new URL('Build/ZY.wasm', this._base).href,
        dataUrl: new URL('Build/ZY.data', this._base).href,
        isAlive: () => !this._disposed && this._phase === 'ready' && this._instance === instance,
      }).then(controls => {
        this._assertAlive();
        if (this._instance !== instance) throw new CarPlayerError('DESTROYED', '运行实例已变化');
        return controls;
      }).catch(error => {
        if (this._chargingControlsPromise === pending) this._chargingControlsPromise = null;
        this._assertAlive();
        throw error instanceof CarPlayerError ? error : new CarPlayerError('UNSUPPORTED_BUILD', error.message);
      });
      this._chargingControlsPromise = pending;
    }
    return this._chargingControlsPromise;
  }
  async _setChargingControl(method, value) {
    if (typeof value !== 'boolean') throw new CarPlayerError('INVALID_ARGUMENT', '充电状态必须为 boolean');
    const controls = await this._getChargingControls(); this._assertAlive();
    try { controls[method](value); }
    catch (error) { throw new CarPlayerError('UNSUPPORTED_BUILD', error.message); }
    this._requested.charging = method === 'setCharging' && value;
    this._requested.chargingCableVisible = value;
    const result = { id: ++this._sequence, method, value, status: 'dispatched', observed: false };
    this._emit('command', result); return result;
  }
  setCharging(on) { return this._setChargingControl('setCharging', on); }
  setChargingCableVisible(visible) { return this._setChargingControl('setChargingCableVisible', visible); }
  async _getDoorControls() {
    this._assertAlive(); await this._ready; this._assertAlive();
    if (!this._doorControlsPromise) {
      const instance = this._instance;
      this._doorControlsPromise = createDoorControls(instance, { wasmUrl: new URL('Build/ZY.wasm', this._base).href }).then(controls => {
        this._assertAlive();
        if (this._instance !== instance) throw new CarPlayerError('DESTROYED', '运行实例已变化');
        return controls;
      }).catch(error => {
        this._doorControlsPromise = null;
        throw error instanceof CarPlayerError ? error : new CarPlayerError('UNSUPPORTED_BUILD', error.message);
      });
    }
    return this._doorControlsPromise;
  }
  async _setOpening(kind, id, open, { animate = true } = {}) {
    if (!Object.hasOwn(DOORS, id) || typeof open !== 'boolean' || typeof animate !== 'boolean') {
      throw new CarPlayerError('INVALID_ARGUMENT', 'id 必须为 LF/LB/RF/RB，open 和 animate 必须为 boolean');
    }
    const controls = await this._getDoorControls(); this._assertAlive();
    controls[kind === 'door' ? 'setDoor' : 'setWindow'](id, open, animate);
    const key = kind === 'door' ? 'doors' : 'windows';
    this._requested[key] = { ...this._requested[key], [id]: open };
    const result = { id: ++this._sequence, method: kind === 'door' ? 'setDoor' : 'setWindow', door: id, open, animate, status: 'dispatched', observed: false };
    this._emit('command', result); return result;
  }
  setDoor(id, open, options) { return this._setOpening('door', id, open, options); }
  setWindow(id, open, options) { return this._setOpening('window', id, open, options); }
  async toggleTrunk() {
    this._assertAlive(); await this._ready; this._assertAlive();
    createRuntimeControls(this._instance).toggleTrunk();
    const result = { id: ++this._sequence, target: '/ZY', method: 'toggleTrunk', status: 'dispatched', observed: false };
    this._emit('command', result); return result;
  }
  setTrunk() { return Promise.reject(new CarPlayerError('UNSUPPORTED', '尾门已支持 toggleTrunk；无真实回读，不能提供幂等 setTrunk')); }
  _invokeExperimental(method, value) {
    const signature = RUNTIME_METHODS[method];
    if (!signature) return Promise.reject(new CarPlayerError('UNSUPPORTED', '不是元数据确认的 API 方法'));
    if ((signature === 'integer' && !Number.isInteger(value)) || (signature === 'string' && typeof value !== 'string') || (signature === 'none' && value !== undefined)) {
      return Promise.reject(new CarPlayerError('INVALID_ARGUMENT', `${method} 参数类型必须为 ${signature}`));
    }
    return this._send(method, value);
  }
  destroy() {
    if (this._destroyPromise) return this._destroyPromise;
    this._disposed = true; clearTimeout(this._timer); this._phase = 'destroying';
    this._reject(new CarPlayerError('DESTROYED', '组件已销毁'));
    this._destroyPromise = (async () => {
      // Do not release the single-instance lock while a late Unity boot is still pending.
      await this._bootPromise;
      if (this._instance) { await this._instance.Quit(); this._instance = null; }
      this.canvas.remove(); this._phase = 'destroyed'; if (active.player === this) active.player = null;
      this._emit('destroyed', this.getState());
    })();
    return this._destroyPromise;
  }
}
