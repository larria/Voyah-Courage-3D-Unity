(() => {
  const canvas = document.getElementById('unity-canvas');
  const status = document.getElementById('status');
  const paints = { QGJ: '香槟金', XYH: '玄英黑', JSH: '宸星灰', NUB: '杜若白' };
  let instance;
  let resolveReady;
  let rejectReady;
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // Keep loading failures visible even when no external consumer awaits ready().
  ready.catch(() => {});
  window.car = Object.freeze({
    ready: () => ready,
    async setPaint(code) {
      if (!Object.hasOwn(paints, code)) throw new Error(`不支持的车色：${code}`);
      await ready;
      instance.SendMessage('API', 'exterior', code);
      document.querySelectorAll('.color').forEach(button => {
        button.classList.toggle('selected', button.dataset.code === code);
      });
      document.getElementById('color-name').textContent = paints[code];
    },
    capabilities: Object.freeze(['setPaint']),
  });

  const config = {
    dataUrl: 'unity-player/Build/ZY.data',
    frameworkUrl: 'unity-player/Build/ZY.framework.js',
    codeUrl: 'unity-player/Build/ZY.wasm',
    streamingAssetsUrl: 'unity-player/StreamingAssets',
    companyName: 'EAST', productName: 'ZG', productVersion: '0.1',
    showBanner(message, type) {
      if (type === 'error') status.textContent = `运行错误：${message}`;
      else console.warn(message);
    },
  };
  createUnityInstance(canvas, config, progress => {
    status.textContent = `加载模型 ${Math.round(progress * 100)}%`;
  }).then(async unity => {
    instance = unity;
    // Match the original player initialization order without iframe messaging.
    await new Promise(resolve => setTimeout(resolve, 200));
    instance.SendMessage('API', 'featureCodesUrl', 'LDB,T,DR19,MPVALLSHEHAHF');
    await new Promise(resolve => setTimeout(resolve, 200));
    instance.SendMessage('API', 'exteriorTab', 'QGJ');
    status.textContent = '外观 3D 已就绪';
    document.querySelectorAll('.color').forEach(button => { button.disabled = false; });
    resolveReady(window.car);
  }).catch(error => {
    status.textContent = `加载失败：${error.message || error}`;
    rejectReady(error);
  });

  document.querySelectorAll('.color').forEach(button => {
    button.addEventListener('click', () => {
      window.car.setPaint(button.dataset.code).catch(error => { status.textContent = error.message; });
    });
  });
  document.getElementById('expand').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.getElementById('stage').requestFullscreen();
    } catch (error) { status.textContent = `无法进入全屏：${error.message}`; }
  });
})();
