"""编号格式 — 刑法/行政法，每元素独立段落，选项无文本或独立

格式特征：
  作业二 （ 犯罪构成 ）
  共 10 道题目
  1. (单选题, 1分)
  题干段落（可能多段，选项文本常嵌在其中）
  A.  （空段落，文本在题干里）
  B.  （空段落）
  C.  （空段落）
  D.  （空段落）
  我的答案：D
  正确答案：D
  1分

变体（行政法判断题）：A. 对 / B. 错 有文本
"""

from docx import Document
from .base import Question, id_prefix, clean_answer, parse_options_from_text, detect_type
import re


def detect(doc: Document) -> bool:
    """检测：有编号题头 + 选项独立段落（无论有无文本）"""
    has_numbered_q = False
    opt_paragraphs = 0
    for p in doc.paragraphs[:60]:
        text = p.text.strip()
        if re.match(r'\d+\.\s*\(.+\)', text):
            has_numbered_q = True
        if re.match(r'^[A-E][.．、]$', text) or re.match(r'^[A-E][.．、]\s*\S', text):
            opt_paragraphs += 1
    return has_numbered_q and opt_paragraphs >= 2


def extract(doc: Document, filepath: str) -> list[Question]:
    """解析编号格式 docx"""
    lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    # 去文件标题行（如"作业二 （ 犯罪构成 ）"）
    start = 0
    for i, ln in enumerate(lines[:3]):
        if not re.match(r'\d+\.\s*\(', ln) and '共' not in ln and len(ln) < 40:
            start = i + 1
        else:
            break

    questions = []
    i = start
    while i < len(lines):
        line = lines[i]

        # 检测题号
        qm = re.match(r'(\d+)\.\s*\(([^)]+)\)', line)
        if not qm:
            i += 1
            continue

        qtype = detect_type(qm.group(2))
        i += 1

        # 收集题干（直到第一个 A. 行、我的答案行、或下一题）
        stem_parts = []
        while i < len(lines):
            ln = lines[i]
            # 选项空段落检测：单字母 A. B. C. D.
            if re.match(r'^[A-E][.．、]$', ln) or re.match(r'^[A-E][.．、]\s*\S', ln):
                break
            if '我的答案' in ln or '正确答案' in ln:
                break
            if re.match(r'\d+\.\s*\(', ln):
                break
            # 跳过 :答案; 元数据和垃圾行
            if not re.match(r'^[：:][^A-E]+[;；]$', ln) and ln not in ('', '答案：', '答案解析'):
                stem_parts.append(ln)
            i += 1

        stem = ' '.join(stem_parts).strip()

        # 收集选项（可能空也可能有文本）
        options_raw = {}
        while i < len(lines):
            ln = lines[i]
            om = re.match(r'^([A-E])[.．、]\s*(.*)', ln)
            if not om:
                break
            val = om.group(2).strip()
            options_raw[om.group(1)] = val
            i += 1

        # 选项处理：如果有文本直接用；如果全空，从题干中提取
        has_text = any(v for v in options_raw.values())
        if has_text:
            options = {k: v for k, v in options_raw.items() if v}
        else:
            # 选项文本嵌在题干中，从题干提取
            options = parse_options_from_text(stem)
            # 从题干中清除选项文本
            if options:
                first_opt = min(options.keys())
                idx = stem.find(f'{first_opt}.')
                if idx < 0:
                    idx = stem.find(f'{first_opt}．')
                if idx < 0:
                    idx = stem.find(f'{first_opt}、')
                if idx >= 0:
                    stem = stem[:idx].strip()

        # 跳过 我的答案
        if i < len(lines) and '我的答案' in lines[i]:
            i += 1

        # 读正确答案
        answer = ''
        if i < len(lines) and '正确答案' in lines[i]:
            ans_match = re.search(r'正确答案[：:]\s*(.+)', lines[i])
            if ans_match:
                answer = clean_answer(ans_match.group(1).strip(), qtype)
            i += 1

        # 跳过分数行（如 "1分" "0分"）
        if i < len(lines) and re.match(r'^\d+分?$', lines[i]):
            i += 1

        # 尝试读答案解析
        explanation = ''
        if i < len(lines) and '答案解析' in lines[i]:
            explanation = lines[i].replace('答案解析：', '').replace('答案解析:', '').strip()
            i += 1

        if not stem or not answer:
            continue

        prefix = id_prefix(filepath)

        questions.append(Question(
            id=f'{prefix}_{qtype}_{len(questions) + 1}',
            type=qtype,
            homework=prefix,
            tags=[prefix],
            question=stem,
            options=options if qtype != 'judge' else None,
            answer=answer,
            explanation=explanation,
            detail='',
            category='复习题',
        ))

    return questions


