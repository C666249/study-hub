# study-hub — 通用刷题学习系统

单 HTML 文件 + localStorage，移动端优先。支持多科目（tabs 切换），每科独立题库 JSON。

## 技术栈

- 纯 HTML/CSS/JS，零框架
- Tailwind CSS CDN
- localStorage 持久化（进度、错题、收藏）
- GitHub Pages 部署

## 项目结构

```
study-hub/
├── index.html          ← 主应用（待构建）
├── src/
│   └── core.js         ← 纯逻辑函数（isAnswerCorrect, searchQuestions, shuffleArray 等）
├── tests/
│   └── core.test.js    ← 核心逻辑测试
├── data/
│   └── 刑法.json        ← 题库（每科一个 JSON）
└── .github/workflows/
    └── pages.yml       ← 自动部署
```

## 核心函数签名

| 函数 | 用途 |
|---|---|
| `isAnswerCorrect(uAnswer, cAnswer, type)` | 判断答案对错 |
| `searchQuestions(query, questions)` | 全文搜索（题干+选项+解析+标签） |
| `getQuestionsByTag(tag, questions)` | 按知识点筛选 |
| `getKnowledgePointStats(questions)` | 知识点题目数统计 |
| `shuffleArray(arr)` | 不改变原数组的洗牌 |

## 开发规范

- TDD：写测试 → 看失败 → 写实现 → 看通过
- 每 Phase 停等用户确认
- 移动端优先，竖排布局
- **每步 commit**：改完一个功能 → JS 验证 + 测试 → `git commit`（随时可回退）

## 题库转换

见 [docs/Trae-题库转换指南.md](docs/Trae-题库转换指南.md) — Trae AI 操作说明，docx → JSON 全流程。

## 配色

深色极光主题已录入 [图谱.md](../../../Users/h'x'h/.claude/skills/web-ui-designer/图谱.md) 第八节。
