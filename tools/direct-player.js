import { CarPlayer, PAINTS, INTERIORS } from '../components/car-player.js';
const status = document.getElementById('status');
const player = new CarPlayer(document.getElementById('stage'));
window.car = player;
player.canvas.id = 'unity-canvas';
player.addEventListener('progress', event => { status.textContent = `加载模型 ${Math.round(event.detail.progress * 100)}%`; });
player.addEventListener('error', event => { status.textContent = `加载失败：${event.detail.message}`; });
player.addEventListener('ready', () => {
  status.textContent = '3D 已就绪';
  document.querySelectorAll('.color').forEach(button => { button.disabled = false; });
});
for (const [selector, method, names, label] of [
  ['.color[data-code]', 'setPaint', PAINTS, 'color-name'],
  ['.color[data-interior]', 'setInterior', INTERIORS, 'interior-name'],
]) {
  document.querySelectorAll(selector).forEach(button => button.addEventListener('click', async () => {
    try {
      const code = button.dataset.code ?? button.dataset.interior;
      await player[method](code);
      document.querySelectorAll(selector).forEach(other => other.classList.toggle('selected', other === button));
      document.getElementById(label).textContent = names[code];
    } catch (error) { status.textContent = error.message; }
  }));
}
document.getElementById('expand').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.getElementById('stage').requestFullscreen();
  } catch (error) { status.textContent = `无法进入全屏：${error.message}`; }
});
