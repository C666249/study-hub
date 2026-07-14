# Study Hub 操作手册

涵盖所有日常操作：加科目、改题库、标签系统、格式插件、部署。

---

## 速查表

| 操作 | 步骤 | 涉及文件 |
|------|------|----------|
| **加新科目** | docx → convert.py → 合并 JSON → 改 SUBJECT_LIST | data/、index.html |
| **追加题目** | 新 docx 单独转换 → 手动合并 JSON → commit | data/科目名.json |
| **改标签** | 直接编辑 JSON 的 `tags` 字段 | data/科目名.json |
| **加新 docx 格式** | 写插件 → 注册到 convert.py | tools/plugins/、tools/convert.py |
| **部署** | `git push origin master` → GitHub Pages 自动部署 | — |

---

## 一、标签系统

### 1.1 标签是什么

每道题的 `tags` 字段是一个字符串数组，用于**知识点分类**和**筛选**：

```json
{
  "tags": ["判断推理", "图形推理"]
}
```

首页的「知识点」区域按 `tags` 统计各知识点题数，点击可筛选只做该知识点的题。搜索结果也展示标签。

### 1.2 标签如何生成

| 来源 | 说明 |
|------|------|
| **插件自动提取** | xingce/exam 插件从「详细解释」首句提取（如「本题考查图形推理中的位置类规律」→ 标签 `图形推理`） |
| **文件名** | 插件的 `homework` 字段（如「判断推理」）自动作为第一个标签 |
| **手动补充** | 直接编辑 JSON，在 `tags` 数组中添加/删除/修改标签 |

### 1.3 标签粒度建议

- **第一个标签**：大类（科目/专题），如「判断推理」「言语理解」
- **第二个标签**：小类（知识点），如「图形推理」「定义判断」「主旨概括」
- 不宜过细（如「图形推理中的位置类规律」——太细，标签过多不便筛选）

### 1.4 手动修改标签

直接编辑 `data/科目名.json`，改 `tags` 数组。改完后本地验证：

```bash
cd projects/study-hub
npx serve .
# 打开 http://localhost:3000，确认知识点卡片显示正确
```

---

## 二、加新科目

### Step 1：准备 docx 题库

按 [docx-format-guide.md](docx-format-guide.md) 规范让 LLM 生成 docx，或用现成的 docx。

如果 docx 格式不同于已有插件，需要先写插件（见第四章）。

### Step 2：docx → JSON

```bash
cd D:\Claude\projects\study-hub
python tools\convert.py "D:\path\to\docx文件夹"
```

每个 `.docx` 在同目录生成同名 `.json`，同时生成 `_merged.json`（去重合并）。

**验证转换质量**（在生成的 JSON 目录）：

```bash
node -e "const d=require('./xxx.json'); console.log('题数:', d.length); d.slice(0,2).forEach(q => { console.log('题干:', q.question.substring(0,60)); console.log('选项:', JSON.stringify(q.options)); console.log('答案:', q.answer); console.log('---'); });"
```

检查要点：
- 选项文本不含「正确」「错误」字样
- `answer` 字段干净
- `tags` 已填充

### Step 3：合并 JSON（如果多文件）

如果有多章/多个 docx，用 Node 合并：

```bash
node -e "
const fs=require('fs'),path=require('path');
const files=['./文件1.json','./文件2.json'];  // 改这里
let all=[];
files.forEach(f=>{ all.push(...require(f)); });
fs.writeFileSync('../study-hub/data/科目名.json', JSON.stringify(all,null,2),'utf8');
console.log('合并完成:', all.length, '题');
"
```

单文件直接复制到 `data/科目名.json`。注意不要用 `_merged.json`（它做了去重，可能丢题）。

### Step 4：注册科目

在 `index.html` 中找到 `SUBJECT_LIST`（约第 328 行），在数组末尾加科目名：

```js
const SUBJECT_LIST = ['马原', '行政法', '刑法', '行测', '新科目'];
```

**就这一行。** 不需要改其他代码。

### Step 5：本地验证

```bash
cd projects\study-hub
npx serve .
```

浏览器打开 `http://localhost:3000`，验证：
- 新科目标签能切换
- 题目加载正常
- 知识点卡片正确
- 答题/错题/收藏功能正常

### Step 6：部署

```bash
git add data/新科目.json index.html
git commit -m "feat: 添加新科目「新科目名」"
git push origin master
```

GitHub Pages 自动部署，等 1-2 分钟生效。

---

## 三、更新已有题库

### 3.1 追加新题目

新 docx → 单转 JSON → 手动合并到现有 `data/科目名.json`：

```bash
# 1. 转换新 docx
python tools\convert.py "D:\path\to\新题目.docx"

# 2. 合并（用 Node）
node -e "
const fs=require('fs');
const old=require('../study-hub/data/科目名.json');
const add=require('./新题目.json');
const all=[...old, ...add];
fs.writeFileSync('../study-hub/data/科目名.json', JSON.stringify(all,null,2),'utf8');
console.log('old:', old.length, '+ new:', add.length, '= total:', all.length);
"
```

### 3.2 替换/修正题目

直接编辑 `data/科目名.json`，按 `id` 定位修改。常见修正：

- 修正错误的 `answer`
- 补充 `explanation` 或 `detail`
- 调整 `tags`

### 3.3 批量更新标签

```bash
node -e "
const fs=require('fs');
const data=require('../study-hub/data/科目名.json');
data.forEach(q => {
  // 示例：把「逻辑判断能力」统一为「逻辑判断」
  q.tags = q.tags.map(t => t.replace('逻辑判断能力','逻辑判断'));
});
fs.writeFileSync('../study-hub/data/科目名.json', JSON.stringify(data,null,2),'utf8');
console.log('done');
"
```

---

## 四、插件系统（docx 格式适配）

### 4.1 现有插件

| 插件 | 文件 | 触发条件 | 适用场景 |
|------|------|----------|----------|
| **行测模拟题** | `plugins/xingce.py` | `数字．` 题号 + `简略解析`/`详细解释` bold 标题 | 行测类题库 |
| **真题卷** | `plugins/exam.py` | `题目1.` 题号 + `简略解析`/`详细解释` bold 标题 | 真题卷 |
| **复习题** | `plugins/review.py` | bold 标记的题型标题 | 马原等复习题 |
| **学习通** | `plugins/xuexitong.py` | 独立段落、特定标记 | 学习通导出的题库 |
| **编号格式** | `plugins/numbered.py` | 编号式题目 | 刑法/行政法等 |

检测顺序：行测 → 真题卷 → 复习题 → 学习通 → 编号格式。**匹配到第一个就停止**，所以新插件要注册在能误匹配它的插件前面。

### 4.2 添加新格式插件

如果你的 docx 是全新格式，写一个新插件：

1. **创建** `tools/plugins/新格式.py`，参考 `xingce.py` 的结构：

```python
"""新格式描述"""
import re, os
from docx import Document
from .base import Question, id_prefix, parse_options_from_text, explain_to_answer

def detect(doc: Document) -> bool:
    """检测：你的格式的独特特征"""
    # 检查前 30 个段落，找到你的格式独有的标记组合
    return has_feature_a and has_feature_b

def extract(doc: Document, filepath: str) -> list[Question]:
    """解析 docx → Question 列表"""
    # 状态机遍历段落，切题、提取字段
    # 最后 _build 每道题
    ...

def _build(...)  -> Question | None:
    ...
    return Question(id=..., type=..., homework=..., tags=..., ...)
```

2. **注册**到 `tools/convert.py`：

```python
from plugins.新格式 import detect as xxx_detect, extract as xxx_extract

PLUGINS = [
    ('新格式（描述）', xxx_detect, xxx_extract),  # 插在能误匹配它的插件前面
    ...
]
```

3. **测试**：

```bash
python tools\convert.py "D:\path\to\test.docx"
```

### 4.3 公共工具（`base.py`）

所有插件共享的工具都在 [tools/plugins/base.py](../tools/plugins/base.py)：

| 函数 | 用途 |
|------|------|
| `parse_options_from_text(text)` | 从文本中提取 `{A: "…", B: "…"}` |
| `explain_to_answer(expl, opts)` | 从「A. 正确」「B. 错误」中提取答案字母 |
| `id_prefix(filepath)` | 从文件名生成唯一 ID 前缀 |
| `clean_answer(ans, qtype)` | 清洗答案（去分数、统一判断格式） |
| `Question` dataclass | 统一的题目数据结构 |

---

## 五、JSON 字段完整参考

```json
{
  "id": "2025公安联考行测判断_single_1",
  "type": "single",
  "homework": "判断推理",
  "tags": ["判断推理", "图形推理"],
  "category": "模拟题",
  "question": "从所给的四个选项中，选择最合适的一个填入问号处...",
  "options": {
    "A": "小三角形位于正方形左上角",
    "B": "小三角形位于正方形右上角",
    "C": "小三角形位于正方形右下角",
    "D": "小三角形位于正方形左下角"
  },
  "answer": "B",
  "explanation": "A. 错误。不符合顺时针旋转90度的规律。 B. 正确。... C. 错误。... D. 错误。...",
  "detail": "本题考查图形推理中的位置类规律。观察题干图形..."
}
```

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `id` | ✅ | string | 唯一标识，建议 `{前缀}_{题型}_{序号}` |
| `type` | ✅ | string | `single` / `multiple` / `judge` / `short` |
| `homework` | ✅ | string\|int | 分组依据，首页按此分组排序 |
| `tags` | ✅ | string[] | 知识点标签，至少一个；首页知识点卡片按此统计 |
| `category` | 推荐 | string | `'复习题'` / `'学习通'` / `'模拟题'` / `'真题练'` |
| `question` | ✅ | string | 题干，不含选项 |
| `options` | 判题 null | object | `{A, B, C, D}`，判断题填 `null` |
| `answer` | ✅ | string | 单选 `"A"`，多选 `"ABC"`，判断 `"对"/"错"` |
| `explanation` | 推荐 | string | 逐项分析（📝 显示） |
| `detail` | 推荐 | string | 知识点总结（📖 显示） |

---

## 六、项目命令速查

```bash
# 本地运行
cd D:\Claude\projects\study-hub
npx serve .                    # 启动本地服务器

# 题库转换
python tools\convert.py "D:\path\to\docx文件夹"    # 转换整个文件夹
python tools\convert.py "D:\path\to\file.docx"      # 转换单个文件

# 验证 JSON
node -e "const d=require('./data/科目名.json'); console.log(d.length, 'questions');"

# 运行测试
node tests\core.test.js

# Git 操作
git add data/科目名.json index.html
git commit -m "feat: 描述改动"
git push origin master
```

---

## 七、常见问题

**Q: 转换出 0 题？**
A: docx 格式未匹配到任何插件。先用 python-docx 提取文本看格式：
```bash
python -c "from docx import Document; d=Document('file.docx'); [print(p.text[:100]) for p in d.paragraphs[:20] if p.text.strip()]"
```
然后对照写新插件或调整现有插件。

**Q: 合并非 80 题（实际有 80）？**
A: `convert.py` 的 `_merged.json` 做了首 30 字符去重，不同科目的题可能被误杀。**不要用 `_merged.json`，手动合并**。

**Q: 标签没有自动提取？**
A: 插件在「详细解释」首句查找 `本题考查XXX` 模式。如果没有这个模式，标签退化为 `homework` 值。可手动编辑 JSON 补充。

**Q: GitHub Pages 没更新？**
A: 等 1-2 分钟。去仓库 Settings → Pages 看部署状态。如果卡住，检查 `.github/workflows/pages.yml`。
