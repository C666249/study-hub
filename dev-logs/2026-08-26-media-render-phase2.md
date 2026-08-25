# 2026-08-26 图片渲染与沉浸式全屏 Phase 2

## 改动

- Android App 升级到 `1.0.1` / `versionCode 2`。
- Android 11 及以上使用 `WindowInsetsController` 隐藏系统栏，并允许边缘滑动临时显示。
- Android 8–10 使用 `IMMERSIVE_STICKY` 兼容实现。
- 网页增加 `questionContent`、`optionContent`、`explanationContent`、`detailContent`。
- 旧 JSON 字符串字段继续兼容，无需迁移既有题库。
- 图片只允许引用仓库内 `data/media/`，拒绝外部 URL、危险协议和越级路径。
- 增加响应式图片、题干/解析图片点击放大、选项图片独立放大按钮和加载失败提示。
- 搜索同时覆盖内容块文字、图片 alt、caption 和选项内容。
- 旧题题干改为转义后渲染，消除题库文本直接作为 HTML 插入的问题。
- 增加 Schema 文档和媒体目录说明。

## 验证

- 完整 Node 回归：17 项通过，0 失败。
- 内联脚本语法检查通过。
- 本地浏览器 390×844 移动视口：
  - 旧题正常显示，4 个选项可见，无横向溢出。
  - 临时真实图片题的题干图、两张选项图均加载成功。
  - 题干图放大层正常打开、关闭。
  - 选项图放大按钮存在。
  - 答题后解析图片正常加载。
  - 浏览器控制台 0 error。
- 临时图片题和测试 SVG 已在验证后删除，未加入正式题库。
- Android `:app:assembleDebug` 构建成功。
- `aapt dump badging`：
  - package `io.github.c666249.studyhub`
  - versionCode `2`
  - versionName `1.0.1`
  - launcher `io.github.c666249.studyhub.MainActivity`

## 验收 APK

- `dist/StudyHub-Android-v1.0.1-debug.apk`
- SHA-256: `2A0D0BC65CBB5E29D1FB399F1B2E3C9C409321A14E3E3B32DAEF0CB1FEE7EC40`

## 后续

- 使用真实行测材料生成第一套带图片 JSON 时，按 `docs/media-schema.md` 组织图片。
- 导入脚本仍按用户优先级推迟到后续阶段。
