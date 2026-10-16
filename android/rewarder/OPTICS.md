# Aurea · GlassSurface 光学实现记录（v1.8）

## v1.8 · 实际运行架构

- React Bits 原生 WebGL2 光学移植位于 `src/main/assets/rewarder-glass.js`，使用 GlassSurface 的位移场 / RGB 分通道采样方法；不是网页导航、不是插图，不依赖 CDN。
- `ReactBitsGlass.java` 只将 Android View 的圆角、大小、屏幕位置及裁剪信息传给单个离线 WebView；不发送奖励金额、任务名称或个人数据。
- WebView 同时绘制底下的流动光场和各卡片的折射玻璃；原生 TextView、任务业务、FMV 阻力 / 飞出手势保留在前层。透明原生容器不再涂半透明灰白底。
- `RewardStore.undo(Receipt)` 持久化删除特定账本记录，失败恢复；同步重算余额、记录次数及当期可领取状态。未删除任务。
- 用 npm/React 框架本体会增加 APK 复杂度，因此仅把 React Bits 核心着色器与距离场实现为离线 WebGL2 脚本，原版权与 MIT + Commons Clause 条件见 `src/main/assets/REACT_BITS_LICENSE.txt`。
- 原生 QWEA0 在 v1.7 曾使用；v1.8 不再使用其玻璃渲染依赖，以下内容为历史迁移记录。

## 目标

起始为青绿与暖金，慢速向蓝紫渐变再返回；薄而清透的顶部金额镜片、
小按钮的低色散折射，大面积信息面板采用可读的轻磨砂材质。
不叠加可见噪声、栅格纹或实体白色描边。

## 开源来源与迁移边界

- [React Bits — GlassSurface](https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/GlassSurface):
  WebGL 的位移贴图 `bendShape()`、逐通道背板采样 `bend()`，以及
  区分光学背景与 UI 前景的设计行为。未粘贴网页 DOM/SVG 代码进入 Android。
- [QWEA0 — Liquid-Glass-Android](https://github.com/QWEA0/Liquid-Glass-Android):
  MIT 许可，原生 Android View SDF 折射透镜、AGSL 单通道多色光学采样、真实背景捕获；
  当前工程通过 JitPack v2.0.11 使用其完整渲染层。
- FMV: 保留原来的橡胶 Tab 动画、手势编辑/删除、奖励飞入等状态语义。

## v1.7 发现与修正

1. v1.6 设了 `setDispersionStrength`，但同时关闭了
   `enableChromaticAberration` 与 `enableChromaticDispersion`。
   QWEA0 源码的 `disp` 参数只有任一开关开启才非零。
2. 小按钮过去开启的 `adaptiveLensScale` 会限制短边玻璃的最大折射位移。
   现在小型 Clear 镜片由明确的物理宽度标定；大卡片继续自适应。
3. 顶部金额使用独立的 HERO 型 Clear 透镜；其他小按钮使用温和 Clear，
   大卡片使用 Frosted，导航底座使用低反射材料。
4. `GlassBackdrop` 在 API 33+ 用 Android RuntimeShader 绘制
   很柔和的域扭曲光影褶皱，再由 QWEA0 AGSL 在玻璃上重采样。
   这让单调渐变有了可被放大/弯曲的细节，不必添加线条图案。
5. 采用 Android AGSL 而非 WebGL 的 25x3 采样模糊循环，避免逐控件
   Canvas->WebGL 纹理上传及重叠的全屏高价离屏模糊。

## 验证范围

Actions 的 assembleDebug 仅证明 Gradle 编译成功。真机还要检查：
- 40dp 顶部金额透镜边缘是否自然，RGB 色散是否过强；
- 动态流光在玻璃内是否能感知，不卡顿、不起格纹；
- 底部 Tab 的位置和弹性轨迹；
- 设置卡片滑动、删除飞出及奖励记录不变；
- 动效关闭时正常静态降级，后台不做无意义渲染。

预览包使用 Actions Debug 签名，不保证与旧机中安装的 APK 可覆盖安装。
