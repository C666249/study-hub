"""行测格式 — 行测模拟题格式（题目用序号开头 1．，不是「题目1.」）

格式特征：
  [bold] 2025公安联考行测（判断推理）模拟
  [bold] 一、单项选择题
  [normal] 1．题干内容
  [normal] A．选项 B．选项 ...
  [bold] 简略解析
  [normal] A. 正确/错误。原因
  [normal] B. 正确/错误。原因
  [bold] 详细解释
  [normal] 详细解释文本...
"""

import re
import os
from docx import Document
from .base import (
    Question, id_prefix,
    parse_options_from_text, explain_to_answer
)


def detect(doc: Document) -> bool:
    """检测：bold段含『简略解析』+『详细解释』，且题目用「数字．」开头（无「题目」前缀）"""
    has_jianlue = False
    has_xiangxi = False
    has_numbered = False
    for p in doc.paragraphs[:30]:
        text = p.text.strip()
        if not text:
            continue
        if any(r.bold for r in p.runs):
            if '简略解析' in text:
                has_jianlue = True
            elif '详细解释' in text:
                has_xiangxi = True
        elif re.match(r'\d+[．]', text) and '题目' not in text:
            has_numbered = True
    return has_jianlue and has_xiangxi and has_numbered


def _extract_tag(text: str) -> str:
    """从详细解释首句提取知识点标签（如「图形推理」「定义判断」）"""
    # 匹配 "本题考查XXX" 或 "本题考查XXX能力/。"
    m = re.search(r'本题考查(.+?)(?:能力|[。，])', text)
    if not m:
        return ''
    tag = m.group(1).strip()
    # 去掉 "中的位置类规律" 等细分描述，保留大类
    tag = re.sub(r'中的.+$', '', tag)
    # 去掉 "与" 后面的部分（如 "职业与核心职能关系" → "职业"）
    # 但对于 "图形推理"、"定义判断" 这类直接保留
    return tag


def extract(doc: Document, filepath: str) -> list[Question]:
    """解析行测格式 docx"""
    base = os.path.basename(filepath).replace('.docx', '')

    # 从文件名提取专题：2025公安联考行测（判断推理）模拟 → 判断推理
    topic_match = re.search(r'[（(](.+?)[）)]', base)
    topic = topic_match.group(1) if topic_match else base

    # 提取纯文本段落，标记是否 bold
    paragraphs = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        is_bold = any(r.bold for r in p.runs)
        paragraphs.append((is_bold, text))

    # 跟踪当前题型
    current_type = 'single'

    # 切题 — 状态机
    questions_raw = []  # (qtype, raw_q, raw_expl, analysis_buf, detail_buf)
    cur_q = None
    cur_expl = None
    analysis_buf = ''
    detail_buf = ''
    in_detail = False

    for bold, text in paragraphs:
        # 节标题（bold，含 "一、" "二、" 等）
        if bold:
            if '二、多项选择' in text:
                current_type = 'multiple'
                continue
            elif '三、判断' in text:
                current_type = 'judge'
                continue
            elif '四、问答' in text or '四、简答' in text:
                current_type = 'short'
                continue

        # 新题：数字+全角点开头（如 "1．"），且非 bold
        if not bold and re.match(r'\d+[．]', text):
            if cur_q is not None:
                questions_raw.append((current_type, cur_q, cur_expl, analysis_buf, detail_buf))
            cur_q = text
            cur_expl = None
            analysis_buf = ''
            detail_buf = ''
            in_detail = False
        elif bold and (text.startswith('简略解析') or text.startswith('简单解析')):
            cur_expl = text
            in_detail = False
        elif bold and (text.startswith('详细解释') or text.startswith('详细解析') or text.startswith('详解')):
            in_detail = True
            detail_buf = text  # 可能 header 本身含内容
        else:
            if in_detail:
                # 后续段落追加到详细解释
                detail_buf += ' ' + text
            elif cur_expl:
                # 逐项分析段落（A. 正确。... B. 错误。...）
                analysis_buf += ' ' + text
            elif cur_q is not None:
                # 选项段落（A．xxx B．xxx）或题干续文 → 拼入题干
                cur_q += ' ' + text

    # 最后一题
    if cur_q is not None:
        questions_raw.append((current_type, cur_q, cur_expl, analysis_buf, detail_buf))

    # 构建 Question 对象
    result = []
    for qtype, raw_q, raw_expl, raw_analysis, raw_detail in questions_raw:
        q = _build(qtype, raw_q, raw_expl, raw_analysis, raw_detail, topic, filepath, len(result) + 1)
        if q:
            result.append(q)
    return result


def _build(qtype: str, raw_q: str, raw_expl: str, raw_analysis: str, raw_detail: str,
           topic: str, filepath: str, seq: int) -> Question | None:
    """从已切好的题块构建 Question"""

    # 去掉题号前缀 "1．"
    stem = re.sub(r'^\d+[．]\s*', '', raw_q).strip()

    # 题干中提取选项
    if qtype == 'judge':
        options = {'A': '正确', 'B': '错误'}
    else:
        options = parse_options_from_text(stem)

    # 从题干文本中去掉选项部分，只保留纯题干
    if options:
        first_opt = min(options.keys())
        for sep in ['．', '.', '、']:
            idx = stem.find(f'{first_opt}{sep}')
            if idx >= 0:
                stem = stem[:idx].strip()
                break

    # 逐项分析
    expl = (raw_expl or '').replace('简略解析', '', 1).replace('简单解析', '', 1).strip()
    if raw_analysis:
        expl = (expl + ' ' + raw_analysis).strip()

    # 详细解释
    dt = (raw_detail or '').replace('详细解释', '').replace('详细解析', '').replace('详解', '').strip()

    # 知识点标签
    tag = _extract_tag(dt) or topic

    # 提取答案
    if qtype == 'judge':
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
        homework=topic,
        tags=[topic, tag] if tag and tag != topic else [topic],
        question=stem,
        options=options,
        answer=answer,
        explanation=expl,
        detail=dt,
        category='模拟题',
    )
