"""马原复习题格式 — bold 标记嵌入段落型

格式特征：
  [bold] 第一章 世界的物质性及其发展规律
  [bold] 一、单项选择题
  [bold] 题目 + 题干 + A．选项 B．选项 ...
  [bold] 简略解析 + A. 正确。... B. 错误。...
  [bold] 详细解释 + 考点总结文字
"""

import re
from docx import Document
from .base import (
    Question, chapter_tag, id_prefix,
    parse_options_from_text, explain_to_answer
)


def detect(doc: Document) -> bool:
    """检测是否为此格式"""
    for p in doc.paragraphs[:5]:
        text = p.text.strip()
        if any(r.bold for r in p.runs):
            if text.startswith('题目') or text.startswith('简略解析'):
                return True
    return False


def extract(doc: Document, filepath: str) -> list[Question]:
    """解析复习题格式 docx"""
    # 提取纯文本（合并每个段落的 runs）
    paragraphs = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        is_bold = any(r.bold for r in p.runs)
        paragraphs.append((is_bold, text))

    # 找章节标题
    chapter_title = ''
    for bold, text in paragraphs:
        if bold and ('章' in text) and len(text) < 30:
            chapter_title = text
            break

    # 按 bold 标记切题
    questions = []
    current_question = None
    current_explanation = None
    buffer = ''

    current_type = 'single'  # 跟踪当前节题型
    for bold, text in paragraphs:
        # 节标题检测
        if bold:
            if '二、多项选择' in text:
                current_type = 'multiple'
                continue
            elif '三、判断' in text:
                current_type = 'judge'
                continue
            elif re.search(r'[四五六]、简答', text) or re.search(r'[四五六]、辨析', text):
                current_type = 'short'
                continue

        if bold and text.startswith('题目'):
            # 新题开始 → 处理上一题
            if current_question is not None:
                questions.append(
                    (current_type, current_question, current_explanation, buffer, detail_text)
                )
            # 判断题：题目 + 详细解析在同一段落，用换行分隔
            if current_type == 'judge' and '详细解析' in text:
                parts = text.split('详细解析', 1)
                current_question = '题目' + parts[0].replace('题目', '', 1).strip()
                # 判断题答案：详细解析后的第一个词是"正确"或"错误"
                detail_part = parts[1].strip().lstrip('：:：') if len(parts) > 1 else ''
                if detail_part.startswith('正确'):
                    current_explanation = '对'
                    detail_text = '详细解释' + detail_part
                elif detail_part.startswith('错误'):
                    current_explanation = '错'
                    detail_text = '详细解释' + detail_part
                else:
                    current_explanation = ''
                    detail_text = '详细解释' + detail_part
                # 判断题一步完成
                questions.append(
                    (current_type, current_question, current_explanation, buffer, detail_text)
                )
                current_question = None
                current_explanation = None
                buffer = ''
                detail_text = ''
            else:
                current_question = text
                current_explanation = None
                buffer = ''
                detail_text = ''
        elif bold and (text.startswith('简略解析') or text.startswith('简略解析') or text.startswith('简单解析')):
            current_explanation = text
        elif bold and (text.startswith('详细解释') or text.startswith('详细解析') or text.startswith('详解')):
            # 详细解释 — 完成本题
            if current_question is not None:
                questions.append(
                    (current_type, current_question, current_explanation, buffer, text)
                )
                current_question = None
                current_explanation = None
                buffer = ''
                detail_text = ''
        else:
            # 可能是跨行的题干/解析续文
            if current_question and not current_explanation:
                current_question += ' ' + text
            elif current_explanation:
                buffer += ' ' + text

    # 处理最后一题（无详细解释的情况）
    if current_question is not None:
        questions.append(
            (current_type, current_question, current_explanation, buffer, detail_text)
        )

    # 构建 Question 对象
    result = []
    for qtype, raw_q, raw_expl, raw_buf, raw_detail in questions:
        q = _build_question(qtype, raw_q, raw_expl, raw_buf, raw_detail, chapter_title, filepath, len(result) + 1)
        if q:
            result.append(q)
    return result


def _build_question(qtype: str, raw_q: str, raw_expl: str, raw_buf: str, raw_detail: str, chapter_title: str, filepath: str, seq: int) -> Question | None:
    """从已切好的题块构建 Question"""
    stem_text = raw_q.replace('题目', '', 1).strip()

    # 找简略解析边界（题干末尾可能无缝接简略解析）
    for marker in ['简略解析', '简略解析']:
        idx = stem_text.find(marker)
        if idx >= 0:
            stem_text = stem_text[:idx].strip()
            break

    # 从题干中提取选项
    options = parse_options_from_text(stem_text)
    if options:
        first_opt = min(options.keys())
        for sep in ['．', '.', '、']:
            idx = stem_text.find(f'{first_opt}{sep}')
            if idx >= 0:
                stem_text = stem_text[:idx].strip()
                break

    # 解析原文
    expl_raw = raw_expl or ''
    expl_raw = expl_raw.replace('简略解析', '', 1).replace('简略解析', '', 1).strip()
    if raw_buf:
        expl_raw = (expl_raw + ' ' + raw_buf).strip()

    # 详细解释
    detail_raw = raw_detail or ''
    detail_raw = detail_raw.replace('详细解释', '').replace('详细解析', '').replace('详解', '').strip()

    # 判断题：答案已从"详细解析"第一词提取
    if qtype == 'judge':
        answer = '对' if expl_raw == '对' or expl_raw.startswith('对') else ('错' if expl_raw == '错' or expl_raw.startswith('错') else '')
    else:
        answer = explain_to_answer(expl_raw, options) if options else ''

    if not stem_text or not answer:
        return None

    tag = chapter_title or chapter_tag(filepath)
    prefix = id_prefix(filepath)

    return Question(
        id=f'{prefix}_{qtype}_{seq}',
        type=qtype,
        homework=tag,
        tags=[tag],
        question=stem_text,
        options=options,
        answer=answer,
        explanation=expl_raw,
        detail=detail_raw,
        category='复习题',
    )
