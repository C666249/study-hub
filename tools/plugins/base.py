"""Question 数据类 + 公共工具 — 所有插件共享"""

from dataclasses import dataclass, field
import re

CN_NUM = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
          '六': 6, '七': 7, '八': 8, '九': 9, '十': 10}


@dataclass
class Question:
    """统一的题目数据结构，所有插件输出这个"""
    id: str
    type: str          # single / multiple / judge / short
    homework: str      # 作业分组名（如"第1章 世界的物质性"）
    tags: list         # 知识点标签
    question: str      # 题干（不含选项）
    options: dict | None  # {A: "选项文本", ...} judge 题为 None
    answer: str        # "A" / "ABC" / "对" / "错"
    explanation: str   # 逐项分析
    detail: str        # 详细解析
    category: str = '' # "复习题" / "学习通"


# ── 公共工具 ──

def extract_num(text: str) -> int:
    """从文本提取第一个数字（中文/阿拉伯），用于排序"""
    m = re.search(r'\d+', text)
    if m:
        return int(m.group())
    m = re.search(r'[一二三四五六七八九十百]+', text)
    if m:
        s = m.group()
        # 处理 "十二" 等
        m2 = re.match(r'([一二三])?十([一二三四五六七八九])?', s)
        if m2 and (m2.group(1) or s.startswith('十')):
            v = 0
            if m2.group(1):
                v += CN_NUM[m2.group(1)] * 10
            elif s.startswith('十'):
                v += 10
            if m2.group(2):
                v += CN_NUM[m2.group(2)]
            return v
        return CN_NUM.get(s[0], 999)
    return 999


def chapter_num(filename: str) -> str:
    """从文件名提取章节号，如 '第一章_xxx.docx' → '1'"""
    m = re.search(r'第([一二三四五六七八九十\d]+)章', filename)
    if not m:
        return ''
    s = m.group(1)
    if s.isdigit():
        return s
    return str(CN_NUM.get(s, ''))


def chapter_tag(filename: str) -> str:
    """从文件名生成章节标签，如 '第一章_世界的物质性.docx' → '第1章 世界的物质性'"""
    import os
    base = os.path.basename(filename).replace('.docx', '')
    ch = chapter_num(filename)
    m = re.match(r'第[^_]+_(.+)', base)
    name = m.group(1).strip() if m else base
    return f'第{ch}章 {name}' if ch else base


def id_prefix(filename: str) -> str:
    """从文件名生成唯一 ID 前缀"""
    import os
    base = os.path.basename(filename).replace('.docx', '')
    # 清洗：去空格和特殊符号，保留中文和数字
    clean = re.sub(r'[\s（）()]+', '', base)
    return clean[:12]


def detect_type(label: str) -> str:
    """从题型标签中检测类型：单/多/判/简"""
    if '单' in label:
        return 'single'
    if '多' in label:
        return 'multiple'
    if '判' in label:
        return 'judge'
    return 'short'


def clean_answer(ans: str, qtype: str) -> str:
    """清洗答案：去分数、去HTML标签"""
    ans = ans.strip()
    # 去掉 "2分" "1分" 等
    ans = re.sub(r'\d+分\s*$', '', ans)
    # 如果答案形如 "A. B. C." 去掉点号
    if '.' in ans and len(ans) > 2:
        ans = ans.replace('.', '').replace(' ', '')
    if qtype == 'judge':
        if '对' in ans or '正确' in ans:
            return '对'
        if '错' in ans or '错误' in ans:
            return '错'
    return ans


def parse_options_from_text(text: str) -> dict | None:
    """从一段文本中提取选项 {A: '...', B: '...'}，支持全角/半角点"""
    # 预处理：统一选项分隔符，处理 "E 社会意识"（只有空格无点号）这类边缘情况
    # 在独立的选项字母后补点号
    text = re.sub(r'(?<=[\n\r])\s*([A-E])\s+(?=[一-鿿])', r'\1. ', text)
    text = re.sub(r'(?<=[。；])\s*([A-E])\s+(?=[一-鿿])', r'\1. ', text)
    opts = {}
    # 匹配 A．/ A. / A、三种分隔符
    pattern = re.compile(r'([A-E])[.．、]\s*(.+?)(?=\s*[A-E][.．、]|$)', re.DOTALL)
    matches = pattern.findall(text)
    for letter, val in matches:
        v = val.strip()
        # 过滤掉混入的"正确""错误"（答案泄露检测）
        if v not in ('正确', '错误', '对', '错', ''):
            opts[letter] = v.replace('\n', ' ').replace('\r', '')
    return opts if opts else None


def explain_to_answer(explanation: str, opts: dict | None) -> str:
    """从逐项分析中提取正确答案"""
    ans = []
    for letter in sorted(opts.keys() if opts else []):
        # 匹配 "A. 正确" 或 "A．正确"
        if re.search(f'{letter}[.．、]\\s*正确', explanation):
            ans.append(letter)
    return ''.join(ans)
