# 拾光奖励 · Native Android

原生 Android Java 实现。与旧版 `/rewarder/` 网页没有依赖，也不读取网页的 IndexedDB。

## UI 和数据
- 背景：无可见波浪线的动态液态光场，透过固定的雾化磨砂层缓缓流动；离开页面时停止渲染。
- 任务管理：左滑短距离编辑、深滑删除，复用 FMV 的阻尼分段与斜向飞出、列表补位动画。
- 奖励页：当前任务、累计金额、金币曲线飞入、落点双圈柔光水纹、按压回弹、滚动数字；右上总额胶囊打开奖励流水。
- 设置页：创建、修改、删除每日/每周奖励任务；删除任务保留历史流水。
- 每日以设备当地日期为周期；每周采用 ISO 周（周一至周日）。
- 数据存储：应用内部 SharedPreferences 的原子 JSON snapshot，无网络权限、无联网 API。
- 数据在相同签名的覆盖安装期间保留，但**清除数据或卸载无法保证恢复**。当前版本没有导入导出功能。

## CI
`https://github.com/C666249/study-hub/actions/workflows/rewarder-android.yml`

下载入口：

- 预览版：`https://github.com/C666249/study-hub/releases/tag/rewarder-v1.2.0-preview`
- 长期签名版（需配置以下 secrets 才会发布）：`https://github.com/C666249/study-hub/releases/tag/rewarder-v1.2.0-stable`

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
