# 全新岚图知音 3D 模型与 JavaScript 组件

可离线部署的三维车辆展示页面及 ES module 组件。模型由原始 Unity WebGL 程序渲染，网页直接使用 canvas，无 iframe、无需 npm 构建，也不依赖在线 CDN。

开发与逆向过程、疑难点和版本维护说明见 [DEVELOPMENT.md](./DEVELOPMENT.md)。用户贴出的配置代码/内饰索引红色日志属于原始程序的调试输出；本次实际检查无JavaScript异常或请求失败，未全局屏蔽错误日志。

## 功能概览

- 旋转、缩放、模型原生点击交互。
- 四种外观车色、三种内饰配色；`enterInterior(code?)` / `exitInterior()` 进入内饰与返回外观，API 页提供两个独立按钮。
  `setInterior` 只配色；进入参数严格为 R/P/Q，省略时等 ready 后读取最新请求颜色。退出保留颜色请求；重复不去重，command 前更新 requested.viewMode/interior，结果仍为 dispatched/observed:false，不表示相机回读或动画完成。原始调用可能联动场景/灯光等，不能承诺其他设置全部保持。
  可复跑画面验收：`python3 verification/interior-mode-check.py`（Playwright Chromium、Pillow），子路径无 subtle 时保留 getRandomValues；截图与紧凑 JSON 在 verification 内，服务自动停止。
- 四门、四窗分别开关，支持原始动画或即时切换。
- 尾门切换、两种轮毂、大灯、行驶展示。
- 日行灯、位置灯、后视镜、锁车、寻车、转向闪烁、相机预设等预览接口。
- 加载进度、事件、参数校验、销毁与重新挂载。
- API测试页支持同屏控制：桌面右侧悬浮面板，手机底部面板；面板独立滚动、可折叠，实验控制和日志默认折叠。

部分接口属于预览/实验能力，不代表所有数值及副作用均已验收；详见下文。

## 快速启动

需要 Python 3 与支持 WebGL/WebAssembly、ES module 的现代浏览器。运行不需要安装 Python 第三方库。

```bash
git clone https://gitee.com/larria/zhiyin-3d-model.git
cd zhiyin-3d-model
python tools/serve.py
```

- 首页：`http://127.0.0.1:18743/index.html`
- API控制台：`http://127.0.0.1:18743/examples/api.html`
- 原始播放器：`http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF`

不能通过双击HTML或 `file://` 加载，需要HTTP静态服务器。

### 局域网访问

```bash
python tools/serve.py --host 0.0.0.0 --port 8000
```

在同网络设备访问 `http://<服务器IP>:8000/`。防火墙需允许该端口。开发服务没有登录或访问控制，不建议直接暴露公网。也可使用 Nginx 等正式静态服务器部署。

普通HTTP IP地址下也支持模型和门窗控制：canvas编号不依赖Web Crypto，SHA-256有纯JS备用实现。HTTPS仍推荐用于正式业务环境。

## 离线资源与目录

```text
index.html                    展示首页
components/
  car-player.js               业务组件入口
  door-controls.js            当前构建专用的原始门窗桥
  runtime-controls.js         原始尾门调用
  sha256.js                   HTTP环境下的哈希兼容实现
  API.md                      接口说明
tools/
  direct-player.js             首页适配器
  serve.py                    标准库静态服务器
  extract-metadata.py         可选开发工具
  inspect-scene.py            可选开发工具（需UnityPy）
examples/api.html             同屏API控制台
unity-player/
  Build/ZY.loader.js
  Build/ZY.framework.js
  Build/ZY.wasm
  Build/ZY.data
  index.html                  原始播放器入口
  src/$.js                    原始入口辅助脚本
verification/                 可重跑验证与精简结果
```

四个Build文件合计约43 MiB，必须完整保留，不能仅提交组件JS。`ZY.data`为30,518,614字节，`ZY.wasm`为14,549,545字节。本仓库直接保存完整实体资源，不需要额外下载模型或 Git LFS 拉取。

`offline-manifest.json`列出所有必要运行文件的尺寸与SHA-256。整个页面部署时应保留上述目录结构。首页不依赖verification、开发解析工具或外部网站。

## GitHub 与 GitHub Pages 发布

- 源码：https://github.com/larria/Voyah-Courage-3D-Unity
- Pages：https://larria.github.io/Voyah-Courage-3D-Unity/
- Pages 保留清单中的展示首页；API 控制台位于 `examples/api.html`，不覆盖首页或添加跳转。

首次配置远端（已有时无需重复）：

```bash
git remote add github https://github.com/larria/Voyah-Courage-3D-Unity.git
```

修改完成并提交后，统一发布：

```bash
npm run publish
```

工具默认将同一源码提交同步到 Gitee `main`、GitHub `main`，再生成并推送 GitHub `gh-pages`。需要 Node.js 18+、npm 与 Git；实现仅使用 Node 原生模块，无第三方依赖，无需 npm install、无 npm 构建、无自建 GitHub Actions 工作流。需要两个平台的 Git 写权限；不会自动提交、强推或切换当前分支。发布前检查干净工作区、拉取与推送远端 URL、源码祖先关系以及清单尺寸/SHA-256，清单必须包含后视镜桥。派生站点使用隔离 Git index，以原 gh-pages 提交为父提交，同树复用；失败清理临时导出。每个目标推送后核对 SHA；跨平台不能原子更新，失败时已成功目标保留，使用 `npm run publish -- --revision <源码SHA>` 重试同一版本。

首次推送后，在 GitHub **Settings → Pages** 选择 **Deploy from a branch → gh-pages → / (root)**，点击 Save，等待平台部署。不要选 GitHub Actions。分支推送成功不等于网站已上线，首次必须完成此配置。

可导出已提交版本预览（目录必须在项目内且尚不存在）：

```bash
npm run publish -- --preview .publish/preview/Voyah-Courage-3D-Unity
python -m http.server 18744 --directory .publish/preview
```

访问 `http://127.0.0.1:18744/Voyah-Courage-3D-Unity/` 验证子路径加载及门窗操作。预览可与 `--revision <源码SHA>` 组合，仅读取已提交内容，不要求工作区干净、不访问远端也不推送；失败会清理本次创建的导出目录。工具以 Buffer 读取并校验所有清单资源，保留首页、原始 Build 和原 `offline-manifest.json`，另加入 `.nojekyll` 和 `source-revision.json`。

## 组件集成

容器必须有明确高度。资源默认相对于组件模块URL解析；更换部署结构时显式设置 `assetBaseUrl`。

```html
<div id="vehicle" style="height:70vh;min-height:420px"></div>
<button id="open-door">打开左前门</button>
<script type="module">
import { CarPlayer } from './components/car-player.js';

const car = new CarPlayer(document.querySelector('#vehicle'), {
  paint: 'QGJ',
  interior: 'R',
  featureCodes: 'LDB,T,DR19,MPVALLSHEHAHF',
  timeoutMs: 120000,
  // assetBaseUrl: '/assets/unity-player/'
});
car.addEventListener('progress', e => console.log(e.detail.progress));
car.addEventListener('error', e => console.error(e.detail.code, e.detail.message));
await car.ready();
document.querySelector('#open-door').onclick = async () => {
  try { await car.setDoor('LF', true); }
  catch (error) { console.error(error.code, error.message); }
};
// 页面卸载/路由离开前：await car.destroy();
</script>
```

当前每个document限定一个实例，不能同时挂载两辆车。`destroy()`完成后可创建新实例。组件只管理自身canvas，不生成业务按钮。

### 构造参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `paint` | `QGJ` | 外观颜色代码 |
| `interior` | `R` | 内饰颜色代码 |
| `featureCodes` | `LDB,T,DR19,MPVALLSHEHAHF` | 原始配置字符串；其他组合未完整验证 |
| `assetBaseUrl` | 相对于组件的`../unity-player/` | Unity资源目录，支持绝对URL/路径 |
| `timeoutMs` | `120000` | 初始化超时，正数毫秒 |

### 颜色与位置代码

外观：`QGJ`香槟金、`XYH`玄英黑、`JSH`宸星灰、`NUB`杜若白。  
内饰：`R`旭日红、`P`深海蓝、`Q`皓月白。内饰接口改变真实模型材质，不自动切换相机。  
位置：`LF`左前、`LB`左后、`RF`右前、`RB`右后。

## 公共API

| 方法 | 参数与用途 | 能力 |
|---|---|---|
| `ready()` | Promise，等待初始化 | 生命周期 |
| `setPaint(code)` | 四种外观代码 | 已验证 |
| `setInterior(code)` | 三种内饰代码 | 已验证 |
| `setDoor(id, open, options?)` | 四门；`open`为boolean | 已验证，构建专用 |
| `setWindow(id, open, options?)` | 四窗；true下降，false关闭 | 已验证，构建专用 |
| `toggleTrunk()` | 尾门状态切换 | 已验证，非幂等 |
| `setWheelType(index)` | 仅0/1 | 已验证 |
| `setHeadlights(on)` | boolean大灯开关 | 已验证 |
| `setDriving(on)` | boolean行驶展示开关 | 已验证 |
| `setCharging(on)` | 严格boolean；true请求充电，false请求停止 | 构建专用充电展示 |
| `setChargingCableVisible(visible)` | 严格boolean；独立请求显示/隐藏充电线 | 充电线展示 |
| `setMirrors(expanded)` | true展开、false折叠；会联动灯光 | 预览 |
| `setDaytimeRunningLights(on)` | 日行灯 | 预览 |
| `setPositionLights(on)` | 位置灯 | 预览 |
| `setLocked(locked)` | 严格boolean；true锁车→原始值0，false解锁→1；联动镜子/灯光 | 预览 |
| `flashTurnSignals()` | 原始闪烁效果 | 预览 |
| `findCar()` | 原始寻车效果 | 预览 |
| `setCameraPreset(index)` | 0/1/2；不保证预设业务名称 | 预览 |
| `getState()` | 生命周期与已请求配置 | 无通用真实状态回读 |
| `getCapabilities()` | 已验证/预览/实验/不可用清单 | 能力查询 |
| `destroy()` | Promise，幂等销毁 | 生命周期 |

锁车映射已修正；`requested.locked`保留boolean，command事件记录原始0/1，非法非boolean输入拒绝且不派发命令。`verification/lock-*`保留此前按钮操作与画面证据。后视镜修正采用route1原生暂停步进方案，由构建专用`components/mirror-controls.js`接入公开方法：`setMirrors(true)`展开、`setMirrors(false)`折叠；`setLocked(true)`保留原始`carLockStatus(0)`锁车及灯光联动并请求折叠，false保留原始值1解锁及灯光联动并请求展开。测试页按钮直接调用这些公开方法，无需另设补丁按钮；原始实验命令不包含此修正。

方案校验当前Build的WASM与data SHA-256、原始方法注册、实例类型及唯一Main关联，构建不匹配不得绕过门禁。保留原始3秒smoothstep、原生deltaTime/Update，反向命令从当前phase继续；pre hook保留并调用此前hook，仅将原镜动画以原生pause(1)暂停，防止错误Y轴的原生回调覆盖修正方向。不直接写heap或函数table，不改carType或原始Build，不使用RAF另建动画循环。

真实组件验收见`.publish/mirror-fix-probe/formal-mirror-results.json`、`formal-continuous-results.json`及连续截图：现有按钮展开/折叠、锁车/解锁、快速反向/重复通过，171次采样的原phase与smoothstep最大偏差5.44e-8。`formal-failure-results.json`记录Build mismatch拒绝与异步destroy，连续结果记录销毁不覆盖第三方较新hook。镜桥初始化后的门窗/充电/内饰回归、HTTP无subtle且保留getRandomValues已真实运行，四个Build hash未变；完整断网离线、所有第三方hook组合与全部实验副作用未验收。Promise与command的`dispatched`只表示命令派发，不表示物理动作完成；requested不是Unity真实状态回读，帧内失败停止修正并使后续调用拒绝。

```js
await car.setDoor('LF', true);
await car.setWindow('LB', true);
await car.setWindow('LB', false, { animate: false });
await car.setInterior('P');
await car.setDriving(false);
```

`options.animate`为boolean，默认true。门窗使用原始setter和动画，不手工重建速度或下降幅度。

### 充电展示的正式集成

```js
await car.setCharging(true);
await car.setChargingCableVisible(true);
// 停止充电同时隐藏充电线。
await car.setCharging(false);
await car.setChargingCableVisible(false);
```

`setCharging(true)` 请求充电和线缆均为true；`setCharging(false)` 请求两者均为false。充电线显示/隐藏命令会停止充电流动，并将充电请求更新为false、线缆请求更新为传入值；需要流动效果时应先设置充电线，再调用 `setCharging(true)`。两组按钮分别派发方法，不保证引擎状态互不影响。

两个方法只接受原生 `true` / `false`，不接受 `0` / `1`、字符串或其他 truthy/falsy 值；非法参数应拒绝为 `INVALID_ARGUMENT`。业务按钮分别绑定两组开关，不用实验整数接口替代规范方法，也不把充电线可见当作正在充电。控制不自动切换相机；拖动至车辆右后侧观察充电口和充电线，前视角看不到变化不等于调用失败。

`getState().requested` 中的 `charging` 与 `chargingCableVisible` 是分别记录的请求状态（包括规范方法的已知联动），不是Unity真实回读；未请求值不应显示为已观察到的关闭状态。成功返回 `dispatched` 仅表示派发，不能作为充电动画完成或真实车辆充电反馈。

充电构建专用桥按需（lazy）初始化：首次充电控制需等待WASM SHA-256及注册/实例校验，不能省略哈希保护或对未知构建继续调用。异步初始化完成后必须复核实例与生命周期，销毁或换实例后不再派发；失败不应登记为成功请求。HTTP无WebCrypto时保留SHA-256备用校验。首次调用可能较慢，业务应捕获错误并显示等待状态，不能只等 `ready()` 就假定桥已完成校验。

### 返回值与状态

控制方法返回Promise，其结果包含 `status:'dispatched'`、`observed:false` 和命令信息。表示已派发，不表示动画已经结束。`ready()`表示初始化完成，也不等于场景动画已经稳定。

`getState()`中的 `requested`只记录请求，`observed`当前为null；模型直接点击产生的变化不会自动同步到请求状态。不能用它实现真实开合状态显示或精确动画完成判断。

### 事件

使用 `addEventListener`，数据在 `event.detail`：

- `progress`：`{progress}`，0到1加载进度。
- `ready`：初始化后的请求状态。
- `error`：错误对象，含 `code/message`。
- `runtime-log`：原引擎banner日志。
- `command`：命令派发信息。
- `destroyed`：销毁后的生命周期状态。

### 错误与生命周期

错误为 `CarPlayerError`，常见code：`INVALID_ARGUMENT`、`INSTANCE_ACTIVE`、`LOAD_FAILED`、`TIMEOUT`、`RUNTIME_ERROR`、`DESTROYED`、`UNSUPPORTED`、`UNSUPPORTED_BUILD`。

加载期间发出的规范控制会等待ready；初始化失败会拒绝。销毁期间和销毁后调用会拒绝。加载中destroy需等待后台加载结束后Quit，因此不保证立即完成；不要提前启动第二实例。

### 实验接口

```js
await car.experimental.invoke('setVersion', 0);
console.log(car.experimental.methods);
```

方法签名来自原始声明，参数校验区分整数、字符串和无参。覆盖版本、选装、灯组、充电线、门把手、座椅、场景等候选。签名存在不等于当前车型生效；实验参数可能触发原引擎异常或改变配置/视角。业务优先使用规范方法，不把实验接口作为稳定契约。

## 门窗桥与已知限制

- 门窗桥限定当前已验证WASM，首次调用会读取WASM并校验SHA-256、原始方法注册与唯一车辆实例。构建变化拒绝执行，需要重新适配。
- HTTP下SHA-256备用实现比浏览器原生摘要慢，首次门窗调用可能稍有等待。
- 未修改构建文件、未直接改写引擎内存、未用屏幕模拟点击代替API。
- `setTrunk()`仍不支持；可用 `toggleTrunk()`，它不是幂等操作。
- 门速、轮转角、完整版本/选装值域和通用状态回读尚未公开。
- “已验证”指列出的实际运行操作，不承诺所有组合、设备、动画中间帧与副作用均一致。

## 静态部署与离线验收

1. 上传所有manifest列出的文件；保留路径或配置assetBaseUrl。
2. `.wasm`使用`application/wasm`，JS使用有效JavaScript MIME，data使用二进制类型。
3. 资源跨域时配置CORS；同源部署最简单。
4. 无需外网API、CDN、服务端业务接口或Unity编辑器。
5. 用全新浏览器context加载首页和测试页，禁止非本地请求，再操作门窗（首次会再次读取WASM）。不要仅依赖浏览器缓存判断离线完整。

### 开发验证

运行验证脚本需要额外安装 Playwright 与 Pillow，并安装Chromium；正常使用不需要这些依赖。

```bash
python verification/component-check.py
python verification/door-component-check.py
python verification/release-check.py
```

默认脚本针对本地18743端口。验证会实际运行模型、驱动按钮并生成截图/JSON；产物可重新生成，不是页面资源。

## 常见问题

- **白屏或模块404**：检查目录、文件完整性、MIME、浏览器控制台；禁止file://。
- **IP HTTP访问缺少crypto**：本版本已有兼容实现，确保更新完整components目录并强制刷新缓存。
- **门窗UNSUPPORTED_BUILD**：WASM内容或结构与已验证版本不同，不能跳过哈希保护。
- **首次加载慢**：原始二进制约43MiB，首次传输和编译需要时间；静态缓存可改善重复访问。
- **面板遮挡/操作太长**：控制台可收起，面板内部滚动；日志和实验选项可折叠。
- **模型放大后裁切**：受原始相机及canvas比例影响，可缩小或调整窗口，不保证无限放大仍完整显示。

## 资源使用说明

模型、纹理、车辆品牌标识及Unity发布资源的权利归相应权利人所有。本仓库提供集成与技术展示，不授予这些资源的商业授权；对外发布或商业使用前应确认所需授权。不在缺少授权信息时为全部资源宣称统一开源许可。
