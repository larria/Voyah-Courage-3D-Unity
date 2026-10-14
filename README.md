# 全新岚图知音 · 官网原版外观 3D

## 启动

```bash
python tools/serve.py
```

访问 http://127.0.0.1:18743/index.html 。需要 HTTP 服务，不能双击 HTML 使用 file://。

## 当前版本：单页 Canvas 直出

主页面已移除 iframe，直接启动原始 Unity canvas。原始 `unity-player/index.html` 保留作为对照入口，不是主页面依赖。

展示高度自适应：桌面约窗口高度76%，手机约68%，有最小/最大高度保护；支持全屏。放大仍可能因相机近距离而裁切，增加画布高度不是无限缩放保证。

控制层预备接口：

```js
await window.car.ready();
await window.car.setPaint('XYH'); // QGJ / XYH / JSH / NUB
await window.car.setInterior('P'); // 深海蓝：R旭日红 / P深海蓝 / Q皓月白
await window.car.setHeadlights(true);
await window.car.setDriving(true);
window.car.getCapabilities();
```

独立 ES module 组件位于 `components/car-player.js`，规范接口与限制见 `components/API.md`；独立测试页 http://127.0.0.1:18743/examples/api.html 。已补三种真实内饰材质切换，并实测大灯和行驶开关、销毁与重挂载。门窗尾门可靠API尚未打通；32个原始API方法的实验通道可用于继续验证，不等于全部功能通过。

`verification/direct-check.json`：桌面1280×900画布展示高684px，手机390×844展示高574px；按钮换色、全屏及无效颜色保护通过。同609×300视口、DPR=2且排除界面覆盖层时，直出模型截图与官网参考逐像素相同。改变展示区尺寸后构图自然变化，不等于整页截图与官网一致。

## 实现范围

- 原始 Unity WebGL 模型、Shader、贴图、光照、动画与射线热点完整保留，没有用 Three.js 重建。
- 提供外观展示、四种官网车漆、三种官网内饰配色和全屏。内饰配色会改变真实模型材质；不自动切换内饰相机。
- Unity 共用包内部含透过玻璃可见的内饰几何，不能删除而不改变外观画面。
- 参考目录只读，所有实现文件及验证资源位于本目录。

## 资源真实性

`verification/resource-hashes.json` 保存官网与参考逐字节验证结果。loader、framework、wasm、data、$.js 全部一致。

外观颜色是实际官网捕获的消息：exteriorTab/QGJ 初始化，exterior/QGJ、XYH、JSH、NUB 分别香槟金、玄英黑、宸星灰、杜若白。

## 当前验收状态（不是全部功能通过）

已通过：
- 核心构建文件 SHA-256 一致。
- 相同 Chromium、609×300 CSS 视口、DPR=2 下默认画面和四种车漆像素相同。
- 模型运行时不需要外网：阻断非本地请求后仍完成加载与换色。
- 真实鼠标点击前门成功开门，终态与官网逐像素相同。

未完成/未通过：
- 连续点击序列部分终态截图存在误差，详见 comparison.json。不能据此宣称全部状态像素一致。
- 四窗最大下降位置、后窗约4/5限制、尾门、其他门、动画中间帧/时长、转动缩放和其他视口尚未完成逐项验收。
- 外层页面为简化外观控制界面，不是完整官网UI像素复刻。

## 重要排错发现

参考README将 triggerDoorWindowLF、triggerTrunk等名称列为API是错误的。实际IL2CPP元数据中这些是 CarConfigurator 的热点字段，不是可调用方法；API对象也没有这些方法。verification/exterior-check.py 的历史无参调用无画面变化，不能当作开窗或尾门验证成功。

真正窗热点是 TriggerBounds（Tiggle_LF/LB/RF/RB），门是 Door_LF/LB/RF/RB。控制程序与热点保持官网原版，不凭猜测修改。

Playwright瞬时mouse.click可能被Unity帧采样漏掉：需要mouse.move、停顿、mouse.down、停顿、mouse.up。早期未观察图像变化的“点击状态相同”不能作为动作成功证据；最新compare.py已使用分步输入。

## 验证证据

- verification/compare.py 与 comparison.json：实际输入及画面对照。
- verification/official-*.png、local-*.png、diff-*.png：官网、本地、差分。
- verification/exterior-check.json：车色、运行请求及旧API调用探测；changed_from_gold=false的探测不证明动作成功。

官网资源入口：https://configuration-3d-web.dsmp.voyah.com.cn/voyah-app-h37b/index.html
