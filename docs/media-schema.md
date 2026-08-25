# Study Hub 图片题 Schema v2

现有纯文字题保持原字段不变。需要图片的新题增加可选内容块字段：

- `questionContent`: 题干内容块
- `optionContent`: 按选项字母组织的内容块
- `explanationContent`: 逐项分析内容块
- `detailContent`: 详细解析内容块

内容块支持：

```json
{ "type": "text", "text": "观察下列图形，选择正确答案。" }
```

```json
{
  "type": "image",
  "src": "data/media/xingce/2026-ga/q001/stem-01.png",
  "alt": "题干图形序列",
  "caption": "题干图"
}
```

完整示例：

```json
{
  "id": "2026ga_single_001",
  "type": "single",
  "homework": "判断推理",
  "tags": ["判断推理", "图形推理"],
  "question": "观察下列图形，选择最合适的一项。",
  "questionContent": [
    { "type": "text", "text": "观察下列图形，选择最合适的一项。" },
    {
      "type": "image",
      "src": "data/media/xingce/2026-ga/q001/stem-01.png",
      "alt": "题干图形序列"
    }
  ],
  "options": { "A": "", "B": "", "C": "", "D": "" },
  "optionContent": {
    "A": [{ "type": "image", "src": "data/media/xingce/2026-ga/q001/option-a.png", "alt": "选项A" }],
    "B": [{ "type": "image", "src": "data/media/xingce/2026-ga/q001/option-b.png", "alt": "选项B" }],
    "C": [{ "type": "image", "src": "data/media/xingce/2026-ga/q001/option-c.png", "alt": "选项C" }],
    "D": [{ "type": "image", "src": "data/media/xingce/2026-ga/q001/option-d.png", "alt": "选项D" }]
  },
  "answer": "B",
  "explanation": "B项符合规律。",
  "detailContent": [
    { "type": "text", "text": "位置变化规律如下：" },
    {
      "type": "image",
      "src": "data/media/xingce/2026-ga/q001/answer-guide.png",
      "alt": "答案推导示意图"
    }
  ]
}
```

## 路径规则

- 图片必须存放在 `data/media/` 内并使用仓库相对路径。
- 支持 PNG、JPG/JPEG、WebP、GIF、SVG、AVIF。
- 不接受网络 URL、`data:` URL、`javascript:` URL、`..` 路径或查询参数。
- 黑白线条图优先使用 PNG；照片优先使用 WebP/JPEG。
- 导入的复杂矢量格式建议先转换为 PNG。

## 编写规则

- `question` 和 `options` 仍保留文字回退，以兼容搜索、AI 上下文和旧版本。
- 存在内容块时，页面优先渲染内容块。
- `alt` 应描述图片性质，不能提前透露解题规律或答案。
- 选项图片点击选项区域可答题，点击右下角放大按钮可查看原图。
