# 项目维护约定

- 普通改动及产物仅存放本项目内；不要修改原始 Unity Build 文件或绕过门窗构建校验。
- 用户要求提交时仅提交；用户要求推送/发布时必须统一同步 Gitee main、GitHub main、GitHub gh-pages，不仅推某一个远端。
- 发布命令：`npm run publish`（Node.js 18+ 原生、无依赖，默认统一发布）。先提交并确保工作区干净。脚本不自动提交，不强推；指定版本用 `npm run publish -- --revision <源码SHA>`，仅导出用 `npm run publish -- --preview <项目内新目录>`。
- origin：https://gitee.com/larria/zhiyin-3d-model.git；github：https://github.com/larria/Voyah-Courage-3D-Unity.git。
- Pages 采用 gh-pages 分支根目录发布，不添加 GitHub Actions 工作流；保留 manifest 中的展示首页与全部资源，不覆盖 index 跳转 API 页；派生站点保留原 manifest，另加入 .nojekyll 和 source-revision.json。
- 如某个目标失败，明确报告已成功和未完成项，以同一源码提交重试；不得将分支推送成功冒充 Pages 线上验收成功。
- 运行文件变化后显式更新 offline-manifest.json 的尺寸与 SHA-256；发布检查不能绕过。
