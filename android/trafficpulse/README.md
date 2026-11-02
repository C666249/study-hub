# 流速 Pulse v0.1.0 — 安卓实时流量监控

独立原生 Android APK（Java + Android View），直接读取 Android `TrafficStats` 系统累计计数器，计算每秒速度，**无需 INTERNET 权限，无数据上传，没有服务器**。

## 主要能力
- 每约 1 秒更新下载/上传速率，速率单位自动适配 B/s、KB/s、MB/s。
- 最近 60 个采样点曲线；当前默认网络 Wi-Fi、蜂窝、VPN、以太网识别。
- 本次监控启动以来的下载/上传累计量，不是按天、按月运营商账单。
- 用户显式启动前台 Service，持续显示通知栏速率；从通知一键停止。
- 可选悬浮窗：系统“显示在其他应用上层”授权后开启；长按拖动位置，轻点返回应用。
- 不申请 Root、VPN 接管、Usage Access、Accessibility，也不申请互联网权限。

## Android 限制
- TrafficStats 统计网络层、所有网络接口（VPN 环境可能出现计数偏差），不能据此做精确网络账单或分 app 统计。
- 采用 `specialUse` 前台服务，合法性需要具体发布渠道审核；Play 商店发布须履行 FGS 类型申报流程。
- 用户可以手动停止；系统、ROM 省电策略可能终止后台服务，特别是在部分 MagicOS 设备上。
- 本构建是临时 CI Debug 签名测试版；不要用于覆盖原有 Stable。
- 测试设备目标为 Android 8+；仍需在荣耀 Android 17 设备上真机验证前台服务、通知和悬浮权限。

## 构建
在 Android Studio 打开项目的 `android` 目录（JDK 17，SDK 35），运行：

```bash
bash android/gradlew -p android :trafficpulse:assembleDebug
```

预览 APK 在 `android/trafficpulse/build/outputs/apk/debug/`。

## 发布
独立分支 `feature/traffic-pulse-v01` 触发 `.github/workflows/traffic-pulse-android.yml`。构建检查源码、APK 包名、签名和网络权限，发布公开 GitHub Release。此分支不改动 study-hub master，也不影响现有其他 App。

## 后续计划
正式版采用持久化独立签名证书，加入更可靠的应用前后台状态恢复与适配荣耀设备的实测。
