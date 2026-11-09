# PPT Design · 可编辑演示文稿设计工坊

以**用户确认的效果图为视觉交付基线**，通过内容原生可编辑、独立高质量装饰分层和逐页对照验收，制作既有视觉完成度又可修改的 PPTX。

> 当前工坊版本 **1.1.0**（2026-11-09）；从资料库的 `PPT-Design-Workshop-v1.0.0.md` 增量升级，不删除旧规范。现阶段是**设计规范、参考图和矢量语义组件**，**不是**两页已完成 1:1 可编辑 PPTX 模板。

## 入口

- [`workshop/PPT-Design-Workshop-v1.1.0.md`](workshop/PPT-Design-Workshop-v1.1.0.md) — 核心完整规范（原有设计原则、可编辑、动画保护、验收 + 新增视觉复刻硬约束）
- [`styles/ACADEMIC-POLICE-PARCHMENT-001.md`](styles/ACADEMIC-POLICE-PARCHMENT-001.md) — 暖纸质公安学术汇报风格、两页拆解、微组件清单与可编辑技术边界
- [`styles/catalog.json`](styles/catalog.json) — 风格目录，持续增量扩展
- [`assets/references/`](assets/references/) — 参考效果图 JPG（REF-01/REF-02）
- [`assets/icons/`](assets/icons/) — 同题材的原创 SVG 语义图标草图（**不是**从效果图像素级提取，尚需按原图精修）
- [`VALIDATION.md`](VALIDATION.md) — 可编辑 PPTX 的逐项复刻验收模板

## 本轮新增的不可妥协原则

1. 设计图一经选定，制作 PPTX 时**不允许简化、丢失或替换**任何被用户认可的重要组件，尤其是警帽、天平、场记板、书本、盾牌等图标，以及参考图中的照片渐隐、纸纹、胶囊丝带、剪影与渐变。
2. **所有文案必须原生可编辑**；复杂视觉装饰可用**独立** PNG/SVG/位图，不强求每条装饰笔触都是 PPT 形状，但不得将整页截图冒充可编辑 PPT。
3. **必须从最终 PPTX 真正渲染逐页截图**，与效果图对照，留存差异和验收状态。不因肉眼“看起来差不多”就声称完全复刻。

## 如何扩展风格库

在 `styles/` 添加新的独立 `.md` 风格包，将素材放入 `assets/references/` 和 `assets/icons/`，并向 `styles/catalog.json` 追加唯一 ID。原有风格始终保留，不自动成为所有项目的默认皮肤。