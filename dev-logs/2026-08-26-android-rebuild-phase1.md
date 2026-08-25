# 2026-08-26 Android 重建 Phase 1

## 回滚点

- 当前线上网页稳定提交：`9409813bc9e9cfe1cf89980b67aab52a1e1e4749`
- Git 标签：`web-stable-2026-08-26`
- 标签已推送到 `origin`。

## 改动

- 删除旧的、未被 Git 跟踪的 `android/` 工程及旧 debug APK。
- 从零创建 Kotlin WebView Android 工程。
- 永久 application ID 改为 `io.github.c666249.studyhub`。
- App 直接加载 GitHub Pages，从而接收网页、题库和新科目部署更新。
- 禁止明文 HTTP，禁用 Android 自动备份，避免旧模板数据恢复到新 App。
- Study Hub 内部链接留在 WebView，外部链接交给系统浏览器。
- 增加网络错误回退页、WebView 返回历史、配置变化状态保存和正式图标。
- 增加 Android 契约测试与构建文档。

## 验证

- `node --test tests\\core.test.js tests\\convert.test.js tests\\ai-config.test.js tests\\android-contract.test.js`
  - 全部通过。
- Gradle `:app:assembleDebug --offline --no-daemon`
  - `BUILD SUCCESSFUL`。
- 使用 Android SDK `aapt dump badging` 直接核验 APK：
  - package: `io.github.c666249.studyhub`
  - versionCode: `1`
  - versionName: `1.0.0`
  - launcher: `io.github.c666249.studyhub.MainActivity`
- 验收 APK：`dist/StudyHub-Android-v1.0.0-debug.apk`
- SHA-256：`9B9F76B92D5F6AD52546205FE873BC0A49DB471D10653A59D0B0DE82A828C2D4`

## 尚未完成

- 尚未真机安装验证。
- 尚未创建 release 签名；当前 APK 为 debug 验收包。
- 网页图片题库渲染属于下一阶段。
