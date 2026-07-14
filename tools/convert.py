"""study-hub docx → JSON 转换器"""

import sys
import os
import re
import json
from dataclasses import asdict

if sys.platform == 'win32':
    try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception: pass
from pathlib import Path

from docx import Document
from plugins.review import detect as review_detect, extract as review_extract
from plugins.xuexitong import detect as xxt_detect, extract as xxt_extract
from plugins.numbered import detect as num_detect, extract as num_extract
from plugins.exam import detect as exam_detect, extract as exam_extract
from plugins.xingce import detect as xingce_detect, extract as xingce_extract

# 插件注册表 — 加新格式只改这里（行测优先于真题卷，避免数字．题号被误匹配）
PLUGINS = [
    ('行测模拟题（数字全角点+简略解析）', xingce_detect, xingce_extract),
    ('真题卷（简体标记+序号）', exam_detect, exam_extract),
    ('复习题（bold标记）', review_detect, review_extract),
    ('学习通（独立段落）', xxt_detect, xxt_extract),
    ('编号格式（刑法/行政法）', num_detect, num_extract),
]


def detect_format(doc: Document):
    """自动识别 docx 格式，返回 (name, extract_fn)"""
    for name, detector, extractor in PLUGINS:
        if detector(doc):
            return name, extractor
    return None, None


def validate(questions: list) -> dict:
    """校验题目质量，返回报告"""
    report = {
        'total': len(questions),
        'by_type': {},
        'warnings': [],
    }
    for q in questions:
        report['by_type'][q.type] = report['by_type'].get(q.type, 0) + 1
        # 检测选项是否以"正确。"或"错误。"开头（答案泄露）
        if q.options:
            for k, v in q.options.items():
                if re.match(r'^(正确|错误)[。.]', v):
                    report['warnings'].append(
                        f'[{q.id}] 选项 {k} 疑似含答案: {v[:30]}')
        # 检测题干是否含"简略解析"
        if '简略解析' in q.question:
            report['warnings'].append(
                f'[{q.id}] 题干含"简略解析"未清除干净')
        # 检测空答案
        if not q.answer:
            report['warnings'].append(f'[{q.id}] 答案为空')
    return report


def convert_one(filepath: str) -> tuple[list, dict]:
    """转换单个 docx → (题目列表, 校验报告)"""
    doc = Document(filepath)
    name, extract_fn = detect_format(doc)
    if not extract_fn:
        raise ValueError(f'无法识别格式: {os.path.basename(filepath)}')

    questions = extract_fn(doc, filepath)
    report = validate(questions)
    report['format'] = name
    report['file'] = os.path.basename(filepath)
    return questions, report


def print_report(report: dict):
    """打印校验报告"""
    print(f"  格式: {report.get('format', '?')}")
    print(f"  题数: {report['total']}  ", end='')
    for t, n in report['by_type'].items():
        print(f'{t}:{n}  ', end='')
    print()
    if report['warnings']:
        print(f'  ⚠ {len(report["warnings"])} 个警告:')
        for w in report['warnings'][:5]:
            print(f'    - {w}')
        if len(report['warnings']) > 5:
            print(f'    ... 还有 {len(report["warnings"]) - 5} 个')


def process_path(p: str, merge_output: str = ''):
    """处理路径：单文件或文件夹"""
    p = p.strip().strip('"').strip("'")
    if not p or not os.path.exists(p):
        print(f'路径不存在: {p}')
        return

    if os.path.isfile(p):
        files = [p]
    else:
        files = sorted([
            os.path.join(p, f) for f in os.listdir(p)
            if f.endswith('.docx') and not f.startswith('~$')
        ])
        if not files:
            print(f'目录下没有 .docx 文件')
            return
        print(f'发现 {len(files)} 个 docx 文件\n')

    all_questions = []
    for f in files:
        print(f'[FILE] {os.path.basename(f)}', end=' ')
        try:
            questions, report = convert_one(f)
            all_questions.extend(questions)
            print_report(report)

            # 输出单文件 JSON
            out = f.replace('.docx', '.json')
            with open(out, 'w', encoding='utf-8') as fh:
                json.dump([asdict(q) for q in questions], fh, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f'  ❌ 失败: {e}')

    total = len(all_questions)
    print(f'\n[TOTAL] 总计: {total} 题')

    if total == 0:
        return

    # 合并输出
    if merge_output:
        out_path = merge_output
    elif len(files) > 1 and os.path.isdir(os.path.dirname(files[0])):
        parent = os.path.dirname(files[0])
        out_path = os.path.join(parent, '_merged.json')
    else:
        return

    # 去重：相同题目（前30字符）只保留第一个
    seen = set()
    unique = []
    for q in all_questions:
        key = q.question[:30] if hasattr(q, 'question') else q.get('question', '')[:30]
        if key not in seen:
            seen.add(key)
            unique.append(q)

    # 转为 dict 列表写入
    output = [asdict(q) if hasattr(q, '__dataclass_fields__') else (q.__dict__ if hasattr(q, '__dict__') else q) for q in unique]

    with open(out_path, 'w', encoding='utf-8') as fh:
        json.dump(output, fh, ensure_ascii=False, indent=2)
    print(f'[SAVE] 去重合并: {len(unique)} 题 → {out_path}')


# ── 入口 ──
if __name__ == '__main__':
    cli_path = sys.argv[1] if len(sys.argv) > 1 else ''
    if cli_path and cli_path != '--':
        process_path(cli_path)
    else:
        # 交互模式
        print('=' * 50)
        print('  study-hub docx → JSON 转换器')
        print('  支持: 复习题 / 学习通 / 编号格式')
        print('=' * 50)
        while True:
            print('\n拖入 docx 文件或文件夹路径 (输入 q 退出):')
            try:
                inp = input('> ').strip()
            except (EOFError, KeyboardInterrupt):
                break
            if inp.lower() == 'q':
                break
            if inp:
                process_path(inp)
