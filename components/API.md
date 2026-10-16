# 知音原版 Unity JS 组件

## 接入
```html
<div id="car" style="height:70vh"></div>
<script type="module">
import { CarPlayer } from './components/car-player.js';
const player = new CarPlayer(document.getElementById('car'), {
  paint: 'QGJ', interior: 'R', timeoutMs: 120000,
  // assetBaseUrl: '/your-assets/unity-player/'
});
player.addEventListener('progress', e => console.log(e.detail.progress));
player.addEventListener('error', e => console.error(e.detail.code, e.detail.message));
await player.ready();
await player.setInterior('P');
await player.setHeadlights(true);
// 离开业务页面：await player.destroy();
</script>
```
组件默认资源路径相对于模块URL，而非调用页面URL。需连同unity-player/Build部署、提供WASM MIME。运行时限定单实例，销毁完成后可重挂载；组件不创建业务UI、不依赖固定容器ID。

## 规范接口
- `ready(): Promise<CarPlayer>`：原始引擎及初始化命令完成；不代表动画已稳定。
- `setPaint(code)`：QGJ香槟金、XYH玄英黑、JSH宸星灰、NUB杜若白。
- `setInterior(code)`：R旭日红、P深海蓝、Q皓月白。只配色，不进入或退出内饰模式。
- `enterInterior(code?)`：显式参数严格接受原生字符串 R/P/Q；省略或 undefined 时在 ready 后派发时读取最新 `requested.interior`，而非构造默认值。调用原始 `API.interiorTab`，在 command 事件前记录 interior 和 viewMode:'interior'。
- `exitInterior()`：调用原始 `API.jumpState(1)`，记录 viewMode:'exterior'，保留内饰颜色。重复和快速命令均派发，不去重；生命周期拒绝沿用 DESTROYED。viewMode 仅请求状态，不是实际相机回读。

API 页提供“进入内饰”和“返回外观”两个按钮，颜色按钮只配色。进出模式可能联动原版场景、相机、灯光或配置；不承诺保留全部其他设置，也不承诺 Promise 表示动画完成。可运行 `python3 verification/interior-mode-check.py` 查看真实 Unity 画面证据。
- `setHeadlights(boolean)`：原始API.setFrontLight，开关画面变化实测。
- `setDriving(boolean)`：API.carDrivingStatus，启动/停止画面变化实测；并非真实车辆控制。
- `setCharging(on)`：严格boolean，true请求充电展示、false请求停止；当前构建专用桥，首次调用按需校验WASM。
- `setChargingCableVisible(visible)`：严格boolean，true请求显示充电线、false请求隐藏；单独提供控制方法，不改变相机；显示/隐藏线缆会停止充电流动并将充电请求更新为false。
- `setMirrors(expanded)`：true展开、false折叠；原始值0展开/1折叠，组件已转换。此方法还会影响灯光，非纯镜控制，标为preview。
- `setDaytimeRunningLights(on)`、`setPositionLights(on)`：已实际观察开关画面变化，preview。
- `setLocked(locked)`：严格boolean；已修正为true锁车→`carLockStatus(0)`、false解锁→`carLockStatus(1)`。`requested.locked`保留boolean，command事件记录原始0/1；非boolean输入以INVALID_ARGUMENT拒绝且不派发命令。保留原版灯光联动，并通过构建专用镜控制请求锁车折叠、解锁展开；尚未完整检查所有副作用，preview。`verification/lock-*`含此前真实按钮、事件及非法输入证据；route1修正及验收边界见下节，不改原始Build。
- `setWheelType(index)`：仅支持0/1，两种轮毂已验证切换及恢复。原版index=2触发异常，组件拒绝。
- `toggleTrunk()`：原始根对象/ZY无参方法，实际验证打开和关闭；不提供幂等状态设置。
- `flashTurnSignals()`、`findCar()`：原始无参方法，已观察画面变化但闪烁次数和完整动画尚未验收，preview。
- `setCameraPreset(index)`：支持0/1/2，已观察相机切换；不宣称预设具体名称，3以上无有效变化。
- `getCapabilities()`：候选、已观察画面变化、未支持清单；verified不代表所有动画时序和副作用均已验收。
- `getState()`：lifecycle + requested + observed:null。requested仅为命令请求，不冒充Unity真实回读。
- `destroy(): Promise<void>`：幂等，Quit并释放canvas和实例锁。加载中销毁要等待后台加载结束，不保证立即完成。

控制Promise返回 `{id,method,value,status:'dispatched',observed:false}`，只表示派发。错误为CarPlayerError，含code/message。错误码INVALID_ARGUMENT、INSTANCE_ACTIVE、LOAD_FAILED、TIMEOUT、RUNTIME_ERROR、DESTROYED、UNSUPPORTED、UNSUPPORTED_BUILD、MIRROR_CONTROL_FAILED。

事件为EventTarget/CustomEvent：progress、ready、error、runtime-log、command、destroyed，数据在event.detail。组件销毁后业务方可释放整个对象及自己添加的监听。

## 后视镜与锁车修正接入契约

`setMirrors(true)`请求展开（原始值0），false请求折叠（原始值1）；`setLocked(true)`仍派发原始`carLockStatus(0)`，false仍派发1，保留灯光联动并分别请求折叠/展开。API测试页“后视镜开（展开）/关（折叠）”与“锁车/解锁”按钮直接调用公开方法，随`components/mirror-controls.js`集成使用修正路径；`experimental.invoke`仍是原始实验命令，不提供修正保证。

route1使用原生暂停步进：按当前Build的WASM与data SHA-256、方法注册、实例类型和唯一Main关联设置门禁；不匹配拒绝`UNSUPPORTED_BUILD`，不跳过校验。保留原始3秒smoothstep与原生deltaTime/Update，反向请求从当前phase继续。pre hook保留并调用已有hook，仅对原镜动画调用原生pause(1)，阻止错误Y轴原生回调在Update中覆盖修正方向。无直接heap/table写入，不修改carType或Build，不用RAF重建时钟。

真实组件按钮与连续帧证据在`.publish/mirror-fix-probe/formal-mirror-results.json`、`formal-continuous-results.json`（171次采样，快速反向/重复，原phase与smoothstep最大偏差5.44e-8）。`formal-failure-results.json`记录Build mismatch拒绝、异步destroy无hook残留；较新的hook在destroy后保留。`formal-regression.py`的结果与截图记录镜桥初始化后门窗、充电、内饰回归及HTTP无subtle仍保留getRandomValues。四个Build hash不变。完整离线断网、任意第三方hook组合及全部实验命令副作用不在本次验收内。命令结果仍为`dispatched` / `observed:false`，不是动作完成或物理状态回读；运行帧失败会停止桥并使后续调用拒绝，不会撤销此前已派发事件。

## 充电展示接入契约

```js
await player.setCharging(true);
await player.setChargingCableVisible(true);
await player.setCharging(false); // 停止充电并隐藏充电线
await player.setChargingCableVisible(false);
```

`setCharging(true)` 请求charging=true、chargingCableVisible=true；false则请求两者均为false。`setChargingCableVisible(v)` 请求charging=false、chargingCableVisible=v，显示的是静态线缆。

参数只接受原生boolean；数字、字符串、null和省略参数均不是开关值，应拒绝 `INVALID_ARGUMENT`。业务应分别维护充电请求和线缆显示请求，优先调用这两个规范方法，不用 `experimental.invoke` 的原始整数参数替代。

`getState().requested.charging`、`getState().requested.chargingCableVisible` 仅是分别记录的请求值（包含规范方法的已知联动）；线缆显示/隐藏会停止流动并请求charging=false，需要流动时先设置线缆，再调用setCharging(true)。未请求值不应当作已观察到的关闭；`observed:null` 仍表示无真实回读。Promise结果 `dispatched` / `observed:false` 不证明动画完成、线缆实际可见或真实车辆正在充电。按钮不会自动换相机，需拖动至车辆右后侧观察充电口和充电线。

充电桥lazy初始化，首次调用等待WASM SHA-256、原始注册及实例验证，构建不匹配应拒绝 `UNSUPPORTED_BUILD`，不得跳过校验。`ready()` 不代表这次按需验证已完成。初始化await返回后必须重新检查未销毁且仍是同一Unity实例；失败或销毁期间不得派发，也不得登记成功请求。普通HTTP下无WebCrypto仍需备用SHA-256，不能关闭安全门禁。业务需await并捕获错误，避免销毁时晚到命令进入已退出实例。

## 实验接口（非稳定业务契约）
`player.experimental.invoke(method,value)`：提供元数据确认的32个API方法名的受校验通道（重载仅保留int版本），签名表见`RUNTIME_METHODS`。仅保证参数类型，数值范围、状态含义、副作用可能未验证；初始化/场景命令可改变车色与相机，getState不能回读实验命令产生的实际状态。

覆盖轮毂、版本、选装、灯组、转向闪烁、锁车、寻车、充电线、门把手、座椅、场景和相机等原始API候选。不能宣称全部候选已生效。没有任意对象SendMessage逃生通道，避免把字段误当函数。

## 门窗尾门限制
尾门已打通`toggleTrunk()`：场景同时有根`/ZY`和`/ZY/ZY-new/ZY`同名网格，裸ZY命中错误对象；绝对路径解决。`setTrunk`仍拒绝，因为无真实回读不能可靠实现幂等。

四门四窗已通过原始 WASM 方法桥实现：
```js
await player.setDoor('LF', true);  // 左前门打开
await player.setDoor('LF', false); // 左前门关闭
await player.setWindow('LB', true); // 左后窗下降
await player.setWindow('RB', false, { animate: false });
```
ID仅支持LF左前/LB左后/RF右前/RB右后。open、animate为boolean，animate默认true，使用原始动画幅度和速度。

普通SendMessage确实无法传DoorID枚举；新模块`door-controls.js`从当前构建的原始IL2CPP注册定位setter，动态识别唯一实例并调用原始函数。不重写动画、不直接写内存、不模拟屏幕点击、不修改Unity资源。首次调用会读取WASM并校验SHA256、注册表与实例类型，构建改变或实例不匹配即拒绝UNSUPPORTED_BUILD。首次初始化较慢，后续同实例缓存；销毁后禁止使用。此桥是当前构建专用，不保证升级其他Unity发布包可用。

内部动画phase不是0–1比例，本版不作为公共真实状态返回，命令仍只报告dispatched。

本版仍不是全部功能完成：门速/轮转角、完整配置值域及通用真实状态回读未解决。门窗开关可通过verification/door-component-check.py重新执行运行验收。此前充电线在前视角无变化的记录不能作为不可用结论；正式充电接口需在右后侧分别观察充电与线缆显示，不据此宣称所有组合已验收。门把手、后Logo灯在当前前视角无变化，不能宣称生效。setVersion=2有变化但语义未确认，继续留实验接口。

## 验证与接入说明

完整部署、资源目录、事件与错误、接口示例、能力边界见项目根目录README。核心回归脚本位于verification/component-check.py和door-component-check.py，可重新生成运行证据。离线必要文件及hash见offline-manifest.json。
