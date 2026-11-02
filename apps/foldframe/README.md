# FoldFrame · 折叠相册（Android Beta）

> 一款**本地离线**运行的摄影杂志式相册。不是云相册，不需登录，不会上传用户照片。

**包名**：`dev.foldframe.atelier`，与已有 Stable/Beta App 完全隔离。Android 10+。

## 第一版已实现

- Photo Picker 批量导入照片（不用向 App 授予整个相册权限）
- 创建/重命名/删除摄影集，照片关联本地持久化
- 双列艺术照片墙、杂志封面、纸张细节、翻页浏览、图片全屏查看
- 长按抬起照片后拖动，松手依据位移换位，触觉反馈，稳定 Photo ID
- 支持按原顺序导出 1800×2500 JPEG 拼贴到系统相册 `Pictures/FoldFrame`
- 真实 UI 状态及可中断弹簧、封面 3D 倾斜、页张透视和模糊玻璃浮动工具栏
- 无广告，无登录、无网络权限、无远端 API

## 构建

使用 Android Studio 打开本目录，JDK 17，Android SDK 35，运行 `gradle :app:assembleDebug`。
当前交付为 Beta 源码；如本地缺少 Gradle，可用 GitHub Actions 配置编译。**此运行环境没有 Android SDK / Gradle 网络依赖，尚无法声明 APK 已构建成功或已真机验证。**

## 交互说明

1. 首页点击黑色「CREATE AN EDITION」建立摄影集。
2. 进入摄影集点击「添加照片」选择多张；之后无需重新导入即可查看。
3. 右上角切换网格/翻页。网格长按拖动照片，松手移动到目标槽位。
4. 点击图片进入全屏，左右滑动查看；删除按钮只从摄影集移除，不删除系统原照片。
5. 底部「导出拼贴」将前 6 张生成 2×3 海报。更多版式、精准拖拽网格、实时 3D 开页是后续版本。

## 组件来源及集成状态

- **Haze 1.6.10**：应用依赖已接入，摄影集底部操作栏使用 `hazeSource` 与 `hazeEffect`。这个稳定版本与 Kotlin 2.1 工具链兼容，仍待 CI 和真机验收。
- **AndroidLiquidGlass / Backdrop**：FMV Skill 收录行为与 API 用例，并单独列出 2.0.1 依赖；因为最新 Backdrop 使用较新 Kotlin 编译器，而这里选择更保守的 Kotlin 2.1.20 以保护首次构建，暂不在 APK 内强行混用不兼容的字节码。实际工具栏有 Haze 的模糊玻璃效果，但并不等价于 Backdrop 折射效果。
- **skydoves/compose-animations**：示例集，不是可直接引入的 UI 依赖；按它的 3D Flip / Spring 思路实现了独立的 Compose 版，附上游引用。

第三方源码**不打包复制**到工程；通过依赖或可复用的原创实现使用，详见 `third_party/SOURCES.md`。

## 需要真机验证

- 荣耀 MagicOS 的系统照片选择器是否持久保留 URI 授权。
- 多张高像素 RAW/HEIC/特殊图片下的 Coil 解码与导出策略。
- Haze 本地模糊的系统兼容性，异常时可将工具栏替换为不透明纸张背景。
- 目前拖拽在松手时换位，尚未完成连续邻项物理让位，不应当作 FMV Verified。
