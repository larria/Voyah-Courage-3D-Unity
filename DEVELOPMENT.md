# 开发与逆向工程记录

本文记录本项目从官网观察、资源定位、原始运行时落地到门窗API封装的实际过程，并说明证据、失败路径与后续维护方法。面向开发人员；部署与业务使用请先阅读README及components/API.md。

## 1. 目标与原则

目标是在本地使用原始车辆模型、材质、灯光、动画及交互，并向业务提供可重复调用的JS接口。核心原则：

- 优先复用完整发布程序，不用手工近似代替原始Shader和动画。
- 方法名称、参数、场景对象和运行结果分别验证。
- 命令无异常不等于目标动作成功；截图差异也可能来自相机、联动灯光或未结束的动画。
- 保持原始Build字节不变，不直接写入Unity内存、不以固定屏幕点击冒充稳定API。
- 版本专用桥必须校验构建和实例；失败时拒绝，不对未知指针调用。
- 不修改外部参考目录、不触发购买/登录/订单业务。

## 2. 官网定位和架构识别

从官网配置页选择“全新岚图知音”，切换3D后检查DOM及performance资源记录。发现同域iframe：

```text
https://configuration-3d-web.dsmp.voyah.com.cn/voyah-app-h37b/index.html
?featureCodes=LDB,T,DR19,MPVALLSHEHAHF
```

iframe并非普通模型查看器，而是完整Unity WebGL发布程序。实际请求包括：

- Build/ZY.loader.js：24265字节。
- Build/ZY.framework.js：325715字节。
- Build/ZY.wasm：14549545字节。
- Build/ZY.data：30518614字节。
- src/$.js：5521字节。

加载器调用createUnityInstance(canvas,config,progress)。主页面通过postMessage发送type/msg，播放器转换为unityInstance.SendMessage('API',type,msg)。原入口同时支持dyglVoyah函数及Proxy属性调用。featureCodes来自查询参数，Unity创建后延迟约200ms发送。

这一步改变实现路线：模型、贴图、Shader、环境、动画和点击逻辑已封装在发布程序内，无需把所有渲染参数重新导出到另一引擎。

## 3. 资源获取、校验与离线运行

将完整播放器和Build复制到本项目，下载当前官网同名资源后逐字节及SHA-256比较。五个核心文件与已保存资源一致，结果保存在verification/resource-hashes.json。

ZY.data以UnityWebData1.0容器开头；WASM有标准魔数。静态HTTP服务器应提供application/wasm，不使用file://。实际运行观察没有必要StreamingAssets请求，不能仅因为config中有该目录就推断缺资源。

离线验收使用新浏览器context，阻断非本地请求，并实际进行首次门窗调用：门窗桥会再次读取WASM进行hash校验。只看缓存中的首屏不足以证明完整离线。

offline-manifest.json记录所有必要运行文件；它需在运行文件修改后重新生成。开发日志、反汇编工具和历史截图不是页面依赖，可清理或保留精简证据。

## 4. 为什么没有继续重建渲染参数

早期可编辑重建路线能导出几何，但基础色、主贴图和世界矩阵不等于完整渲染配置。缺失Shader、反射环境、法线编码、透明排序、动画曲线、父子层级与热点会产生：

- 玻璃透明度和灯幕颜色不一致。
- 门铰链或窗下降位移采用估算值。
- 玻璃世界矩阵被独立门窗动画覆盖，门窗组合动作出错。
- 没有原始环境光时，即使金属/粗糙度近似仍表现不同。

因此本项目保留完整Unity程序，不以人工设定角度或0.45m窗位移解决像素级一致性。相同浏览器、609×300 CSS视口、DPR=2下曾获得默认外观及车色逐像素相同的证据。但这不是任意设备、视角、动画中间帧都像素相同的证明。

## 5. iframe到单页canvas

iframe最初隔离了原始全局变量、CSS和初始化；它不是保持画质的必要条件。之后将loader、canvas及初始化移到主页面，保留原始Build和配置。

直出需处理：

- canvas必须有稳定且非空的ID。原framework会使用ID注册输入；空ID导致querySelector('#')异常。
- 组件创建ID后不可由适配器再次改ID，否则输入绑定可能失配。主页使用样式类而非改ID。
- CSS显示尺寸和drawing buffer按DPR对应，不用额外图像缩放冒充质量一致。
- 初始化先featureCodesUrl，再exteriorTab；内饰材质使用interior，不强制改变相机。
- 加载失败/超时、destroy与晚到实例均需处理。

显示区使用自适应高度。API控制台模型始终留在视口，控制面板独立滚动、可收起；收起不改变模型容器尺寸，避免同一次操作视角发生变化。

## 6. 控制协议捕获与内饰纠正

只观察外观tab会漏掉内饰材质变化。实际官网选择内饰颜色会改变3D模型，必须保留。

运行时暂时包装该iframe的SendMessage，记录真实按钮消息，而不是仅搜索方法名：

- exteriorTab/QGJ进入外观。
- exterior/QGJ、XYH、JSH、NUB分别为香槟金、玄英黑、宸星灰、杜若白。
- interior或interiorTab/P为深海蓝，Q为皓月白，R为旭日红。
- 数值setInteriorMaterial与上层字符串映射关系由实际输出观察到R→0、Q→1、P→2。

捕获记录在verification/interior-commands.json。内饰相机与内饰配色不是同一能力，规范setInterior仅变材质。

## 7. UnityWebData与IL2CPP v29元数据

工具tools/extract-metadata.py按容器目录定位global-metadata.dat，不仅靠扫描magic。

当前资源：

- metadata在archive偏移26349602，长度2547960。
- magic 0xFAB11BAF，version=29。
- data.unity3d在archive偏移240，长度26344518。

元数据header中表count为字节数，不是条目数。当前v29关键表：

| 表 | Header位置 | 记录长度 |
|---|---:|---:|
| strings | 24 | 变长 |
| methods | 48 | 32 |
| fieldDefaultValues | 64 | 12 |
| fieldAndParameterDefaultValueData | 72 | 变长 |
| parameters | 88 | 12 |
| fields | 96 | 12 |
| typeDefinitions | 160 | 88 |

TypeDefinition关键偏移：fieldStart=32，methodStart=36，method_count=64，field_count=68。MethodDefinition为nameIndex、declaringType、returnType、parameterStart、genericContainerIndex、token及flags/iflags/slot/parameterCount。

不能把类型索引直接当类型定义索引。byvalTypeIndex可用于一部分类型映射，但数组、泛型、byref等需运行时类型注册信息；解析器对未解类型保留UnresolvedTypeIndex。

关键类型：

- Configurator.API：type index2850，methodStart17230，40个方法（含构造）。
- Configurator.CarConfigurator：type index2857，methodStart17270，51个方法。
- Common.Car.DoorID：type index3236，四个命名枚举成员。

DoorID常量是LF=1、LB=2、RF=4、RB=8，不是0/1/2/3。当前默认值采用压缩有符号整数编码：非负一字节值为编码右移1。不能直接unpack int32；默认数据表在header+72而非+80。

方法声明输出在verification/runtime-metadata.json。声明是候选证据，不代表场景接收对象正确或运行功能已通过。

## 8. 字段与方法的混淆

triggerDoorLF/LB/RF/RB、triggerDoorWindowLF/LB/RF/RB、triggerTrunk是CarConfigurator字段，不是方法。调用名称没有抛出可捕获错误，并不能证明方法存在。

实际内部方法包括：

```text
toggleDoor(DoorID)
setDoor(DoorID,bool,isAnim)
toggleDoorWindow(DoorID)
setDoorWindow(DoorID,bool,isAnim)
toggleTrunk()
setTrunk(bool,isAnim)
```

API组件没有独立门窗wrapper。普通SendMessage仅支持有限的单参数类型，多参setDoor不能直接派发。

## 9. 场景对象与同名目标

使用UnityPy读取data.unity3d，关联MonoBehaviour基础头、MonoScript、GameObject和Transform。部分MonoBehaviour缺type tree，不能随意把二进制float解释为业务参数。tools/inspect-scene.py提供辅助检查。

确认CarConfigurator挂载于激活根对象/ZY，而/ZY/ZY-new/ZY是同名网格。SendMessage('ZY','toggleTrunk')可能命中没有接收方法的对象；绝对路径/ZY解决，实际验证尾门打开及关闭。

窗口热点对象叫Tiggle_LF/LB/RF/RB，与Door_LF/LB/RF/RB门热点不同。TriggerBounds提供isTrigger(Ray,dist)，ATrigger.onTrigger是委托字段，不是可消息调用的无参函数。热点世界坐标投影只能用于调查命中关系，不作为产品API的固定屏幕坐标。

## 10. 门窗桥的失败路径

### 10.1 普通SendMessage

正确/ZY目标下，DoorID数字1/2/4/8经_SendMessageFloat进入托管转换后异常。字符串'1'/'2'/'4'/'8'及'LF'/'LB'/'RF'/'RB'也失败，不存在自动enum转换。

### 10.2 多参数与委托

setDoors/setDoorWindows等需要两个参数，setDoor/setDoorWindow需要三个业务参数；单参SendMessage不能完整调用。ATrigger没有无参invoke入口，onTrigger委托不能当方法派发。

### 10.3 carStatusScene

最初怀疑它是JSON状态协议。反汇编发现该token0x37映射WASM function565，仅nop，是空实现。因此空串、数字、JSON均无效，不应公开为门窗控制通道。

### 10.4 缺少反射导出

WASM导出混淆，无直接il2cpp_domain_get/runtime_invoke。虽然Module.asm._g暴露函数表，但不能拿metadata token直接当函数指针，也不能随意猜实例地址。必须还原codegen注册映射与当前活对象。

## 11. 门窗桥最终实现

components/door-controls.js是当前构建专用桥，调用原始IL2CPP setter，不修改构建、不写堆内存。

### 11.1 构建门禁

WASM SHA-256必须为：

```text
e332b42051b117e0492744084cd5065ba6fd7d38b0178876bed500106ada35ba
```

读取当前资源验证后，再核对原始Il2CppCodeGenModule登记：

- 当前module地址2069616。
- 名称com.ziz.configurator.Runtime.dll。
- methodCount=206。
- 注册表methodPointers与预期token/slot完全匹配。

这些数值是当前构建布局，不是通用Unity ABI。版本变化必须重新解析，不能只改预期hash继续用旧偏移。

### 11.2 方法映射

| 方法 | token低位 | table slot | 调查中WASM function |
|---|---:|---:|---:|
| toggleDoor | 0x41 | 26447 | 见原始方法证据 |
| setDoor | 0x42 | 26448 | 9519 |
| toggleDoorWindow | 0x46 | 26452 | 见原始方法证据 |
| setDoorWindow | 0x47 | 26453 | 15521 |

函数表调用形式：

```js
Module.asm._g.get(slot)(carPtr, doorId, Number(open), Number(animate), 0);
```

末尾0对应本构建生成调用的MethodInfo参数。只有针对这些已解析且实测函数签名才允许这样调用，不能推广到任意方法。

### 11.3 动态实例识别

不固定carPtr。每次挂载在HEAPU32中寻找当前活实例，逐项验证：

1. 类型名CarConfigurator及namespace Configurator。
2. 对象头、指针对齐、范围。
3. 当前门与窗动画字典在对象偏移292/296，分别有且只有1/2/4/8四个key，value为Anim类型。
4. 预期trigger引用为Configurator.Trigger*。
5. Main.car引用链对应且只有一个候选。

扫描优化为先定位类指针，再按数值筛选候选，避免为整个堆反复解码字符串。仍属构建专用运行时结构，需要版本门禁保护。

每次调用再次核对类型及字典。主组件lazy初始化桥，await返回后检查组件未destroy且运行实例未改变，避免异步初始化完成后调用已退出的引擎。

### 11.4 状态与验证

原始Anim结构中的phase在本次实测为0→2→0，direction为±1；它是内部动画时间，不是0–1开合比例，不能直接当公开状态API。

验证包含四门四窗16次往返、左右视角截图、其他部件保持关闭、无动画全开/全关、非法ID/boolean以及坏hash拒绝。核心脚本verification/door-component-check.py可重新执行。精简原始结果与方法证据保存在verification/door-*.json。

规范setDoor/setWindow返回dispatched，不把命令请求当动画完成。尾门现仅toggleTrunk；没有通用回读，不伪造幂等setTrunk。

## 12. API设计与生命周期

业务入口CarPlayer是EventTarget，不绑定固定页面ID或业务按钮。资源相对于模块URL解析，支持assetBaseUrl。首页及API测试页是适配层。

- 明确参数枚举、boolean和错误code。
- verified/preview/experimental/unavailable分层。
- 规范方法优先，原始签名通道仅供实验，值域未知不承诺生效。
- ready只表示初始化；requested与observed分开。
- 单实例锁直到Quit完成才释放。
- destroy幂等；加载中destroy等待晚到Unity实例并退出。
- 控制调用等待ready、destroy后拒绝。
- 当前加载器缓存按URL去重；失败移除，允许重试。

仍需留意：加载完全卡住时destroy可能等待很久；对构建结构变化的所有错误必须保持fail-closed；未来若增加多实例要重新检查原始Unity全局事件和资源共享。

### 12.1 充电展示正式接口与维护约束

对外方法统一为 `setCharging(on)` 与 `setChargingCableVisible(visible)`，仅接收严格boolean，不对数字、字符串等做truthy转换；非法输入拒绝 `INVALID_ARGUMENT`。充电展示与充电线显示使用分别提供的规范方法，按钮不隐式调用另一方法，也不自动切换相机；这不代表底层状态互不影响。setCharging(true)请求充电与线缆均为true，false请求两者均为false；setChargingCableVisible(v)请求充电为false、线缆为v，停止流光并展示或隐藏静态线缆。API测试页提供四个独立按钮，并提示从车辆右后侧观察充电口与充电线，避免用前视角无变化判断功能不存在。

请求状态使用 `requested.charging` 与 `requested.chargingCableVisible`，不是内部动画phase或真实车辆遥测；未请求值不冒充已观察到的关闭。规范返回仍是 `dispatched` / `observed:false`，不证明动画结束。失败不得写成成功请求，重复相同请求仍应保持setter语义；业务直接点击模型产生的变化不保证同步回requested。

充电桥沿用构建专用的fail-closed原则：首次控制lazy加载，先验证WASM SHA-256、原始方法注册与唯一有效实例，再调用原始方法，不改Build、不写堆内存、不跳过门窗门禁。`ready()` 不提前执行或替代按需构建验证。等待初始化后必须复核生命周期及Unity实例身份，销毁、重挂载或失败时不得向旧实例派发。无WebCrypto时仍使用备用SHA-256；首次等待是安全校验成本，不以取消哈希换取低延迟。

协调验收应包含两个方法true/false、独立组合、重复请求、严格boolean拒绝、右后侧画面、坏hash拒绝、首次lazy调用期间destroy及重挂载。本节规定接入与维护契约，不将方法存在、按钮日志或requested值冒充这些运行验收的证据。运行文件变化后由整合方刷新offline-manifest.json的尺寸与SHA-256，再执行发布校验；仅修改文档无需刷新资源清单。

## 13. 普通HTTP的兼容性

crypto.randomUUID及crypto.subtle通常只在安全上下文提供。localhost测试成功不能证明HTTP IP部署成功。

canvas仅需页面内唯一ID，因此使用计数并检查DOM碰撞，不需要加密随机。门窗hash校验不能省略；components/sha256.js优先Web Crypto，在不可用时使用纯JS SHA-256，按块定期yield，避免完整WASM哈希期间长时间阻塞UI。

实际禁用window.crypto的浏览器环境中，模型加载与门控制均通过。不可用WebCrypto不是跳过校验的理由。

## 14. 控制台红色输出是否是错误

用户观察到LDB、T、DR19、MPVALLSHEHAHF、R及0以红色输出。检查原始framework可见：

```js
function _JS_Log_Dump(ptr,type) {
  const str=UTF8ToString(ptr);
  switch(type) {
    case 0: case 1: case 4: console.error(str); return;
    case 2: console.warn(str); return;
    case 3: case 5: console.log(str); return;
    default: console.error('Unknown console message type!');
  }
}
```

本构建把配置与索引以该错误级别输出。LDB等是featureCodes片段，R/P/Q是内饰代码，0/2/1是映射索引。SN.车漆是类别调试文本。对于这些具体短文本，结合功能正常与无pageerror，可判为原始调试输出；不能据此把所有Unity错误都忽略。

verification/log-check.py实际驱动加载、内饰三色及门控制，捕获console、pageerror、requestfailed：本次pageerror为空、请求失败为空、生命周期ready，仅保留上述配置/索引日志。

**为什么保留而不屏蔽：** _JS_Log_Dump直接调用console.error，不通过普通printErr配置。全局替换console.error或按短字符串过滤可能误伤真实业务/Unity错误；修改framework会改变原始Build与manifest。当前收益不足以承担诊断丢失风险，因此不抑制，只记录分类。真正异常如托管堆栈、WebGL context lost、MIME错误、fetch失败和UNSUPPORTED_BUILD必须继续可见。

## 15. 维护和再适配流程

升级Unity发布包时：

1. 保存新的完整资源，不混用不同版本loader/framework/wasm/data。
2. 获取SHA-256及大小，检查archive/header。
3. 重解析metadata方法、签名、枚举及场景对象。
4. 重定位codegen模块、method token与table映射。
5. 重验证实例结构、字典布局、动画类型。
6. 独立测试四门四窗开关、无动画、组合操作、重复命令及destroy/重挂载。
7. 验证HTTP无WebCrypto、新context离线请求、桌面手机控制台布局。
8. 更新构建专用桥、manifest、文档与运行证据后才发布。

不要仅删除hash gate、硬套旧指针、让一个成功截图代替全部位置验收。

## 16. 开发工具与复现

- tools/extract-metadata.py：标准库解析本构建IL2CPP方法声明，输出runtime-metadata.json。
- tools/inspect-scene.py：UnityPy辅助关联组件/场景对象，需额外安装UnityPy；不是页面运行依赖。
- verification/component-check.py：规范API页面实际按钮及生命周期。
- verification/door-component-check.py：四门四窗原始setter和诊断phase。
- verification/release-check.py：桌面/手机/横屏独立面板、新context阻断外部请求、无WebCrypto门控制。
- verification/log-check.py：区分console调试日志和真正脚本/请求异常。

浏览器验证依赖Playwright和Pillow；页面正常运行不需这些库。旧临时反汇编工具和重复截图已清理，精简证据与核心可重跑脚本保留。本文提供已完成的定位信息，但不是从任意Unity版本自动恢复同样桥的通用反编译器。

## 17. 尚未完成的能力

门速/轮转角、完整版本与选装值域、通用状态回读仍未公开。部分后视镜/锁车/灯光方法联动其他状态；相机预设仅验证编号而未给业务名称。部分资源相关候选在当前视角无变化，不宣称已生效。

资源及品牌权利归相应权利人。逆向与技术复现记录不授予商业或再分发授权，使用范围应另行确认。
