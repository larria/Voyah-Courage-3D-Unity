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
- `setMirrors(boolean)`：API.setRearview，1有画面变化，但镜子开/闭方向还需专项核验，不适合依赖其物理语义的业务。
- `setCameraPreset(1)`：已观察原始相机变化；其他编号仅允许实验调用。
- `getCapabilities()`：候选、已观察画面变化、未支持清单；verified不代表所有动画时序和副作用均已验收。
- `getState()`：lifecycle + requested + observed:null。requested仅为命令请求，不冒充Unity真实回读。
- `destroy(): Promise<void>`：幂等，Quit并释放canvas和实例锁。加载中销毁要等待后台加载结束，不保证立即完成。

控制Promise返回 `{id,method,value,status:'dispatched',observed:false}`，只表示派发。错误为CarPlayerError，含code/message。错误码INVALID_ARGUMENT、INSTANCE_ACTIVE、LOAD_FAILED、TIMEOUT、RUNTIME_ERROR、DESTROYED、UNSUPPORTED。

事件为EventTarget/CustomEvent：progress、ready、error、runtime-log、command、destroyed，数据在event.detail。组件销毁后业务方可释放整个对象及自己添加的监听。

## 实验接口（非稳定业务契约）
`player.experimental.invoke(method,value)`：提供元数据确认的32个API方法名的受校验通道（重载仅保留int版本），签名表见`RUNTIME_METHODS`。仅保证参数类型，数值范围、状态含义、副作用可能未验证；初始化/场景命令可改变车色与相机，getState不能回读实验命令产生的实际状态。

覆盖轮毂、版本、选装、灯组、转向闪烁、锁车、寻车、充电线、门把手、座椅、场景和相机等原始API候选。不能宣称全部候选已生效。没有任意对象SendMessage逃生通道，避免把字段误当函数。

## 门窗尾门限制
`setDoor/setWindow/setTrunk` 当前明确拒绝UNSUPPORTED。元数据中内部方法存在，但在ZY对象SendMessage调用无可观察动作。DoorID真实枚举LF=1、LB=2、RF=4、RB=8；triggerDoorWindow*和triggerTrunk是内部热点字段，不是方法。原始鼠标热点仍保留，不能用屏幕坐标模拟点击冒充完整API。

本版不是全部功能完成：门窗尾门可靠JS入口、门速/轮转角、多相机预设、候选方法值域及真实状态回读仍需继续分析。

## 验证
独立测试页 `/examples/api.html`；运行证据 `verification/component-check.json`、`component-*.png`、`api-probe.json`。每步截取viewer画面，而非仅看按钮文字。内饰三色、大灯往返、行驶往返、销毁重挂载、非法参数、重复实例均实际驱动。镜子0无变化、1有变化，未确定语义；候选接口未完整验证。
