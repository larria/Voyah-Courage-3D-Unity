# 全新岚图知音 · 官网原版外观 3D

## 启动

```bash
python tools/serve.py
```

访问 http://127.0.0.1:18743/index.html 。需要 HTTP 服务，不能双击 HTML 使用 file://。

## 实现范围

- 原始 Unity WebGL 模型、Shader、贴图、光照、动画与射线热点完整保留，没有用 Three.js 重建。
- 提供外观展示、四种官网车漆和全屏；不提供内饰 tab 或内饰控制。
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
