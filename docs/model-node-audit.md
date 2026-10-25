# 原始 Web 模型节点完整 typed 盘点

本次安全解析原始 ZY.data，SHA-256 `6d7394f4410750ee80f7fdb6e8049c71c484ad9c23367f09e8cb95f4db261d6f`；typed 清单共 470 个 GameObject：`level0` 场景节点 122 个，`resources.assets` 资源/预制体节点 348 个。470 是资产盘点总数，不是 470 个运行中独立车辆功能；资源节点不证明已实例化。逐项列出资产文件、serialized pathID、层级与全部组件。pathID 仅资产定位，不是 heap 指针。解析程序与结构化证据 `.publish/charging-port-probe/node-audit.py`、`typed-model-nodes.json`。未访问 APK 或外网。

## 判定口径

- 已利用：有公开 API 或已验证 bridge 与绑定/实际画面证据；不是仅名称推断。
- 仅实验：原始 API 声明或绑定存在，值域/动作未完成视觉验收。
- 原生自动流程：场景/输入/遮罩等 typed 脚本生命周期；不等于遗漏业务控制。
- 未控制：独立静态渲染/材质节点，暂无独立公开 API；不将车身装饰误报可动功能。
- 不明：无直接绑定证明，不从节点名称承诺功能。

## API 与候选边界

交叉依据为 `.publish/feature-audit/application-scene-bindings.json`、`application-bodies.json`、`scene-gameobjects.json` 与 `next-step/REPORT.md`；早期 REPORT 的 Main.inner 用途未确认结论已由后续动态证据补齐。`serialized-reference-candidates.json` 仅字节扫描候选，不能冒充完整 typed 字段绑定。

车色/内饰为材质流程；`Main.inner` 绑定的根 `mesh` 已实际随 interiorTab 激活、随 jumpState(1) 关闭，对应规范 enterInterior/exitInterior，不再列为未知静态遗漏。轮毂、门窗/尾门、镜/锁及充电均有现有控制；Charger_LINE/Shape001 是 SceneCharging 控制的充电子树，不是漏接的独立功能。灯组已有原始材质/流程绑定及公开灯光方法，不因 renderer 无独立方法而标作功能不存在；后 Logo 效果语义和组合时序仍实验。

### 简短候选摘要

- XP_INS_N1_N2/N3：setCarseat 与 package 分支的选装资源切换已观察 active 往返，尚无可见配置差异验收；仅可选实验，不是座椅移动或稳定业务 API。XP_INS_N2 也不凭名称承诺独立动作。
- 门把手：当前车型运行绑定数组为空，通用方法不等于本车可用功能。
- 版本/选装：部分字典与字段变化已确认，完整值域、配置组合和业务名称未验收。
- 后 Logo：局部可逆像素变化存在，不足以宣称点亮车标；近距语义、锁/镜/灯联动时序仍待确认。
- Opening 重播、独立 wheelRot、门速及通用真实回读仍未完成；Road 行驶、相机、内饰入口和充电子树不是新增遗漏。

CDK 实际负Y开盖、正Y穿入对照、内腔/插孔与线缆画面及原生四元数证据在 `.publish/charging-port-probe/`；父闭态X−15°。公开 API仍 observed:false。

## 完整节点表

| 文件:pathID | 层级 | typed组件/资产绑定 | 状态与依据 |
|---|---|---|---|
| level0:1 | Main/Camera | Transform#124; Camera#245; MonoBehaviour#397 UnityEngine.Rendering.Universal.UniversalAdditionalCameraData; MonoBehaviour#398 Common.Cam.CamController | 已利用：setCameraPreset/进出内饰；其余相机值域仅实验 |
| level0:2 | ZY/ZY-new/ZY/Trunk/LG2/LaGan_000 | Transform#235; MeshFilter#354 mesh=164; MeshRenderer#285 materials=49 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:3 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B/Trie_B | Transform#135; MeshFilter#360 mesh=195; MeshRenderer#264 materials=58,60,59,3,57 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:4 | ZY/ZY-new/ZY/Ins/XP_INS_N3 | Transform#133; MeshFilter#345 mesh=168; MeshRenderer#253 materials=26,18 | 仅实验：setCarseat/package选装资源active切换；未确认可见配置差异，不是座椅移动 |
| level0:5 | ZY/ZY-new/ZY/WG/WG_glass_F | Transform#189; MeshFilter#325 mesh=190; MeshRenderer#307 materials=9 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:6 | ZY/ZY-new/ZY/Ins/INS_SYS (1) | Transform#172 | 不明：无直接控制绑定 |
| level0:7 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_002 | Transform#200; MeshFilter#346 mesh=210; MeshRenderer#254 materials=26,29,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:8 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_003 | Transform#218; MeshFilter#369 mesh=175; MeshRenderer#317 materials=26,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:9 | ZY/ZY-new/ZY/Door/Door_LB | Transform#129; MonoBehaviour#418 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:10 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_R_F_004 | Transform#195; MeshFilter#367 mesh=186; MeshRenderer#305 materials=26,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:11 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (2)/Trie_B | Transform#128; MeshFilter#350 mesh=195; MeshRenderer#257 materials=58,60,59,3,57 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:12 | ZY/ZY-new/ZY/WG/WG_SYS (1)/WG_001_SYS | Transform#205; MeshFilter#381 mesh=208; MeshRenderer#273 materials=41,40,51,40,39 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:13 | ZY/ZY-new/ZY/WG/CHEPEI | Transform#226; MeshFilter#353 mesh=196; MeshRenderer#310 materials=53 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:14 | Charger_LINE | Transform#131; MeshFilter#343 mesh=171; MeshRenderer#263 materials=5; MonoBehaviour#399 Configurator.SceneCharging | 已利用：setCharging / setChargingCableVisible，原生材质流动 |
| level0:15 | mesh | Transform#132; MeshFilter#344 mesh=167; MeshRenderer#262 materials=7 | 已利用：Main.inner内饰入口绑定；interiorTab激活、jumpState(1)关闭，见feature-audit/next-step |
| level0:16 | ZY/ZY-new/ZY/Ins/INS_SYS | Transform#237 | 不明：无直接控制绑定 |
| level0:17 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_GLASS_02/Tiggle_RF | Transform#146; MonoBehaviour#402 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:18 | Charger_LINE/Shape001 | Transform#193; MeshFilter#373 mesh=162; MeshRenderer#318 materials=6 | 已利用：SceneCharging/Charger_LINE充电子树，随线缆显示控制；不是独立遗漏 |
| level0:19 | ZY/ZY-new/ZY/WG/WG_glass_Fb | Transform#175; MeshFilter#341 mesh=190; MeshRenderer#302 materials=10 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:20 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_GLASS_02/DOOL_L_F_GLASS | Transform#202; MeshFilter#387 mesh=178; MeshRenderer#312 materials=11 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:21 | ZY/ZY-new/ZY/WG/Light_ZXD_F | Transform#221; MeshFilter#340 mesh=184; MeshRenderer#306 materials=48 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:22 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_003 | Transform#147; MeshFilter#368 mesh=189; MeshRenderer#277 materials=19,35,32 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:23 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_001 | Transform#212; MeshFilter#335 mesh=165; MeshRenderer#296 materials=41,49,51 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:24 | ZY/ZY-new/ZY/Door/Door_LF/DOOR_HSJ/DOOR_HSJ | Transform#233; MeshFilter#330 mesh=192; MeshRenderer#250 materials=51,41,15,54 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:25 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (3)/Trie_B | Transform#150; MeshFilter#339 mesh=195; MeshRenderer#255 materials=58,60,59,3,57 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:26 | ZY/ZY-new/ZY/WG/WG_light_glass_B | Transform#169; MeshFilter#374 mesh=198; MeshRenderer#268 materials=14 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:27 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (2) | Transform#142 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:28 | ZY/ZY-new | Transform#230 | 不明：无直接控制绑定 |
| level0:29 | ZY/ZY-new/ZY/Trunk/LG2/LaGan_001 | Transform#138; MeshFilter#323 mesh=173; MeshRenderer#284 materials=49 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:30 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (1) | Transform#143 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:31 | ZY/ZY-new/ZY/Trunk/LG1 | Transform#166 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:32 | ZY/ZY-new/ZY/WG/Light_ZXD_B | Transform#239; MeshFilter#386 mesh=181; MeshRenderer#298 materials=55 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:33 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_R_F_004 | Transform#225; MeshFilter#380 mesh=186; MeshRenderer#292 materials=26,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:34 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_002 | Transform#227; MeshFilter#331 mesh=210; MeshRenderer#272 materials=26,29,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:35 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (1)/Trie_B | Transform#162; MeshFilter#336 mesh=195; MeshRenderer#281 materials=58,60,59,3,57 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:36 | ZY/ZY-new/ZY/Door/Door_RB | Transform#157; MonoBehaviour#420 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:37 | API | Transform#234; MonoBehaviour#404 Configurator.API; MonoBehaviour#416 ConfiguratorTest.APITest | 仅实验：API派发/测试宿主；具体公开映射见 components/API.md |
| level0:38 | ZY/ZY-new/ZY/Trunk/TURRNK_SKD_B | Transform#144; MeshFilter#349 mesh=170; MeshRenderer#248 materials=46 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:39 | ZY/ZY-new/ZY/Tires/Tires_b | Transform#174 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:40 | ZY/ZY-new/ZY/Tires | Transform#141 | 不明：无直接控制绑定 |
| level0:41 | ZY/ZY-new/ZY/WG/WG_SYS (1) | Transform#156 | 不明：无直接控制绑定 |
| level0:42 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_003 | Transform#199; MeshFilter#379 mesh=175; MeshRenderer#294 materials=26,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:43 | ZY/ZY-new/ZY/Tires/Tires_a/Trie_A (2) | Transform#153; MeshFilter#333 mesh=179; MeshRenderer#276 materials=58,60,57,2,59 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:44 | Road/Road/Line | Transform#165; MeshFilter#355 mesh=10210; MeshRenderer#301 materials=147 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:45 | ZY/ZY-new/ZY/Ins/INS_19 | Transform#211; MeshFilter#391 mesh=187; MeshRenderer#308 materials=23 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:46 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_003 | Transform#177; MeshFilter#382 mesh=189; MeshRenderer#258 materials=19,35,32 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:47 | ZY/ZY-new/ZY/Trunk/TURNK_GLASS | Transform#194; MeshFilter#329 mesh=185; MeshRenderer#270 materials=12 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:48 | ZY/ZY-new/ZY/Tires/Tires_a/Trie_A (1) | Transform#186; MeshFilter#324 mesh=179; MeshRenderer#275 materials=58,60,57,2,59 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:49 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_GLASS_01/Tiggle_LB | Transform#126; MonoBehaviour#415 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:50 | Scene/SceneOpening/car_forward | Transform#183; Animation#393 | 不明：无直接控制绑定 |
| level0:51 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_001 | Transform#236; MeshFilter#347 mesh=165; MeshRenderer#316 materials=41,49,51 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:52 | ZY/ZY-new/ZY/Tires/Tires_a/Trie_A (3) | Transform#167; MeshFilter#322 mesh=179; MeshRenderer#267 materials=58,60,57,2,59 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:53 | ZY/ZY-new/ZY/Door/Door_RF/DOOR_HSJ/DOOR_HSJ | Transform#215; MeshFilter#362 mesh=192; MeshRenderer#271 materials=51,41,15,54 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:54 | ZY/ZY-new/ZY/Trunk/LG2 | Transform#219 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:55 | ZY/ZY-new/ZY | Transform#140 | 不明：无直接控制绑定 |
| level0:56 | ZY/ZY-new/ZY/WG/WG_SYS | Transform#155 | 不明：无直接控制绑定 |
| level0:57 | Road/Road/Line | Transform#231; MeshFilter#375 mesh=10210; MeshRenderer#295 materials=147 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:58 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B (3) | Transform#170 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:59 | Main/CoverBG | Transform#180; MonoBehaviour#407 Common.Cover | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:60 | Main/CoverBlack | Transform#181; MonoBehaviour#408 Common.Cover | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:61 | Main/CoverWhite | Transform#182; MonoBehaviour#409 Common.Cover | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:62 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_GLASS_02/DOOL_L_F_GLASS | Transform#241; MeshFilter#376 mesh=178; MeshRenderer#286 materials=11 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:63 | ZY/ZY-new/ZY/Ins/INS21 | Transform#217; MeshFilter#351 mesh=176; MeshRenderer#300 materials=24 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:64 | ZY/ZY-new/ZY/Ins | Transform#198 | 不明：无直接控制绑定 |
| level0:65 | ZY/ZY-new/ZY/Ins/XP_INS_N1_N2 | Transform#136; MeshFilter#359 mesh=202; MeshRenderer#299 materials=26,18 | 仅实验：setCarseat/package选装资源active切换；未确认可见配置差异，不是座椅移动 |
| level0:66 | ZY/ZY-new/ZY/Trunk/LG1/LaGan_000 | Transform#130; MeshFilter#364 mesh=182; MeshRenderer#311 materials=49 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:67 | ZY/ZY-new/ZY/WG/Light_F | Transform#154; MeshFilter#356 mesh=209; MeshRenderer#280 materials=39,49,43 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:68 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_001 | Transform#207; MeshFilter#332 mesh=193; MeshRenderer#269 materials=51,41,49 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:69 | ZY/ZY-new/ZY/Trunk/CHEPEI_02 | Transform#178; MeshFilter#342 mesh=161; MeshRenderer#313 materials=53 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:70 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_GLASS_01/DOOL_L_B_GLASS | Transform#151; MeshFilter#384 mesh=203; MeshRenderer#314 materials=13 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:71 | Scene | Transform#191 | 不明：无直接控制绑定 |
| level0:72 | Road | Transform#192 | 不明：无直接控制绑定 |
| level0:73 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_GLASS_01/Tiggle_RB | Transform#190; MonoBehaviour#411 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:74 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_GLASS_02/Tiggle_LF | Transform#238; MonoBehaviour#410 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:75 | ZY/ZY-new/ZY/WG/Light_B | Transform#161; MeshFilter#320 mesh=207; MeshRenderer#251 materials=49,39 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:76 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_GLASS_02 | Transform#188 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:77 | ZY/ZY-new/ZY/Trunk/LG1/LaGan_001 | Transform#137; MeshFilter#361 mesh=188; MeshRenderer#303 materials=49 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:78 | ZY/ZY-new/ZY/Ins/INS_SYS/INS_8_SYS | Transform#243; MeshFilter#338 mesh=194; MeshRenderer#265 materials=36,26 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:79 | ZY/ZY-new/ZY/Tires/Tires_a/Trie_A | Transform#213; MeshFilter#383 mesh=179; MeshRenderer#291 materials=58,60,57,2,59 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:80 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_002 | Transform#127; MeshFilter#337 mesh=206; MeshRenderer#274 materials=26,29,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:81 | ZY/ZY-new/ZY/Door/Door_RF | Transform#208; MonoBehaviour#406 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:82 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_GLASS_01 | Transform#229 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:83 | Scene/SceneOpening | Transform#152; MonoBehaviour#400 Configurator.SceneOpeningApp; MonoBehaviour#401 Common.Cover | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:84 | ZY/ZY-new/ZY/WG/WG_SYS (1) | Transform#171 | 不明：无直接控制绑定 |
| level0:85 | ZY/ZY-new/ZY/Tires/Tires_a | Transform#160 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:86 | ZY | Transform#206; MonoBehaviour#412 Configurator.CarConfigurator | 已利用：原始车配置根；详细流程绑定非每个子网格独立控制 |
| level0:87 | ZY/ZY-new/ZY/Door/Door_RF/DOOR_HSJ | Transform#159 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:88 | ZY/ZY-new/ZY/Tires/Tires_b/Trie_B | Transform#203 | 已利用：setWheelType/原生驾驶流程子树；不承诺独立轮转角 |
| level0:89 | ZY/ZY-new/ZY/Ins/INS_03 | Transform#176; MeshFilter#370 mesh=204; MeshRenderer#315 materials=26,18,37,29,21,16,22,36,18 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:90 | Main | Transform#123; MonoBehaviour#419 StateMachine.StateMachineRunner; MonoBehaviour#405 Configurator.Main; MonoBehaviour#414 Configurator.InputMgr | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:91 | ZY/ZY-new/ZY/cube | Transform#242; MonoBehaviour#403 Configurator.TriggerBounds | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:92 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_005 | Transform#173; MeshFilter#358 mesh=201; MeshRenderer#261 materials=19,35,32 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:93 | ZY/ZY-new/ZY/WG | Transform#209 | 不明：无直接控制绑定 |
| level0:94 | ZY/ZY-new/ZY/WG/CDK/cdk | Transform#222; MeshFilter#326 mesh=169; MeshRenderer#282 materials=51,49 | 已利用：setChargingPortOpen，父枢轴姿态与真实canvas证据 |
| level0:95 | ZY/ZY-new/ZY/WG/WG_glass_TC | Transform#125; MeshFilter#321 mesh=177; MeshRenderer#297 materials=13 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:96 | ZY/ZY-new/ZY/WG/Light_SKD_B | Transform#210; MeshFilter#363 mesh=166; MeshRenderer#288 materials=46 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:97 | ZY/ZY-new/ZY/Trunk | Transform#224; Animation#394; MonoBehaviour#417 Configurator.TriggerBounds | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:98 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_001 | Transform#232; MeshFilter#348 mesh=193; MeshRenderer#249 materials=51,41,49 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:99 | ZY/ZY-new/ZY/WG/CDK | Transform#168 | 已利用：setChargingPortOpen，父枢轴姿态与真实canvas证据 |
| level0:100 | ZY/ZY-new/ZY/Door/Door_LB/DOOL_L_B_GLASS_01/DOOL_L_B_GLASS | Transform#184; MeshFilter#372 mesh=203; MeshRenderer#293 materials=13 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:101 | ZY/ZY-new/ZY/WG/Light_RXD_F | Transform#214; MeshFilter#390 mesh=197; MeshRenderer#256 materials=47 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:102 | ZY/ZY-new/ZY/Trunk/TURNK_Light_GLASS | Transform#196; MeshFilter#377 mesh=199; MeshRenderer#246 materials=14 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:103 | Road/Road | Transform#164; MonoBehaviour#421 Common.RoadMgr | 原生自动流程：typed脚本；TriggerBounds为点击/边界，非独立新功能 |
| level0:104 | ZY/ZY-new/ZY/Ins/XP_INS_N2 | Transform#204; MeshFilter#319 mesh=163; MeshRenderer#290 materials=18 | 仅实验：XP_INS选装资源候选；本节点独立绑定与可见差异未确认，不承诺独立动作或座椅移动 |
| level0:105 | ZY/ZY-new/ZY/WG/WG_SYS/WG_001_SYS | Transform#145; MeshFilter#366 mesh=208; MeshRenderer#304 materials=41,40,51,40,39 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:106 | ZY/ZY-new/ZY/WG/WG_SYS (1)/WG_001_SYS | Transform#139; MeshFilter#389 mesh=208; MeshRenderer#260 materials=41,40,51,40,39 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:107 | ZY/ZY-new/ZY/WG/WG_002 | Transform#220; MeshFilter#378 mesh=180; MeshRenderer#309 materials=49,44,41,56,51 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:108 | ZY/ZY-new/ZY/Door/Door_RF/DOOL_L_F_005 | Transform#149; MeshFilter#334 mesh=201; MeshRenderer#279 materials=19,35,32 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:109 | ZY/ZY-new/ZY/Trunk/TURNK_003 | Transform#187; MeshFilter#371 mesh=172; MeshRenderer#289 materials=51,49,45,37,44,41,39,44 | 已利用：toggleTrunk绑定子树；附属网格不单独控制 |
| level0:110 | ZY/ZY-new/ZY/WG/WG_glass_C | Transform#240; MeshFilter#388 mesh=174; MeshRenderer#252 materials=13 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:111 | ZY/ZY-new/ZY/Door/Door_LF | Transform#244; MonoBehaviour#413 Configurator.TriggerBounds | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:112 | ZY/ZY-new/ZY/SD | Transform#185; MeshFilter#385 mesh=183; MeshRenderer#266 materials=8 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:113 | ZY/ZY-new/ZY/Door/Door_LF/DOOR_HSJ | Transform#134 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:114 | ZY/ZY-new/ZY/Door | Transform#148 | 不明：无直接控制绑定 |
| level0:115 | ZY/ZY-new/ZY/Ins/INS_20 | Transform#216; MeshFilter#357 mesh=205; MeshRenderer#283 materials=35,38,32,19 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:116 | ZY/ZY-new/ZY/Door/Door_RB/DOOL_L_B_GLASS_01 | Transform#201 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:117 | ZY/ZY-new/ZY/WG/WG_light_glass_F | Transform#223; MeshFilter#352 mesh=200; MeshRenderer#278 materials=14 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:118 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_GLASS_02 | Transform#228 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:119 | ZY/ZY-new/ZY/Door/Door_LF/DOOL_L_F_002 | Transform#163; MeshFilter#327 mesh=206; MeshRenderer#247 materials=26,29,18 | 已利用：四门/窗原始绑定子树；静态门饰不是额外动作 |
| level0:120 | ZY/ZY-new/ZY/Ins/INS_SYS (1)/INS_8_SYS | Transform#158; MeshFilter#328 mesh=194; MeshRenderer#259 materials=36,26 | 未控制：独立静态渲染节点；不能只凭名称认为可动功能 |
| level0:121 | ZY/ZY-new/ZY/WG/WG_Light_FDIAN | Transform#179; MeshFilter#365 mesh=191; MeshRenderer#287 materials=42 | 已利用：原始灯组材质/流程绑定及现有灯光API；不承诺该renderer独立控制或完整联动时序 |
| level0:122 | Scene/SceneOpening/car_forward/+ | Transform#197 | 不明：无直接控制绑定 |
| resources.assets:17 | Content | RectTransform#676; MonoBehaviour#952 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1011 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#381; MonoBehaviour#1018 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:18 | Float | RectTransform#649; CanvasRenderer#441; MonoBehaviour#1116 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:19 | Y | RectTransform#707; MonoBehaviour#947 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:20 | Sliding Area | RectTransform#626 | 不明：无直接控制绑定 |
| resources.assets:21 | Content | RectTransform#709; MonoBehaviour#982 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1077 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#408; MonoBehaviour#945 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:22 | Float | RectTransform#632; CanvasRenderer#412; MonoBehaviour#1016 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:23 | Content | RectTransform#650; MonoBehaviour#943 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#993 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#398; MonoBehaviour#942 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:24 | Checkmark | RectTransform#723; CanvasRenderer#390; MonoBehaviour#984 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:25 | Text | RectTransform#601; CanvasRenderer#400; MonoBehaviour#999 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:26 | Float | RectTransform#679; CanvasRenderer#419; MonoBehaviour#959 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:27 | DebugUIValuePersistent | RectTransform#694; MonoBehaviour#1089 UnityEngine.Rendering.UI.DebugUIHandlerValue | 不明：无直接控制绑定 |
| resources.assets:28 | DebugUIValueTuple | RectTransform#695; MonoBehaviour#1133 UnityEngine.Rendering.UI.DebugUIHandlerValueTuple | 不明：无直接控制绑定 |
| resources.assets:29 | DebugUIObject | RectTransform#696; MonoBehaviour#1168 UnityEngine.Rendering.UI.DebugUIHandlerObject | 不明：无直接控制绑定 |
| resources.assets:30 | DebugUIIntField | RectTransform#697; MonoBehaviour#1119 UnityEngine.Rendering.UI.DebugUIHandlerIntField | 不明：无直接控制绑定 |
| resources.assets:31 | DebugUIProgressBar | RectTransform#698; MonoBehaviour#1184 UnityEngine.Rendering.UI.DebugUIHandlerProgressBar | 不明：无直接控制绑定 |
| resources.assets:32 | DebugUIFloatField | RectTransform#699; MonoBehaviour#1081 UnityEngine.Rendering.UI.DebugUIHandlerFloatField | 不明：无直接控制绑定 |
| resources.assets:33 | DebugUIValue | RectTransform#700; MonoBehaviour#1090 UnityEngine.Rendering.UI.DebugUIHandlerValue | 不明：无直接控制绑定 |
| resources.assets:34 | DebugUIUIntField | RectTransform#701; MonoBehaviour#1075 UnityEngine.Rendering.UI.DebugUIHandlerUIntField | 不明：无直接控制绑定 |
| resources.assets:35 | B | RectTransform#647; MonoBehaviour#1102 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:36 | Arrow Closed | RectTransform#657; CanvasRenderer#382; MonoBehaviour#1114 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:37 | Arrow Closed | RectTransform#658; CanvasRenderer#383; MonoBehaviour#1115 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:38 | Text | RectTransform#678; CanvasRenderer#402; MonoBehaviour#1012 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:39 | Float | RectTransform#677; CanvasRenderer#437; MonoBehaviour#1097 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:40 | Arrow Opened | RectTransform#689; CanvasRenderer#367; MonoBehaviour#989 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:41 | Arrow Closed | RectTransform#635; CanvasRenderer#443; MonoBehaviour#992 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:42 | Float | RectTransform#620; CanvasRenderer#407; MonoBehaviour#1013 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:43 | Text | RectTransform#727; CanvasRenderer#393; MonoBehaviour#1033 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:44 | Text | RectTransform#724; CanvasRenderer#370; MonoBehaviour#971 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:45 | DebugUICanvas | RectTransform#691; Canvas#589; MonoBehaviour#1109 UnityEngine.UI.CanvasScaler; MonoBehaviour#1071 UnityEngine.UI.GraphicRaycaster; MonoBehaviour#1039 UnityEngine.Rendering.UI.DebugUIHandlerCanvas | 不明：无直接控制绑定 |
| resources.assets:46 | Content | RectTransform#607; MonoBehaviour#975 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1087 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#409; MonoBehaviour#980 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:47 | Content | RectTransform#608; MonoBehaviour#976 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1088 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#410; MonoBehaviour#981 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:48 | Handle | RectTransform#599; CanvasRenderer#401; MonoBehaviour#978 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:49 | W | RectTransform#633; MonoBehaviour#1110 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:50 | Y | RectTransform#654; MonoBehaviour#1072 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:51 | Scrollbar Horizontal | RectTransform#675; CanvasRenderer#424; MonoBehaviour#1059 UnityEngine.UI.Image; MonoBehaviour#951 UnityEngine.UI.Scrollbar; MonoBehaviour#1232 UnityEngine.EventSystems.EventTrigger | 不明：无直接控制绑定 |
| resources.assets:52 | Text | RectTransform#685; CanvasRenderer#414; MonoBehaviour#1066 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:53 | Text | RectTransform#636; CanvasRenderer#429; MonoBehaviour#1049 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:54 | Text | RectTransform#637; CanvasRenderer#430; MonoBehaviour#1050 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:55 | Text | RectTransform#638; CanvasRenderer#431; MonoBehaviour#1051 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:56 | Text | RectTransform#639; CanvasRenderer#432; MonoBehaviour#1052 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:57 | Text | RectTransform#640; CanvasRenderer#433; MonoBehaviour#1053 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:58 | Text | RectTransform#641; CanvasRenderer#434; MonoBehaviour#1054 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:59 | Text | RectTransform#642; CanvasRenderer#435; MonoBehaviour#1055 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:60 | Text | RectTransform#643; CanvasRenderer#436; MonoBehaviour#1056 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:61 | X | RectTransform#631; MonoBehaviour#1083 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:62 | DebugUIColor | RectTransform#681; MonoBehaviour#1021 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1015 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1096 UnityEngine.Rendering.UI.DebugUIHandlerColor; MonoBehaviour#961 UnityEngine.Rendering.UI.DebugUIHandlerContainer | 不明：无直接控制绑定 |
| resources.assets:63 | Header | RectTransform#687; MonoBehaviour#949 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:64 | Text | RectTransform#714; CanvasRenderer#368; MonoBehaviour#1098 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:65 | Text | RectTransform#716; CanvasRenderer#415; MonoBehaviour#1122 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:66 | Float | RectTransform#666; CanvasRenderer#420; MonoBehaviour#970 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:67 | DebugUIHBox | RectTransform#693; MonoBehaviour#1125 UnityEngine.UI.HorizontalLayoutGroup; MonoBehaviour#996 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1042 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#946 UnityEngine.Rendering.UI.DebugUIHandlerHBox | 不明：无直接控制绑定 |
| resources.assets:68 | DebugUIEnumField | RectTransform#627; MonoBehaviour#1032 UnityEngine.Rendering.UI.DebugUIHandlerEnumField | 不明：无直接控制绑定 |
| resources.assets:69 | DebugUIObjectList | RectTransform#628; MonoBehaviour#1180 UnityEngine.Rendering.UI.DebugUIHandlerObjectList | 不明：无直接控制绑定 |
| resources.assets:70 | Text | RectTransform#605; CanvasRenderer#417; MonoBehaviour#1094 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:71 | Text | RectTransform#606; CanvasRenderer#418; MonoBehaviour#1095 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:72 | Text | RectTransform#597; CanvasRenderer#372; MonoBehaviour#963 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:73 | DebugUIButton | RectTransform#660; CanvasRenderer#438; MonoBehaviour#965 UnityEngine.UI.Image; MonoBehaviour#1019 UnityEngine.UI.Button; MonoBehaviour#987 UnityEngine.Rendering.UI.DebugUIHandlerButton | 不明：无直接控制绑定 |
| resources.assets:74 | Text | RectTransform#630; CanvasRenderer#413; MonoBehaviour#940 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:75 | Arrow Opened | RectTransform#623; CanvasRenderer#399; MonoBehaviour#973 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:76 | DebugUI Persistent Panel | RectTransform#665; CanvasRenderer#380; MonoBehaviour#1038 UnityEngine.UI.Image; MonoBehaviour#1003 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#986 UnityEngine.UI.ContentSizeFitter | 不明：无直接控制绑定 |
| resources.assets:77 | DebugUIToggle | RectTransform#612; MonoBehaviour#964 UnityEngine.Rendering.UI.DebugUIHandlerToggle | 不明：无直接控制绑定 |
| resources.assets:78 | Header | RectTransform#692; MonoBehaviour#974 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:79 | Text | RectTransform#644; CanvasRenderer#442; MonoBehaviour#1112 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:80 | DebugUIVector3 | RectTransform#610; MonoBehaviour#998 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1005 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#977 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1113 UnityEngine.Rendering.UI.DebugUIHandlerVector3 | 不明：无直接控制绑定 |
| resources.assets:81 | DebugUIPanel | RectTransform#662; CanvasRenderer#386; MonoBehaviour#1069 UnityEngine.UI.Image; MonoBehaviour#968 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#954 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#994 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#941 UnityEngine.Rendering.UI.DebugUIHandlerPanel | 不明：无直接控制绑定 |
| resources.assets:82 | Float | RectTransform#680; CanvasRenderer#389; MonoBehaviour#1082 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:83 | Content | RectTransform#726; MonoBehaviour#948 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1070 UnityEngine.UI.ContentSizeFitter | 不明：无直接控制绑定 |
| resources.assets:84 | Value | RectTransform#703; CanvasRenderer#375; MonoBehaviour#1035 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:85 | Value | RectTransform#704; CanvasRenderer#376; MonoBehaviour#1036 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:86 | Text | RectTransform#613; CanvasRenderer#411; MonoBehaviour#1103 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:87 | Y | RectTransform#708; MonoBehaviour#1099 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:88 | Arrow Closed | RectTransform#659; CanvasRenderer#426; MonoBehaviour#966 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:89 | Text | RectTransform#688; CanvasRenderer#439; MonoBehaviour#1048 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:90 | Float | RectTransform#686; CanvasRenderer#385; MonoBehaviour#988 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:91 | Arrow Closed | RectTransform#673; CanvasRenderer#379; MonoBehaviour#1007 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:92 | Text | RectTransform#596; CanvasRenderer#425; MonoBehaviour#957 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:93 | Color | RectTransform#624; CanvasRenderer#391; MonoBehaviour#1086 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:94 | Header | RectTransform#622; MonoBehaviour#1058 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:95 | Handle | RectTransform#646; CanvasRenderer#440; MonoBehaviour#1078 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:96 | Float | RectTransform#653; CanvasRenderer#373; MonoBehaviour#956 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:97 | A | RectTransform#722; MonoBehaviour#1014 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:98 | Header | RectTransform#702; MonoBehaviour#958 UnityEngine.UI.LayoutElement | 不明：无直接控制绑定 |
| resources.assets:99 | Text | RectTransform#706; CanvasRenderer#422; MonoBehaviour#1037 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:100 | Arrow Opened | RectTransform#720; CanvasRenderer#397; MonoBehaviour#1025 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:101 | Value | RectTransform#667; CanvasRenderer#446; MonoBehaviour#1026 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:102 | Value | RectTransform#668; CanvasRenderer#447; MonoBehaviour#1027 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:103 | Value | RectTransform#669; CanvasRenderer#448; MonoBehaviour#1028 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:104 | Value | RectTransform#670; CanvasRenderer#449; MonoBehaviour#1029 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:105 | Float | RectTransform#671; CanvasRenderer#450; MonoBehaviour#1030 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:106 | Value | RectTransform#672; CanvasRenderer#451; MonoBehaviour#1031 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:107 | Text | RectTransform#717; CanvasRenderer#423; MonoBehaviour#1008 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:108 | Header | RectTransform#690 | 不明：无直接控制绑定 |
| resources.assets:109 | DebugUIGroup | RectTransform#634; MonoBehaviour#1068 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1020 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#991 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1009 UnityEngine.Rendering.UI.DebugUIHandlerGroup | 不明：无直接控制绑定 |
| resources.assets:110 | Arrow Opened | RectTransform#712; CanvasRenderer#395; MonoBehaviour#1040 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:111 | Arrow Opened | RectTransform#713; CanvasRenderer#396; MonoBehaviour#1041 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:112 | Content | RectTransform#705; MonoBehaviour#1043 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1079 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#388; MonoBehaviour#990 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:113 | X | RectTransform#683; MonoBehaviour#1010 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:114 | Scrollbar Vertical | RectTransform#629; CanvasRenderer#371; MonoBehaviour#1044 UnityEngine.UI.Image; MonoBehaviour#1034 UnityEngine.UI.Scrollbar; MonoBehaviour#1330 UnityEngine.EventSystems.EventTrigger | 不明：无直接控制绑定 |
| resources.assets:115 | Float | RectTransform#598; CanvasRenderer#406; MonoBehaviour#953 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:116 | Header | RectTransform#655; MonoBehaviour#1046 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:117 | Header | RectTransform#656; MonoBehaviour#1047 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:118 | Text | RectTransform#648; CanvasRenderer#384; MonoBehaviour#1022 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:119 | Float | RectTransform#625; CanvasRenderer#377; MonoBehaviour#983 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:120 | Text | RectTransform#725; CanvasRenderer#378; MonoBehaviour#1067 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:121 | R | RectTransform#600; MonoBehaviour#1118 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:122 | Arrow Closed | RectTransform#664; CanvasRenderer#421; MonoBehaviour#972 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:123 | Z | RectTransform#715; MonoBehaviour#1091 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:124 | Arrow Opened | RectTransform#684; CanvasRenderer#416; MonoBehaviour#1108 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:125 | DebugUIVector4 | RectTransform#645; MonoBehaviour#960 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1123 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1092 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1104 UnityEngine.Rendering.UI.DebugUIHandlerVector4 | 不明：无直接控制绑定 |
| resources.assets:126 | Text | RectTransform#619; CanvasRenderer#374; MonoBehaviour#1017 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:127 | DebugUIPersistentCanvas | RectTransform#674; Canvas#588; MonoBehaviour#1101 UnityEngine.UI.CanvasScaler; MonoBehaviour#969 UnityEngine.UI.GraphicRaycaster; MonoBehaviour#1057 UnityEngine.Rendering.UI.DebugUIHandlerPersistentCanvas | 不明：无直接控制绑定 |
| resources.assets:128 | Header | RectTransform#682; MonoBehaviour#1085 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:129 | DebugUIVector2 | RectTransform#621; MonoBehaviour#1093 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#985 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1073 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1121 UnityEngine.Rendering.UI.DebugUIHandlerVector2 | 不明：无直接控制绑定 |
| resources.assets:130 | G | RectTransform#611; MonoBehaviour#944 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:131 | Toggle | RectTransform#711; MonoBehaviour#1111 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:132 | Sliding Area | RectTransform#719 | 不明：无直接控制绑定 |
| resources.assets:133 | DebugUIMessageBox | RectTransform#602; MonoBehaviour#1105 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1061 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1179 UnityEngine.Rendering.UI.DebugUIHandlerMessageBox; CanvasRenderer#553; MonoBehaviour#1203 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:134 | DebugUIFoldout | RectTransform#603; MonoBehaviour#1106 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1062 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1023 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1064 UnityEngine.Rendering.UI.DebugUIHandlerFoldout | 不明：无直接控制绑定 |
| resources.assets:135 | DebugUIRow | RectTransform#604; MonoBehaviour#1107 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1063 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1024 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1065 UnityEngine.Rendering.UI.DebugUIHandlerRow | 不明：无直接控制绑定 |
| resources.assets:136 | Background | RectTransform#651; CanvasRenderer#387; MonoBehaviour#962 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:137 | Text | RectTransform#615; CanvasRenderer#403; MonoBehaviour#1000 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:138 | Text | RectTransform#616; CanvasRenderer#404; MonoBehaviour#1001 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:139 | Text | RectTransform#617; CanvasRenderer#405; MonoBehaviour#1002 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:140 | Text | RectTransform#614; CanvasRenderer#444; MonoBehaviour#1074 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:141 | Float | RectTransform#618; CanvasRenderer#394; MonoBehaviour#1060 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:142 | Viewport | RectTransform#652; CanvasRenderer#445; MonoBehaviour#997 UnityEngine.UI.Mask; MonoBehaviour#1124 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:143 | Z | RectTransform#710; MonoBehaviour#1117 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:144 | DebugUIVBox | RectTransform#663; MonoBehaviour#1120 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#967 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1006 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1080 UnityEngine.Rendering.UI.DebugUIHandlerVBox | 不明：无直接控制绑定 |
| resources.assets:145 | X | RectTransform#661; MonoBehaviour#1084 UnityEngine.Rendering.UI.DebugUIHandlerIndirectFloatField | 不明：无直接控制绑定 |
| resources.assets:146 | Scroll View | RectTransform#609; CanvasRenderer#392; MonoBehaviour#1045 UnityEngine.UI.ScrollRect; MonoBehaviour#979 UnityEngine.UI.Image; MonoBehaviour#1076 UnityEngine.UI.LayoutElement | 不明：无直接控制绑定 |
| resources.assets:147 | Text | RectTransform#718; CanvasRenderer#369; MonoBehaviour#1004 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:148 | Content | RectTransform#595; MonoBehaviour#995 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#955 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#428; MonoBehaviour#1100 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:149 | Float | RectTransform#721; CanvasRenderer#427; MonoBehaviour#950 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:150 | Checkmark | RectTransform#768; CanvasRenderer#554; MonoBehaviour#1255 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:151 | Toggle | RectTransform#891; MonoBehaviour#1343 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:152 | Background | RectTransform#865; CanvasRenderer#483; MonoBehaviour#1241 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:153 | Text | RectTransform#753; CanvasRenderer#467; MonoBehaviour#1196 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:154 | Background | RectTransform#918; CanvasRenderer#484; MonoBehaviour#1253 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:155 | Background | RectTransform#834; CanvasRenderer#499; MonoBehaviour#1151 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:156 | Checkmark | RectTransform#751; CanvasRenderer#583; MonoBehaviour#1251 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:157 | DebugUI Toggle 22 | RectTransform#766; MonoBehaviour#1361 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:158 | Checkmark | RectTransform#922; CanvasRenderer#460; MonoBehaviour#1214 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:159 | Previous | RectTransform#833; CanvasRenderer#577; MonoBehaviour#1223 UnityEngine.UI.Image; MonoBehaviour#1157 UnityEngine.UI.Button | 不明：无直接控制绑定 |
| resources.assets:160 | Checkmark | RectTransform#829; CanvasRenderer#531; MonoBehaviour#1341 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:161 | Background | RectTransform#804; CanvasRenderer#575; MonoBehaviour#1317 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:162 | Title | RectTransform#789; CanvasRenderer#466; MonoBehaviour#1325 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:163 | <<< | RectTransform#749; CanvasRenderer#462; MonoBehaviour#1144 UnityEngine.UI.Button; MonoBehaviour#1212 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:164 | Value | RectTransform#929; CanvasRenderer#555; MonoBehaviour#1324 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:165 | Panel | RectTransform#816; CanvasRenderer#506; MonoBehaviour#1358 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:166 | Text | RectTransform#762; CanvasRenderer#543; MonoBehaviour#1307 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:167 | Text | RectTransform#783; CanvasRenderer#515; MonoBehaviour#1204 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:168 | > | RectTransform#904; CanvasRenderer#585; MonoBehaviour#1143 UnityEngine.UI.Button; MonoBehaviour#1156 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:169 | Checkmark | RectTransform#788; CanvasRenderer#455; MonoBehaviour#1348 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:170 | Text | RectTransform#772; CanvasRenderer#586; MonoBehaviour#1139 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:171 | DebugUI Toggle 28 | RectTransform#780; MonoBehaviour#1318 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:172 | Text | RectTransform#769; CanvasRenderer#557; MonoBehaviour#1142 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:173 | Toggle | RectTransform#874; MonoBehaviour#1176 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:174 | Int | RectTransform#916; CanvasRenderer#565; MonoBehaviour#1239 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:175 | > | RectTransform#792; CanvasRenderer#512; MonoBehaviour#1147 UnityEngine.UI.Button; MonoBehaviour#1249 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:176 | Checkmark | RectTransform#841; CanvasRenderer#513; MonoBehaviour#1245 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:177 | Text | RectTransform#860; CanvasRenderer#572; MonoBehaviour#1145 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:178 | Text | RectTransform#739; CanvasRenderer#530; MonoBehaviour#1270 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:179 | Text | RectTransform#882; CanvasRenderer#542; MonoBehaviour#1127 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:180 | DebugUI Toggle 17 | RectTransform#771; MonoBehaviour#1351 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:181 | Next | RectTransform#869; CanvasRenderer#568; MonoBehaviour#1280 UnityEngine.UI.Image; MonoBehaviour#1160 UnityEngine.UI.Button | 不明：无直接控制绑定 |
| resources.assets:182 | Text | RectTransform#920; CanvasRenderer#504; MonoBehaviour#1274 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:183 | Text | RectTransform#747; CanvasRenderer#574; MonoBehaviour#1220 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:184 | Toggle | RectTransform#736; MonoBehaviour#1301 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:185 | Background | RectTransform#767; CanvasRenderer#487; MonoBehaviour#1227 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:186 | Toggle | RectTransform#849; MonoBehaviour#1186 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:187 | Toggle | RectTransform#759; MonoBehaviour#1268 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:188 | Panel | RectTransform#870 | 不明：无直接控制绑定 |
| resources.assets:189 | DebugUI Toggle 13 | RectTransform#803; MonoBehaviour#1304 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:190 | Text | RectTransform#851; CanvasRenderer#521; MonoBehaviour#1336 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:191 | Background | RectTransform#745; CanvasRenderer#465; MonoBehaviour#1329 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:192 | DebugUI Toggle 24 | RectTransform#775; MonoBehaviour#1296 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:193 | Background | RectTransform#791; CanvasRenderer#536; MonoBehaviour#1278 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:194 | DebugUI Toggle 6 | RectTransform#806; MonoBehaviour#1328 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:195 | UInt | RectTransform#734; CanvasRenderer#561; MonoBehaviour#1228 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:196 | Background | RectTransform#802; CanvasRenderer#475; MonoBehaviour#1154 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:197 | Toggle | RectTransform#836; MonoBehaviour#1136 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:198 | Checkmark | RectTransform#735; CanvasRenderer#516; MonoBehaviour#1269 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:199 | Background | RectTransform#847; CanvasRenderer#556; MonoBehaviour#1211 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:200 | Checkmark | RectTransform#894; CanvasRenderer#464; MonoBehaviour#1256 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:201 | Background | RectTransform#758; CanvasRenderer#497; MonoBehaviour#1189 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:202 | Background | RectTransform#892; CanvasRenderer#490; MonoBehaviour#1356 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:203 | Checkmark | RectTransform#878; CanvasRenderer#488; MonoBehaviour#1242 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:204 | Checkmark | RectTransform#900; CanvasRenderer#511; MonoBehaviour#1313 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:205 | Toggle | RectTransform#757; MonoBehaviour#1146 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:206 | Checkmark | RectTransform#740; CanvasRenderer#533; MonoBehaviour#1354 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:207 | Toggle | RectTransform#812; MonoBehaviour#1138 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:208 | Text | RectTransform#840; CanvasRenderer#534; MonoBehaviour#1166 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:209 | Background | RectTransform#879; CanvasRenderer#560; MonoBehaviour#1360 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:210 | Toggle | RectTransform#907; MonoBehaviour#1165 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:211 | Checkmark | RectTransform#754; CanvasRenderer#570; MonoBehaviour#1135 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:212 | Background | RectTransform#755; CanvasRenderer#551; MonoBehaviour#1316 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:213 | Background | RectTransform#908; CanvasRenderer#505; MonoBehaviour#1221 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:214 | Checkmark | RectTransform#805; CanvasRenderer#507; MonoBehaviour#1365 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:215 | < | RectTransform#935; CanvasRenderer#519; MonoBehaviour#1150 UnityEngine.UI.Button; MonoBehaviour#1222 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:216 | Toggle | RectTransform#880; MonoBehaviour#1126 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:217 | Toggle | RectTransform#899; MonoBehaviour#1161 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:218 | Toggle | RectTransform#733; MonoBehaviour#1252 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:219 | DebugUI Toggle 4 | RectTransform#810; MonoBehaviour#1149 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:220 | Toggle | RectTransform#893; MonoBehaviour#1353 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:221 | DebugUI Toggle 3 | RectTransform#927; MonoBehaviour#1193 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:222 | Panel | RectTransform#884 | 不明：无直接控制绑定 |
| resources.assets:223 | DebugUI Toggle 9 | RectTransform#905; MonoBehaviour#1326 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:224 | Background | RectTransform#798; CanvasRenderer#502; MonoBehaviour#1200 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:225 | Toggle | RectTransform#795; MonoBehaviour#1201 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:226 | Text | RectTransform#794; CanvasRenderer#501; MonoBehaviour#1199 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:227 | DebugUI Toggle 0 | RectTransform#797; MonoBehaviour#1205 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:228 | Checkmark | RectTransform#796; CanvasRenderer#500; MonoBehaviour#1198 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:229 | Background | RectTransform#832; CanvasRenderer#522; MonoBehaviour#1273 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:230 | Text | RectTransform#787; CanvasRenderer#584; MonoBehaviour#1167 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:231 | Toggle | RectTransform#919; MonoBehaviour#1327 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:232 | Checkmark | RectTransform#923; CanvasRenderer#524; MonoBehaviour#1224 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:233 | Checkmark | RectTransform#743; CanvasRenderer#547; MonoBehaviour#1332 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:234 | DebugUIEnumHistory | RectTransform#921; MonoBehaviour#1297 UnityEngine.Rendering.UI.DebugUIHandlerEnumHistory | 不明：无直接控制绑定 |
| resources.assets:235 | Checkmark | RectTransform#831; CanvasRenderer#473; MonoBehaviour#1323 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:236 | DebugUI Toggle 25 | RectTransform#895; MonoBehaviour#1169 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:237 | Text | RectTransform#820; CanvasRenderer#537; MonoBehaviour#1298 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:238 | Text | RectTransform#866; CanvasRenderer#469; MonoBehaviour#1171 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:239 | Text | RectTransform#881; CanvasRenderer#478; MonoBehaviour#1207 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:240 | Toggle | RectTransform#875; MonoBehaviour#1342 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:241 | DebugUI Toggle 11 | RectTransform#928; MonoBehaviour#1344 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:242 | Toggle | RectTransform#872; MonoBehaviour#1197 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:243 | Toggle | RectTransform#821; MonoBehaviour#1357 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:244 | Toggle | RectTransform#761; MonoBehaviour#1209 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:245 | DebugUI Toggle 26 | RectTransform#877; MonoBehaviour#1155 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:246 | Text | RectTransform#818; CanvasRenderer#510; MonoBehaviour#1218 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:247 | DebugUIObjectPopupField | RectTransform#817; MonoBehaviour#1183 UnityEngine.Rendering.UI.DebugUIHandlerObjectPopupField | 不明：无直接控制绑定 |
| resources.assets:248 | Value | RectTransform#819; CanvasRenderer#509; MonoBehaviour#1217 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:249 | Background | RectTransform#744; CanvasRenderer#477; MonoBehaviour#1310 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:250 | DebugUI Toggle 18 | RectTransform#785; MonoBehaviour#1335 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:251 | Checkmark | RectTransform#750; CanvasRenderer#559; MonoBehaviour#1234 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:252 | Text | RectTransform#883; CanvasRenderer#463; MonoBehaviour#1247 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:253 | Reset Button | RectTransform#738; CanvasRenderer#453; MonoBehaviour#1276 UnityEngine.UI.Image; MonoBehaviour#1215 UnityEngine.UI.Button | 不明：无直接控制绑定 |
| resources.assets:254 | Background | RectTransform#731; CanvasRenderer#552; MonoBehaviour#1153 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:255 | Text | RectTransform#896; CanvasRenderer#548; MonoBehaviour#1162 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:256 | Background | RectTransform#871; CanvasRenderer#489; MonoBehaviour#1246 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:257 | Checkmark | RectTransform#748; CanvasRenderer#562; MonoBehaviour#1294 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:258 | Background | RectTransform#868; CanvasRenderer#508; MonoBehaviour#1181 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:259 | Background | RectTransform#835; CanvasRenderer#366; MonoBehaviour#938 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:260 | Toggle | RectTransform#930; MonoBehaviour#1192 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:261 | Text | RectTransform#811; CanvasRenderer#532; MonoBehaviour#1235 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:262 | Text | RectTransform#809; CanvasRenderer#545; MonoBehaviour#1159 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:263 | Panel | RectTransform#591 | 不明：无直接控制绑定 |
| resources.assets:264 | Panel | RectTransform#592 | 不明：无直接控制绑定 |
| resources.assets:265 | < | RectTransform#888; CanvasRenderer#520; MonoBehaviour#1191 UnityEngine.UI.Button; MonoBehaviour#1163 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:266 | DebugUI Toggle 8 | RectTransform#793; MonoBehaviour#1345 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:267 | Text | RectTransform#861; CanvasRenderer#569; MonoBehaviour#1202 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:268 | Checkmark | RectTransform#842; CanvasRenderer#525; MonoBehaviour#1260 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:269 | Toggle | RectTransform#843; MonoBehaviour#1261 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:270 | DebugUI Toggle 1 | RectTransform#844; MonoBehaviour#1262 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:271 | Text | RectTransform#845; CanvasRenderer#526; MonoBehaviour#1263 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:272 | Background | RectTransform#846; CanvasRenderer#527; MonoBehaviour#1264 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:273 | DebugUI Toggle 27 | RectTransform#784; MonoBehaviour#1355 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:274 | Checkmark | RectTransform#728; CanvasRenderer#476; MonoBehaviour#1148 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:275 | > | RectTransform#824; CanvasRenderer#517; MonoBehaviour#1265 UnityEngine.UI.Button; MonoBehaviour#1238 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:276 | Increment | RectTransform#863; CanvasRenderer#493; MonoBehaviour#1128 UnityEngine.UI.Button; MonoBehaviour#1140 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:277 | Increment | RectTransform#864; CanvasRenderer#494; MonoBehaviour#1129 UnityEngine.UI.Button; MonoBehaviour#1141 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:278 | Text | RectTransform#903; CanvasRenderer#549; MonoBehaviour#1172 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:279 | Background | RectTransform#770; CanvasRenderer#472; MonoBehaviour#1349 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:280 | >>> | RectTransform#906; CanvasRenderer#474; MonoBehaviour#1258 UnityEngine.UI.Button; MonoBehaviour#1170 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:281 | Text | RectTransform#915; CanvasRenderer#566; MonoBehaviour#1338 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:282 | Checkmark | RectTransform#773; CanvasRenderer#461; MonoBehaviour#1259 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:283 | DebugUI Toggle 15 | RectTransform#815; MonoBehaviour#1190 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:284 | Checkmark | RectTransform#777; CanvasRenderer#581; MonoBehaviour#1219 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:285 | Arrow Closed | RectTransform#854; CanvasRenderer#539; MonoBehaviour#1287 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:286 | Text | RectTransform#857; CanvasRenderer#538; MonoBehaviour#1289 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:287 | Arrow Opened | RectTransform#858; CanvasRenderer#541; MonoBehaviour#1291 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:288 | Header | RectTransform#859; MonoBehaviour#1286 UnityEngine.Rendering.UI.UIFoldout | 不明：无直接控制绑定 |
| resources.assets:289 | Checkmark | RectTransform#786; CanvasRenderer#523; MonoBehaviour#1321 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:290 | DebugUIBitField | RectTransform#856; MonoBehaviour#1285 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1283 UnityEngine.UI.ContentSizeFitter; MonoBehaviour#1288 UnityEngine.Rendering.UI.DebugUIHandlerContainer; MonoBehaviour#1295 UnityEngine.Rendering.UI.DebugUIHandlerBitField | 不明：无直接控制绑定 |
| resources.assets:291 | Content | RectTransform#853; MonoBehaviour#1290 UnityEngine.UI.VerticalLayoutGroup; MonoBehaviour#1284 UnityEngine.UI.ContentSizeFitter; CanvasRenderer#540; MonoBehaviour#1282 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:292 | DebugUI Toggle 21 | RectTransform#790; MonoBehaviour#1266 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:293 | Text | RectTransform#801; CanvasRenderer#486; MonoBehaviour#1237 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:294 | Decrement | RectTransform#764; CanvasRenderer#528; MonoBehaviour#1314 UnityEngine.UI.Button; MonoBehaviour#1292 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:295 | Decrement | RectTransform#765; CanvasRenderer#529; MonoBehaviour#1315 UnityEngine.UI.Button; MonoBehaviour#1293 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:296 | Checkmark | RectTransform#756; CanvasRenderer#468; MonoBehaviour#1188 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:297 | Toggle | RectTransform#913; MonoBehaviour#1267 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:298 | Toggle | RectTransform#862; MonoBehaviour#1244 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:299 | Footer | RectTransform#782; MonoBehaviour#1331 UnityEngine.UI.LayoutElement | 不明：无直接控制绑定 |
| resources.assets:300 | Text | RectTransform#852; CanvasRenderer#514; MonoBehaviour#1195 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:301 | DebugUI Toggle 30 | RectTransform#781; MonoBehaviour#1152 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:302 | Text | RectTransform#776; CanvasRenderer#550; MonoBehaviour#1334 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:303 | Checkmark | RectTransform#808; CanvasRenderer#579; MonoBehaviour#1248 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:304 | Toggle | RectTransform#807; MonoBehaviour#1236 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:305 | Checkmark | RectTransform#774; CanvasRenderer#544; MonoBehaviour#1137 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:306 | Panel | RectTransform#887; CanvasRenderer#482; MonoBehaviour#1226 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:307 | Panel | RectTransform#910 | 不明：无直接控制绑定 |
| resources.assets:308 | Panel | RectTransform#911 | 不明：无直接控制绑定 |
| resources.assets:309 | Toggle | RectTransform#737; MonoBehaviour#1130 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:310 | Background | RectTransform#901; CanvasRenderer#452; MonoBehaviour#1132 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:311 | Background | RectTransform#779; CanvasRenderer#457; MonoBehaviour#1306 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:312 | DebugUI Toggle 10 | RectTransform#925; MonoBehaviour#1206 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:313 | <<< | RectTransform#760; CanvasRenderer#564; MonoBehaviour#1281 UnityEngine.UI.Button; MonoBehaviour#1322 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:314 | DebugUI Toggle 16 | RectTransform#830; MonoBehaviour#1208 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:315 | Toggle | RectTransform#936; MonoBehaviour#1164 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:316 | DebugUI Toggle 7 | RectTransform#931; MonoBehaviour#1229 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:317 | Toggle | RectTransform#897; MonoBehaviour#1174 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:318 | Background | RectTransform#898; CanvasRenderer#503; MonoBehaviour#1173 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:319 | < | RectTransform#729; CanvasRenderer#535; MonoBehaviour#1231 UnityEngine.UI.Button; MonoBehaviour#1178 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:320 | <<< | RectTransform#889; CanvasRenderer#546; MonoBehaviour#1364 UnityEngine.UI.Button; MonoBehaviour#1300 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:321 | Background | RectTransform#890; CanvasRenderer#459; MonoBehaviour#1134 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:322 | DebugUI Toggle 23 | RectTransform#926; MonoBehaviour#1346 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:323 | Background | RectTransform#885; CanvasRenderer#518; MonoBehaviour#1308 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:324 | Toggle | RectTransform#837; MonoBehaviour#1194 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:325 | Background | RectTransform#827; CanvasRenderer#365; MonoBehaviour#1175 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:326 | Text | RectTransform#590; CanvasRenderer#492; MonoBehaviour#1182 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:327 | >>> | RectTransform#850; CanvasRenderer#571; MonoBehaviour#1254 UnityEngine.UI.Button; MonoBehaviour#939 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:328 | Progress | RectTransform#799; CanvasRenderer#481; MonoBehaviour#1279 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:329 | DebugUI Toggle 5 | RectTransform#741; MonoBehaviour#1302 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:330 | Background | RectTransform#730; CanvasRenderer#587; MonoBehaviour#1359 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:331 | DebugUI Toggle 20 | RectTransform#814; MonoBehaviour#1362 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:332 | DebugUI Toggle 31 | RectTransform#800; MonoBehaviour#1240 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:333 | Checkmark | RectTransform#855; CanvasRenderer#480; MonoBehaviour#1250 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:334 | DebugUIToggleHistory | RectTransform#593; MonoBehaviour#1210 UnityEngine.Rendering.UI.DebugUIHandlerToggleHistory | 不明：无直接控制绑定 |
| resources.assets:335 | Decrement | RectTransform#778; CanvasRenderer#576; MonoBehaviour#1303 UnityEngine.UI.Button; MonoBehaviour#1333 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:336 | DebugUI Toggle 12 | RectTransform#742; MonoBehaviour#1158 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:337 | Checkmark | RectTransform#822; CanvasRenderer#580; MonoBehaviour#1131 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:338 | Text | RectTransform#732; CanvasRenderer#479; MonoBehaviour#1272 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:339 | Toggle | RectTransform#763; MonoBehaviour#1352 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:340 | Toggle | RectTransform#848; MonoBehaviour#1311 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:341 | DebugUI Toggle 19 | RectTransform#937; MonoBehaviour#1305 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:342 | DebugUI Toggle 14 | RectTransform#828; MonoBehaviour#1177 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:343 | Background | RectTransform#924; CanvasRenderer#498; MonoBehaviour#1233 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:344 | Text | RectTransform#933; CanvasRenderer#456; MonoBehaviour#1347 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:345 | Toggle | RectTransform#912; MonoBehaviour#1312 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:346 | Checkmark | RectTransform#839; CanvasRenderer#454; MonoBehaviour#1271 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:347 | Increment | RectTransform#902; CanvasRenderer#471; MonoBehaviour#1225 UnityEngine.UI.Button; MonoBehaviour#1213 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:348 | Toggle | RectTransform#752; MonoBehaviour#1185 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:349 | Text | RectTransform#746; CanvasRenderer#567; MonoBehaviour#1257 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:350 | Checkmark | RectTransform#594; CanvasRenderer#558; MonoBehaviour#1363 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:351 | DebugUI Toggle 29 | RectTransform#909; MonoBehaviour#1309 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:352 | Text | RectTransform#873; CanvasRenderer#582; MonoBehaviour#1275 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:353 | Checkmark | RectTransform#823; CanvasRenderer#458; MonoBehaviour#1340 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:354 | Text | RectTransform#914; CanvasRenderer#573; MonoBehaviour#1230 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:355 | Toggle | RectTransform#825; MonoBehaviour#1320 UnityEngine.UI.Toggle | 不明：无直接控制绑定 |
| resources.assets:356 | Checkmark | RectTransform#876; CanvasRenderer#496; MonoBehaviour#1277 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:357 | Text | RectTransform#934; CanvasRenderer#470; MonoBehaviour#1187 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:358 | DebugUI Toggle 2 | RectTransform#838; MonoBehaviour#1350 UnityEngine.Rendering.UI.DebugUIHandlerIndirectToggle | 不明：无直接控制绑定 |
| resources.assets:359 | >>> | RectTransform#826; CanvasRenderer#491; MonoBehaviour#1299 UnityEngine.UI.Button; MonoBehaviour#1339 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:360 | Text | RectTransform#867; CanvasRenderer#563; MonoBehaviour#1319 UnityEngine.UI.Text | 不明：无直接控制绑定 |
| resources.assets:361 | Background | RectTransform#917; CanvasRenderer#485; MonoBehaviour#1243 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:362 | Panel | RectTransform#813 | 不明：无直接控制绑定 |
| resources.assets:363 | Background | RectTransform#932; CanvasRenderer#495; MonoBehaviour#1216 UnityEngine.UI.Image | 不明：无直接控制绑定 |
| resources.assets:364 | Text | RectTransform#886; CanvasRenderer#578; MonoBehaviour#1337 UnityEngine.UI.Text | 不明：无直接控制绑定 |

## 限制

表中子树“已利用”表示隶属已确认原始绑定流程，不代表每个子节点可独立控制。静态 typed 数据不能证明运行时 active、动画轨迹、语义或材质效果。全部 470 个资产节点纳入（122 场景、348 资源/预制体），不代表均为运行活对象；未控制 renderer 不自动等于遗漏功能；语义未验证仍保留不明/实验。当前公开控制、实验声明和真实画面必须分别对照。
