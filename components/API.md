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
- `setInterior(code)`：R旭日红、P深海蓝、Q皓月白。变更真实内饰材质，不强制切换内饰相机。
- `setHeadlights(boolean)`：原始API.setFrontLight，开关画面变化实测。
- `setDriving(boolean)`：API.carDrivingStatus，启动/停止画面变化实测；并非真实车辆控制。
- `setMirrors(expanded)`：true展开、false折叠；原始值0展开/1折叠，组件已转换。此方法还会影响灯光，非纯镜控制，标为preview。
- `setDaytimeRunningLights(on)`、`setPositionLights(on)`：已实际观察开关画面变化，preview。
- `setLocked(locked)`：true锁车/false解锁，原版会联动灯光、镜子，尚未完整检查所有副作用，preview。
- `setWheelType(index)`：仅支持0/1，两种轮毂已验证切换及恢复。原版index=2触发异常，组件拒绝。
- `toggleTrunk()`：原始根对象/ZY无参方法，实际验证打开和关闭；不提供幂等状态设置。
- `flashTurnSignals()`、`findCar()`：原始无参方法，已观察画面变化但闪烁次数和完整动画尚未验收，preview。
- `setCameraPreset(index)`：支持0/1/2，已观察相机切换；不宣称预设具体名称，3以上无有效变化。
- `getCapabilities()`：候选、已观察画面变化、未支持清单；verified不代表所有动画时序和副作用均已验收。
- `getState()`：lifecycle + requested + observed:null。requested仅为命令请求，不冒充Unity真实回读。
- `destroy(): Promise<void>`：幂等，Quit并释放canvas和实例锁。加载中销毁要等待后台加载结束，不保证立即完成。

控制Promise返回 `{id,method,value,status:'dispatched',observed:false}`，只表示派发。错误为CarPlayerError，含code/message。错误码INVALID_ARGUMENT、INSTANCE_ACTIVE、LOAD_FAILED、TIMEOUT、RUNTIME_ERROR、DESTROYED、UNSUPPORTED、UNSUPPORTED_BUILD。

事件为EventTarget/CustomEvent：progress、ready、error、runtime-log、command、destroyed，数据在event.detail。组件销毁后业务方可释放整个对象及自己添加的监听。

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

本版仍不是全部功能完成：门速/轮转角、完整配置值域及通用真实状态回读未解决。门窗开关可通过verification/door-component-check.py重新执行运行验收。充电线、门把手、后Logo灯在当前前视角无变化，不能宣称生效。setVersion=2有变化但语义未确认，继续留实验接口。

## 验证与接入说明

完整部署、资源目录、事件与错误、接口示例、能力边界见项目根目录README。核心回归脚本位于verification/component-check.py和door-component-check.py，可重新生成运行证据。离线必要文件及hash见offline-manifest.json。
