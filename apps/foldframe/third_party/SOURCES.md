# 开源参考、许可、验证状态

这些项目的**架构、API、实现行为**作为 FoldFrame 及 FMV 的参考。未将第三方项目整仓复制进项目源码。若后续需要拷贝原代码，务必保留版权与许可证文本。

1. **Kyant0/AndroidLiquidGlass** — https://github.com/Kyant0/AndroidLiquidGlass — Apache-2.0 — Maven `io.github.kyant0:backdrop:2.0.1`。FMV-ID：`FMV-GLASS-REFRACTION-001`。目前在 FMV 文档侧收录，未进入 app 实际渲染链，原因是 2.0.1 Kotlin 元数据较新，需跟 app 的 Kotlin/Gradle 版本配套升级验证。
2. **chrisbanes/haze** — https://github.com/chrisbanes/haze — Apache-2.0 — Maven `dev.chrisbanes.haze:haze`, `haze-effect`, `haze-materials`，目前锁定 `2.0.0-alpha04`。FMV-ID：`FMV-GLASS-HAZE-001`。在摄影集底部浮动操作栏接入 Haze Source + Blur。
3. **skydoves/compose-animations** — https://github.com/skydoves/compose-animations — 查看上游具体文件的许可再移植。FMV-ID：`FMV-SPATIAL-PAGE-001`。按示例行为重写 3D 纸页/封面弹簧动画，不复制其完整源文件。

验收等级：`candidate/extracted-beta`，**不是** `verified`。本地静态检查不代表 APK 编译或 Android 真机实测通过。
