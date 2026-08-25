# Study Hub Android 构建说明

## 固定身份

- `applicationId`: `io.github.c666249.studyhub`
- `namespace`: `io.github.c666249.studyhub`
- 启动 Activity: `io.github.c666249.studyhub.MainActivity`
- 当前版本: `1.0.0` (`versionCode 1`)

这个 application ID 是 Study Hub 的永久身份。后续版本不得改回
`com.studyhub.app`，也不得复用其他模板项目的 application ID，否则 Android
会把两个应用视为同一个应用并共用/覆盖数据。

## 工作方式

Android App 是一个原生 Kotlin WebView 壳，加载：

```text
https://c666249.github.io/study-hub/
```

因此 GitHub Pages 部署完成后，题库、科目和页面更新会在 App 下次加载页面时
生效。网页的 `localStorage` 保存在这个 application ID 自己的 Android 数据目录中。

外部站点链接交给系统浏览器；Study Hub 自身链接留在 App 内。主页面无法连接时
显示内置的 `offline.html`，但当前版本不提供完整离线题库。

## 本机构建

本机环境：

- Android SDK: `C:\Users\h'x'h\AppData\Local\Android\Sdk`
- JDK 21: `C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`
- Gradle 用户目录: `D:\gradle-home`

PowerShell：

```powershell
$env:GRADLE_USER_HOME='D:\gradle-home'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
& 'D:\gradle-home\wrapper\dists\gradle-8.11.1-bin\bpt9gzteqjrbo1mjrsomdt32c\gradle-8.11.1\bin\gradle.bat' :app:assembleDebug --offline --no-daemon
```

输出：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 发布前必须完成

- 在真机上验证启动、返回键、做题进度和网络失败页面。
- 创建并妥善保存唯一的 release 签名密钥。
- 固定使用同一签名，并逐次增加 `versionCode`。
- 构建 release APK；debug APK 只用于当前验收。
