import { CarPlayer, PAINTS, INTERIORS } from '../components/car-player.js';
import { pwaReady } from '../components/pwa-client.js';

const $ = id => document.getElementById(id);
const root = $('showroom');
let player, ready = false, busy = false, restarting = false, toastTimer;
const paints = { QGJ: '#bcb29b', XYH: '#25282a', JSH: '#777d80', NUB: '#eee' };
const interiors = { R: '#9b4f45', P: '#27384c', Q: '#eee8dd' };

function notify(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200);
}
function availability() {
  document.querySelectorAll('[data-method]').forEach(button => { button.disabled = !ready || busy; });
}
function swatches(id, names, colors, method, initial) {
  for (const [code, name] of Object.entries(names)) {
    const button = document.createElement('button');
    button.className = 'swatch';
    button.dataset.method = method;
    button.dataset.value = JSON.stringify(code);
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-pressed', String(code === initial));
    const sample = document.createElement('i');
    sample.style.background = colors[code];
    const label = document.createElement('span');
    label.textContent = name;
    button.append(sample, label);
    $(id).append(button);
  }
}
function row(container, label, method, values, prefix = []) {
  const element = document.createElement('div');
  element.className = 'control-row';
  const name = document.createElement('span');
  name.textContent = label;
  const pair = document.createElement('div');
  pair.className = 'pair';
  for (const [text, value] of values) {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.method = method;
    button.dataset.args = JSON.stringify([...prefix, value]);
    button.setAttribute('aria-label', `${label}：${text}`);
    button.setAttribute('aria-pressed', 'false');
    pair.append(button);
  }
  element.append(name, pair);
  $(container).append(element);
}
swatches('paints', PAINTS, paints, 'setPaint', 'QGJ');
swatches('interiors', INTERIORS, interiors, 'setInterior', 'R');
for (const [id, label] of Object.entries({ LF: '左前', RF: '右前', LB: '左后', RB: '右后' })) {
  row('openings', `${label}车门`, 'setDoor', [['打开', true], ['关闭', false]], [id]);
  row('openings', `${label}车窗`, 'setWindow', [['降下', true], ['升起', false]], [id]);
}
for (const [label, method] of [['前大灯', 'setHeadlights'], ['日间行车灯', 'setDaytimeRunningLights'], ['位置灯', 'setPositionLights']])
  row('lights', label, method, [['开启', true], ['关闭', false]]);
row('vehicle', '后视镜', 'setMirrors', [['展开', true], ['折叠', false]]);
row('vehicle', '锁车演示', 'setLocked', [['锁车', true], ['解锁', false]]);
row('vehicle', '驾驶演示', 'setDriving', [['开始', true], ['停止', false]]);
row('charging', '充电盖板', 'setChargingPortOpen', [['打开', true], ['关闭', false]]);
row('charging', '充电流光', 'setCharging', [['开启', true], ['关闭', false]]);
row('charging', '充电线缆', 'setChargingCableVisible', [['显示', true], ['隐藏', false]]);

function syncSelection() {
  const state = player.getState().requested;
  $('color-name').textContent = PAINTS[state.paint];
  $('interior-name').textContent = INTERIORS[state.interior];
  const keys = { setPaint: 'paint', setInterior: 'interior', setCameraPreset: 'camera', setWheelType: 'wheelType', setHeadlights: 'headlights', setDaytimeRunningLights: 'daytimeRunningLights', setPositionLights: 'positionLights', setDriving: 'driving', setLocked: 'locked', setCharging: 'charging', setChargingCableVisible: 'chargingCableVisible', setChargingPortOpen: 'chargingPortOpen' };
  document.querySelectorAll('[data-method]').forEach(button => {
    const method = button.dataset.method;
    const args = argumentsFor(button);
    let selected;
    if (keys[method]) {
      const value = state[keys[method]];
      selected = value !== undefined && (typeof args[0] === 'boolean' ? Boolean(value) === args[0] : value === args[0]);
    }
    else if (method === 'setMirrors') selected = state.mirrorsFolded !== undefined && !state.mirrorsFolded === args[0];
    else if (method === 'setDoor' || method === 'setWindow') selected = state[method === 'setDoor' ? 'doors' : 'windows']?.[args[0]] === args[1];
    else if (method === 'enterInterior' || method === 'exitInterior') selected = state.viewMode === (method === 'enterInterior' ? 'interior' : 'exterior');
    if (selected !== undefined) button.setAttribute('aria-pressed', String(selected));
  });
}
function argumentsFor(button) {
  if (button.dataset.args) return JSON.parse(button.dataset.args);
  return button.dataset.value === undefined ? [] : [JSON.parse(button.dataset.value)];
}
root.addEventListener('click', async event => {
  const button = event.target.closest('[data-method]');
  if (!button || !ready || busy) return;
  busy = true;
  button.setAttribute('aria-busy', 'true');
  availability();
  $('status').textContent = '正在应用设置…';
  try {
    await player[button.dataset.method](...argumentsFor(button));
    syncSelection();
    $('status').textContent = '设置已发送 · 请欣赏模型效果';
    if (['setLocked', 'setMirrors'].includes(button.dataset.method)) notify('指令已发送 · 后视镜与灯光联动演示');
    else if (button.dataset.method === 'toggleTrunk') notify('尾门切换指令已发送');
  } catch (error) {
    $('status').textContent = '设置未成功，请重试';
    notify(error.message);
  } finally {
    busy = false;
    button.removeAttribute('aria-busy');
    availability();
  }
});
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach(other => {
    const active = other === button;
    other.classList.toggle('active', active);
    other.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-section]').forEach(section => { section.hidden = section.dataset.section !== button.dataset.tab; });
}));
function immersion(on) {
  root.classList.toggle('immersive', on);
  $('immerse').setAttribute('aria-pressed', String(on));
  $('restore').hidden = !on;
  (on ? $('restore') : $('immerse')).focus();
}
let immersiveFullscreen = false;
$('immerse').addEventListener('click', async () => {
  immersion(true);
  try {
    if (root.requestFullscreen) await root.requestFullscreen();
    else notify('已进入沉浸欣赏，当前浏览器不支持原生全屏');
  } catch { notify('已进入沉浸欣赏，浏览器未允许原生全屏'); }
});
async function restoreView() {
  immersion(false);
  if (document.fullscreenElement === root) {
    try { await document.exitFullscreen(); }
    catch { notify('请使用浏览器全屏退出操作'); }
  }
}
$('restore').addEventListener('click', restoreView);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && root.classList.contains('immersive')) restoreView();
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === root) immersiveFullscreen = true;
  else if (immersiveFullscreen) { immersiveFullscreen = false; immersion(false); }
});
function failed(error) {
  ready = false;
  availability();
  $('loading').hidden = false;
  $('loading-title').textContent = '暂时无法打开展厅';
  $('loading-copy').textContent = error.message || '资源加载失败，请检查网络后重试。';
  $('load-phase').textContent = '加载未完成';
  $('retry').hidden = false;
  $('status').textContent = '加载失败';
  $('status-dot').classList.remove('ready');
}
async function mount() {
  ready = false;
  availability();
  $('loading').hidden = false;
  $('retry').hidden = true;
  $('progress').value = 0;
  $('percent').textContent = '0%';
  $('loading-title').textContent = '正在准备您的展厅';
  $('loading-copy').textContent = '首次加载需下载约 46 MB 原始模型资源，请稍候。';
  $('load-phase').textContent = '下载模型资源';
  $('status').textContent = '模型准备中';
  try {
    player = new CarPlayer($('stage'), { timeoutMs: 240000 });
    window.car = player;
    player.canvas.classList.add('car-canvas');
    player.addEventListener('progress', event => {
      const value = Math.max($('progress').value, Math.min(1, Math.max(0, event.detail.progress)));
      $('progress').value = value;
      $('percent').textContent = `${Math.round(value * 100)}%`;
      if (value >= 1) {
        $('load-phase').textContent = '初始化模型与材质';
        $('loading-title').textContent = '即将与知音相见';
        $('loading-copy').textContent = '资源已加载，正在准备3D引擎与交互。';
      }
    });
    player.addEventListener('error', event => failed(event.detail));
    await player.ready();
    ready = true;
    $('loading').hidden = true;
    $('status').textContent = '3D 展厅已就绪';
    $('status-dot').classList.add('ready');
    syncSelection();
    availability();
  } catch (error) { failed(error); }
}
$('retry').addEventListener('click', async () => {
  if (restarting) return;
  restarting = true;
  $('retry').disabled = true;
  try {
    if (player) await player.destroy();
    await mount();
  } catch (error) { failed(error); }
  finally { restarting = false; $('retry').disabled = false; }
});
await pwaReady;
mount();
