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
├── index.html              ← 主应用
├── tools/
│   ├── convert.py          ← docx→JSON 转换器主入口
│   └── plugins/            ← 格式插件（review/xuexitong/numbered）
├── tests/
│   └── core.test.js        ← 核心逻辑测试
├── data/
│   └── 马原.json            ← 题库（每科一个 JSON）
├── docs/
│   ├── docx-format-guide.md ← LLM 生成 docx 规范
│   └── add-subject.md      ← 加新科目流程
└── .github/workflows/
    └── pages.yml           ← 自动部署
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

`tools/convert.py` — python-docx 插件式转换器，支持 5 种格式自动检测。
- 双击 `D:\桌面的\题库转换.lnk` 启动
- 📖 **操作手册（加科目/改题库/标签系统/插件体系）**：见 [docs/operations-guide.md](docs/operations-guide.md)
- 格式规范见 [docs/docx-format-guide.md](docs/docx-format-guide.md)
- 加新科目流程见 [docs/add-subject.md](docs/add-subject.md)

## 配色

深色极光主题已录入 [图谱.md](../../../Users/h'x'h/.claude/skills/web-ui-designer/图谱.md) 第八节。
