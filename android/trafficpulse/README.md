# PulseFlow v0.3.1 · Android 实时速度与套餐估算

Android View 原生独立应用。没有网络通信权限、没有后台上传数据，不用 VPN/root，不读取短信。

## 已实现
- 全英文 PulseFlow 品牌。首页顺序：紧凑 VPN/网络 + 上下行速率 → 130GB 套餐余量卡（可更改总量和每月账期）→ Used/Plan 两块紧凑统计 → 60秒速度曲线 → 操作按钮。
- 悬浮窗采用独立的 `LiquidPillOverlay`：默认 96dp × 36dp 的白色半透明微型胶囊，只显示如 `48.08G` 的数字和 G，绝不带“剩余”字样；轻点展开到最多350dp，同一行显示「剩余/已用/↓/↑」；长按约490ms 逆向收起；手指拖动并保存位置。420ms 以**同一窗口同一对象**宽度连续变化，输入可中断。
- 动态速率来自 Android TrafficStats；套餐余量来自 NetworkStatsManager 使用情况权限。后台计算套餐余量，不阻塞动画。历史用量不代表运营商官方计费额。
- “白色液态玻璃”使用原生渐变、高光描边与半透明材质；**并不读取或折射其他 App 底图**，不索取屏幕录制权限。这是性能/权限兼容优先的 FMV 语义实现，非已认证的 FMV 原版光学 Backdrop。
- 包名 `io.github.c666249.pulseflow`，与旧版 `io.github.c666249.trafficpulse` 并行安装，用户需要重新开启使用情况与悬浮窗权限。

## 使用
点 Start 开启前台通知测速，点 Glass Pill 开启悬浮条；若缺少权限请按系统提示设置。悬浮条首次默认位于屏幕顶部靠中位置，可自由拖动；点击横向伸展，长按逆向收起。

## 本地构建
```bash
bash android/gradlew -p android :trafficpulse:assembleDebug
```
JDK17 / SDK35。CI 自动编译、检验签名/包名/无 INTERNET 权限，发布公开预览包。
代码仅在 `feature/pulseflow-v031` 分支，未修改 study-hub master。

## 局限
系统访问授权可能因 MagicOS、VPN、多 SIM、运营商免流而统计偏差；后台服务可能被省电策略停止。公开 CI APK 用临时 Debug 签名，不能保证后续覆盖升级。尚未真机验证液态胶囊拖拽、手势与震感；不要标记 verified。
