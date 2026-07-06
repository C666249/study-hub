"""真题卷格式 — 类似复习题但简体标记 + 序号题目

格式特征：
  [bold] 马原2023-2024A卷
  [bold] 一、单项选择题
  [bold] 题目1. 题干 A．选项 B．选项 ...
  [bold] 简略解析 A. 正确。... B. 错误。...
  [bold] 详细解释 考点总结文字
"""

import re
from docx import Document
from .base import (
    Question, chapter_tag, id_prefix,
    parse_options_from_text, explain_to_answer
)


def detect(doc: Document) -> bool:
    """检测是否为此格式：bold段包含『简略解析』+『详细解释』（简体）"""
    has_jianlue = False
    has_xiangxi = False
    for p in doc.paragraphs[:30]:
        text = p.text.strip()
        if any(r.bold for r in p.runs):
            if '简略解析' in text:
                has_jianlue = True
            elif '详细解释' in text:
                has_xiangxi = True
    return has_jianlue and has_xiangxi


def extract(doc: Document, filepath: str) -> list[Question]:
    """解析真题卷格式 docx"""
    import os
    base = os.path.basename(filepath).replace('.docx', '')

    # 提取纯文本段落
    paragraphs = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        is_bold = any(r.bold for r in p.runs)
        paragraphs.append((is_bold, text))

    # 选择题型标题（bold，含 "一、" "二、" 等）
    current_type = 'single'
    for bold, text in paragraphs:
        if bold and '二、多项选择' in text:
            current_type = 'multiple'
            break
        elif bold and '三、判断' in text:
            current_type = 'judge'
            break
    # 重新扫描：跟踪当前节的题型
    current_type = 'single'

    # 切题
    questions_raw = []
    cur_q = None
    cur_expl = None
    buf = ''
    detail = ''

    for bold, text in paragraphs:
        # 节标题
        if bold:
            if '二、多项选择' in text:
                current_type = 'multiple'
                continue
            elif '三、判断' in text:
                current_type = 'judge'
                continue
            elif '四、问答' in text or '四、简答' in text or '四、辨析' in text:
                current_type = 'short'
                continue

        # 新题："题目" 开头（不要求 bold，真题卷题干不一定是 bold）
        if re.match(r'题目\d+[.．、]', text):
            if cur_q is not None:
                questions_raw.append((current_type, cur_q, cur_expl, buf, detail))
            cur_q = text
            cur_expl = None
            buf = ''
            detail = ''
        elif bold and (text.startswith('简略解析') or text.startswith('简单解析')):
            cur_expl = text
        elif bold and (text.startswith('详细解释') or text.startswith('详细解析') or text.startswith('详解')):
            if cur_q is not None:
                questions_raw.append((current_type, cur_q, cur_expl, buf, text))
                cur_q = None
                cur_expl = None
                buf = ''
                detail = ''
        else:
            if cur_q and not cur_expl:
                cur_q += ' ' + text
            elif cur_expl:
                buf += ' ' + text

    # 最后一题
    if cur_q is not None:
        questions_raw.append((current_type, cur_q, cur_expl, buf, detail))

    # 构建 Question 对象
    result = []
    for qtype, raw_q, raw_expl, raw_buf, raw_detail in questions_raw:
        q = _build(qtype, raw_q, raw_expl, raw_buf, raw_detail, base, filepath, len(result) + 1)
        if q:
            result.append(q)
    return result


def _build(qtype: str, raw_q: str, raw_expl: str, raw_buf: str, raw_detail: str,
           base: str, filepath: str, seq: int) -> Question | None:
    """从已切好的题块构建 Question"""
    # 去掉 "题目1." 前缀
    stem = re.sub(r'^题目\d+[.．、]?\s*', '', raw_q).strip()

    # 找简略解析边界
    idx = stem.find('简略解析')
    if idx >= 0:
        stem = stem[:idx].strip()

    # 从题干中提取选项
    if qtype == 'judge':
        # 判断题选项固定为 正确/错误，parse_options_from_text 会过滤掉
        options = {'A': '正确', 'B': '错误'}
    else:
        options = parse_options_from_text(stem)
    if options:
        first_opt = min(options.keys())
        for sep in ['．', '.', '、']:
            idx = stem.find(f'{first_opt}{sep}')
            if idx >= 0:
                stem = stem[:idx].strip()
                break

    # 逐项分析
    expl = (raw_expl or '').replace('简略解析', '', 1).replace('简单解析', '', 1).strip()
    if raw_buf:
        expl = (expl + ' ' + raw_buf).strip()

    # 详细解释
    dt = (raw_detail or '').replace('详细解释', '').replace('详细解析', '').replace('详解', '').strip()

    # 答案
    if qtype == 'short':
        # 简答题的逐项分析即为参考答案
        answer = expl.strip()
    elif qtype == 'judge':
        # 真题格式：选项中 "A. 正确" / "B. 错误" → 从解析中提取正确答案的字母，映射为对/错
        letter = explain_to_answer(expl, options) if options else ''
        answer = '对' if letter == 'A' else ('错' if letter == 'B' else '')
    else:
        answer = explain_to_answer(expl, options) if options else ''

    if not stem:
        return None
    if not answer and qtype != 'short':
        return None

    prefix = id_prefix(filepath)

    return Question(
        id=f'{prefix}_{qtype}_{seq}',
        type=qtype,
        homework=base,
        tags=[base],
        question=stem,
        options=options,
        answer=answer,
        explanation=expl,
        detail=dt,
        category='真题练',
    )
