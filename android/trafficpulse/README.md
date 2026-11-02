# 流速 Pulse v0.2.0 — 安卓实时流量监控

独立原生 Android APK（Java + Android View），直接读取 Android `TrafficStats` 系统累计计数器，计算每秒速度，**无需 INTERNET 权限，无数据上传，没有服务器**。

## 主要能力
- 每约 1 秒更新下载/上传速率，速率单位自动适配 B/s、KB/s、MB/s。
- 最近 60 个采样点曲线；当前默认网络 Wi-Fi、蜂窝、VPN、以太网识别。
- 本次监控启动以来的下载/上传累计量，不是按天、按月运营商账单。
- **月度套餐余额估算：** 用户自定流量总额（默认130GB）和每月账期日，读取系统历史手机移动网络累计量后计算剩余值；不要求实时监控服务在后台持续存活。
- 用户显式启动前台 Service，持续显示通知栏速率；从通知一键停止。
- 可选悬浮窗：系统“显示在其他应用上层”授权后开启；长按拖动位置，轻点返回应用。
- 不申请 Root、VPN 接管、Accessibility，也不申请互联网权限。月度统计需要用户主动开启系统“使用情况访问权限”（Usage Access / PACKAGE_USAGE_STATS），实时测速和余量估算相互独立。

## Android 限制
- TrafficStats 统计网络层、所有网络接口（VPN 环境可能出现计数偏差），不能据此做精确网络账单或分 app 统计。
- NetworkStatsManager 根据用户设定账期读取 Android 历史蜂窝网络消耗，默认统计所有 SIM 的合计量；不能准确区分广西移动 SIM 套餐计费、运营商免流、结转套餐和共享套餐。历史数据可用性以设备系统为准，读取失败时不会显示虚构的余额。
- **不需要整月后台常驻**来维护套餐计数；系统会持续记录网络使用数据，重新打开 App 查询即可。后台服务只用于实时速度通知和悬浮窗。
- 以前 v0.1.0 采用临时 CI Debug 证书，安装 v0.2.0 如果出现签名冲突需要先卸载旧版（版本0.1没有需要保留的套餐配置）。
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
独立分支 `feature/traffic-pulse-v02` 触发 `.github/workflows/traffic-pulse-android.yml`。构建检查源码、APK 包名、签名和网络权限，发布公开 GitHub Release。此分支不改动 study-hub master，也不影响现有其他 App。

## 后续计划
正式版采用持久化独立签名证书，加入更可靠的应用前后台状态恢复与适配荣耀设备的实测。
