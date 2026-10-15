# 拾光奖励 · Rewarder V1.0

静态、离线优先的个人奖励器：每日 / 每周目标，自定义奖励金额，金币连续飞入金库、累计数码滚轮、历史账本、撤销奖励、导出与导入 JSON 备份。

## 运行

打开 `index.html` 或用任意静态服务器部署本目录。GitHub Pages 中可直接放在仓库的 `rewarder/` 子路径，无需构建、API Key 或后端。

## 数据

数据保存在当前浏览器的 IndexedDB（不可用时退回 localStorage）。每个目标在当前自然日或自然周最多领取一次；每周从当地周一开始。金额统一为整数分（`amountCents`），避免小数精度问题。删除任务不删历史流水；撤销流水可以重开当期领取。手机、浏览器与未来 Android App 的数据容器并不自动互通；需要通过设置里的 JSON 导出/导入迁移。

## Android 路线

核心逻辑 `store.js` 与 DOM 动效 `motion.js` 分离；下轮可通过 Capacitor + Android WebView 直接打包本静态文件，保留 UI、飞行动画和奖励数据模型，不必重新设计界面。Android 正式版应固定包名和签名，配置本地文件备份、生命周期、状态栏/安全区，再以真机验收为准。

## FMV / Personal App Stack 映射

- `PAGE-DASHBOARD-001`: 一主动作、统计次之、任务列表。
- `FMV-NUM-COUNTER-001`: 数字位身份的里程表滚动。
- `FMV-NAV-LEDGER-TAB-001`: 同一导航 Thumb 滑动、伸缩回弹。
- `FMV-CARD-LEDGER-FLIGHT-001`: 保留对弧线飞行代理对象及抵达反馈的动效语义；本项目为奖励入账而非删除，不复用危险删除行为。
- Semantic motion/Reduced Motion: 动效不得决定业务落库，持久化成功后才播，系统减少动画时跳过飞行。

## 安全说明

无网络请求，无账号；service worker 只缓存站点同源静态资源。网站数据有因用户清理存储而丢失的风险，建议定期导出 JSON。奖励数字属于自我激励记录，不代表真实金融存款或支付。
