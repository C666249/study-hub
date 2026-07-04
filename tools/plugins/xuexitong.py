"""学习通格式 — 每元素独立段落，无 bold，选项有文本

格式特征：
  共 60 道题目
  1. (单选题)
  题干段落
  A. 选项A文本
  B. 选项B文本
  C. 选项C文本
  D. 选项D文本
  我的答案：C
  正确答案：C
"""

from docx import Document
from .base import Question, id_prefix, clean_answer
import re


def detect(doc: Document) -> bool:
    """检测是否为此格式 — 独立选项段落且有文本"""
    has_numbered_q = False
    opts_with_text = 0
    for p in doc.paragraphs[:60]:
        text = p.text.strip()
        if re.match(r'\d+\.\s*\(.+\)', text):
            has_numbered_q = True
        if re.match(r'^[A-E][.．、]\s*\S', text):
            opts_with_text += 1
    return has_numbered_q and opts_with_text >= 3


def extract(doc: Document, filepath: str) -> list[Question]:
    """解析学习通格式 docx"""
    # 提取非空段落
    lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    questions = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # 检测题号标记
        qm = re.match(r'(\d+)\.\s*\(([^)]+)\)', line)
        if not qm:
            i += 1
            continue

        qtype = _detect_type(qm.group(2))

        # 收集题干（直到第一个 A. 选项行或 我的答案 行）
        i += 1
        stem_parts = []
        while i < len(lines):
            ln = lines[i]
            if re.match(r'^[A-E][.．、]', ln) or '我的答案' in ln or '正确答案' in ln:
                break
            if re.match(r'\d+\.\s*\(', ln):  # 下一题开始
                break
            # 过滤学习通平台重复的 :答案; 元数据
            if not re.match(r'^[：:][^:;：；]+[;；]', ln):
                stem_parts.append(ln)
            i += 1

        stem = ' '.join(stem_parts).strip()

        # 收集选项
        options = {}
        while i < len(lines):
            ln = lines[i]
            om = re.match(r'^([A-E])[.．、]\s*(.*)', ln)
            if not om:
                break
            val = om.group(2).strip()
            if val:  # 只收集有文本的选项
                options[om.group(1)] = val
            i += 1

        # 跳过 我的答案
        if i < len(lines) and '我的答案' in lines[i]:
            i += 1

        # 读正确答案
        answer = ''
        if i < len(lines) and '正确答案' in lines[i]:
            ans_text = lines[i]
            ans_match = re.search(r'正确答案[：:]\s*(.+)', ans_text)
            if ans_match:
                raw = ans_match.group(1).strip()
                answer = clean_answer(raw, qtype)
            i += 1

        # 读答案解析（如果有）
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
            category='学习通',
        ))

    return questions


def _detect_type(label: str) -> str:
    if '单' in label:
        return 'single'
    if '多' in label:
        return 'multiple'
    if '判' in label:
        return 'judge'
    return 'short'
