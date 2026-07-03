# 添加新科目 / 新题库 — 全流程

分两步：**准备题库 JSON** → **注册科目上线**。三步走完即可用。

---

## 第一步：准备 docx 题库

按 [docx-format-guide.md](docx-format-guide.md) 的规范，让 LLM 生成 docx，或用现有 docx 文件。

文件命名规则：
- 章节类：`第X章_章节名.docx`（如 `第一章_世界的物质性及其发展规律.docx`）
- 作业类：`第X次作业.docx`、`平时作业（X）.docx`
- 练习类：`XXX练习X.docx`

---

## 第二步：docx → JSON

将 docx 放到一个文件夹，双击 `D:\桌面的\题库转换.lnk`（或终端运行）：

```bash
node D:\桌面的\convert.js
```

粘贴文件夹路径，回车。每个 docx 会在同目录生成同名 `.json`。

质量验证（在生成的 JSON 目录下终端执行）：

```bash
node -e "const d=require('./第一章_xxx.json'); console.log('题数:', d.length); d.slice(0,2).forEach(q => { console.log('题干:', q.question.substring(0,60)); console.log('选项:', JSON.stringify(q.options)); console.log('答案:', q.answer); console.log('---'); });"
```

检查要点：
- 选项文本里**没有**"正确""错误"字样（答案不能泄露）
- `answer` 字段干净（无"2分""0分"残留）
- 题干不包含"简略解析"文字

---

## 第三步：合并 + 注册

### 3a. 合并 JSON

如果新科目有多个 JSON 文件（多章），用 Node 合并成一个：

```bash
node -e "
const fs=require('fs'),path=require('path');
const dir='./';  // 改成你的 JSON 所在目录
const out='../study-hub/data/新科目名.json';
let all=[];
fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
    all.push(...JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
});
fs.writeFileSync(out, JSON.stringify(all,null,2),'utf8');
console.log('合并完成:', all.length, '题 →', out);
"
```

确保每道题的 `category` 字段存在（`'复习题'` 或 `'学习通'`），没有的话手动补上。

### 3b. 放到 data/ 目录

将最终的 `科目名.json` 放到 `projects/study-hub/data/` 目录下。

### 3c. 注册科目

打开 `index.html`，找到 `SUBJECT_LIST`（约第 301 行），在数组里加上科目名：

```js
const SUBJECT_LIST = ['马原', '行政法', '刑法', '新科目名'];
```

**就这一行。** 保存即生效。

### 3d. 本地验证

```bash
cd projects/study-hub
npx serve .
```

打开 `http://localhost:3000`，点击新科目标签，确认：
- 题目能正常加载显示
- 作业区分组排序正确
- 知识点卡片正常
- 答题、错题、收藏功能正常

### 3e. 部署

```bash
git add data/新科目名.json index.html
git commit -m "feat: 添加新科目「新科目名」"
git push origin master
```

Netlify 自动部署，等 1-2 分钟即可。

---

## 附录 A：JSON 字段规范

```json
{
  "id": "ch1_single_1",
  "type": "single",
  "homework": "第1章 世界的物质性及其发展规律",
  "tags": ["第1章 世界的物质性及其发展规律"],
  "category": "复习题",
  "question": "马克思主义认为，世界的真正统一性在于它的（）",
  "options": {
    "A": "实践性",
    "B": "运动性",
    "C": "物质性",
    "D": "客观性"
  },
  "answer": "C",
  "explanation": "A. 错误。实践性是马哲特点...B. 错误。运动是物质属性...C. 正确。世界统一于物质。D. 错误。客观性不是统一性本身。",
  "detail": "本题考查世界的物质统一性原理..."
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✅ | 唯一标识，格式 `ch{章节}_{题型}_{序号}` |
| `type` | ✅ | `single` / `multiple` / `judge` / `short` |
| `homework` | ✅ | 作业分组依据，用于首页分组排序 |
| `tags` | ✅ | 知识点标签，用于知识点筛选 |
| `category` | ✅ | `'复习题'` 或 `'学习通'` |
| `question` | ✅ | 题干，不含选项 |
| `options` | 判断题/null | `{A, B, C, D}` |
| `answer` | ✅ | 单选 `"A"`，多选 `"ABC"`，判断 `"对"/"错"` |
| `explanation` | 推荐 | 逐项分析，用于 📝 逐项分析显示 |
| `detail` | 推荐 | 知识点总结，用于 📖 解析显示 |

---

## 附录 B：排序规则（自动）

首页作业区和知识点区按 `extractSortNum` 自动排序：
- 阿拉伯数字（1, 2, 3…）和中文数字（一, 二, 三…）统一识别
- 同格式归一组（"第X章" vs "第X次作业" 自动区分）
- 排序全动态，不需手动配置
