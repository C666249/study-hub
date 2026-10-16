# Aurea · Native Android (v1.7.0 optical baseline)

原生 Android Java 实现。与旧版 `/rewarder/` 网页没有依赖，也不读取网页的 IndexedDB。

## UI 和数据
- **v1.7.2**：设置页「新建」改为右下角底部 Tab 上方的独立浮动透明 Liquid Glass 球，采用现有 QWEA0 HERO Clear 镜片；点击 ＋ 旋转后打开原生新建任务底部弹窗，关闭旋转复位。仅设置页显示。
- 任务弹窗「每天 / 每周」改为与底部 Tab 同一类 FMV 橡胶果冻动画：移动拉伸、阻尼惯性、轻震动、收缩回弹；保留原金额校验和日/周任务周期数据结构。

- **v1.7.1（原 v1.7.0 视觉基线）**：保留 v1.7.0 的 QWEA0 原生玻璃、背景、主页面、Tab 动画；应用名称改为 Aurea，包名和旧 SharedPreferences 键不变；奖励账本沿用 FMV 左滑橡胶阻尼 / 右上飞出删除，删除后重新统计金额、记录次数及当前任务已领取状态。未移植 React Bits/WebView。

- v1.7：React Bits GlassSurface 的域扭曲光学思路（AGSL 原生改写）；QWEA0 玻璃色散通路真正启用、顶部金额独立清透镜片、背景加入可折射的细腻光影褶皱；记录见 [OPTICS.md](OPTICS.md)。
- v1.6：Clear 小胶囊／Frosted 大面板材质分层；底部选中 Tab 跟随橡胶动效移动的真实透明玻璃镜片。背景改为更大局部着色器取样、去掉重复颗粒，96 秒色彩往返循环。
- v1.5：采用 MIT 开源 QWEA0/Liquid-Glass-Android Android View 版本的真实 SDF 折射与 Clear 材质（API33+）；环境光从青绿暖金出发，经96秒渐进变为蓝紫暖红再返回青绿；去掉先前的粗颗粒与装饰弧线。
- 真正的背景模糊：使用 BlurView 3.2.0 / BlurTarget，采样持续运动的蓝紫玫红光色场，玻璃高光与折射边缘不遮挡内容。采用 JitPack 依赖（Apache-2.0）。
- 背景：蓝、紫、玫红、青 8 层原生 GPU 渐变光团各自漂移与形变，磨砂玻璃覆盖层，约 30 fps；后台停止刷新。
- 任务管理：左滑短距离编辑、深滑删除，复用 FMV 的阻尼分段与斜向飞出、列表补位动画。
- 奖励页：当前任务、累计金额、金币曲线飞入、落点双圈柔光水纹、按压回弹、滚动数字；右上总额胶囊打开奖励流水。
- 设置页：创建、修改、删除每日/每周奖励任务；删除任务保留历史流水。
- 每日以设备当地日期为周期；每周采用 ISO 周（周一至周日）。
- 数据存储：应用内部 SharedPreferences 的原子 JSON snapshot，无网络权限、无联网 API。
- 数据在相同签名的覆盖安装期间保留，但**清除数据或卸载无法保证恢复**。当前版本没有导入导出功能。

## CI
`https://github.com/C666249/study-hub/actions/workflows/rewarder-android.yml`

下载入口：

- 预览版：`https://github.com/C666249/study-hub/releases/tag/rewarder-v1.7.2-preview`
- 长期签名版（需配置以下 secrets 才会发布）：`https://github.com/C666249/study-hub/releases/tag/rewarder-v1.7.2-stable`

### 长期签名：只需配置一次

**务必保管好自己的签名文件和密码。** GitHub 的公有仓库绝不可提交 keystore、明文密码或密钥。下面的设置需要有 Java keytool 的电脑，或受信任的本地 Android Studio。

1. 创建自己的 keystore：
   ```shell
   keytool -genkeypair -keystore rewarder-release.jks -alias rewarder -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12
   ```
   按提示设置密钥库密码和密钥密码。建议使用不同的强密码。将 keystore 另存为多个离线备份。
2. 把签名文件 Base64 编码。例如 Windows PowerShell：
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\rewarder-release.jks")) | Set-Clipboard
   ```
   复制后将剪贴板直接贴入 GitHub secret，勿放进源代码。
3. 打开 `https://github.com/C666249/study-hub/settings/secrets/actions`，点击 **New repository secret**，新建以下四项：
   - `REWARDER_KEYSTORE_BASE64`：第 2 步复制的完整 Base64 内容。
   - `REWARDER_STORE_PASSWORD`：密钥库密码。
   - `REWARDER_KEY_ALIAS`：`rewarder`。
   - `REWARDER_KEY_PASSWORD`：密钥密码；如果 keytool 使用的是与库密码相同的密码，则填同一密码。
4. 打开上面的 Actions 链接，点 **Run workflow**，选择 `master`。成功后将出现正式签名版 Release。

**注意**：预览版的临时 debug 签名与正式版签名不相同，正式版无法在已安装预览版的设备上直接覆盖。希望长期积累数据时，建议在正式版安装后再开始真实记录。以后续版本只使用这套签名，才能实现不断更换 APK 而保留数据。

## 验证边界
CI 已可完成 Gradle 编译。Android 运行时、不同屏幕大小、动画帧率、触觉反馈和备份恢复需要用户真机实测；不要将 CI 成功等同于设备级全面通过。
