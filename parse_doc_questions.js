// 解析从 .doc 转换出的 extracted_text.txt
// 格式特点：题号、选项、答案均跨行拆分
const fs = require('fs');

const raw = fs.readFileSync('D:/Claude/projects/study-hub/temp_doc/extracted_text.txt', 'utf8');
let lines = raw.split(/\r?\n/).map(l => l.trim());

// ========== 第1步：预处理，合并跨行标记 ==========

function preprocess(lines) {
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 合并 "二" + "、" + "多项选择题"（3行）
    if (/^[一二三四五]$/.test(line) && i + 2 < lines.length && lines[i + 1] === '、') {
      const next2 = lines[i + 2];
      if (/^(单项选择题|多项选择题|判断题|辨析题|简答题|简要回答题)/.test(next2)) {
        result.push(line + '、' + next2);
        i += 2;
        continue;
      }
    }

    // 合并 "二、" + "多项选择题"（2行）
    if (/^[一二三四五]、$/.test(line) && i + 1 < lines.length) {
      const next = lines[i + 1];
      if (/^(单项选择题|多项选择题|判断题|辨析题|简答题|简要回答题)/.test(next)) {
        result.push(line + next);
        i++;
        continue;
      }
    }

    // 合并 "四" + "、辨析题"（2行）
    if (/^[一二三四五]$/.test(line) && i + 1 < lines.length) {
      const next = lines[i + 1];
      if (/^、\s*(单项选择题|多项选择题|判断题|辨析题|简答题|简要回答题)/.test(next)) {
        result.push(line + next);
        i++;
        continue;
      }
    }

    // 合并 "[" + "参考答案" + "]"（3行，第七章判断题）
    if (line === '[' && i + 2 < lines.length && lines[i + 1] === '参考答案' && lines[i + 2] === ']') {
      result.push('[参考答案]');
      i += 2;
      continue;
    }

    result.push(line);
  }
  return result;
}

lines = preprocess(lines);

// ========== 第2步：分段 ==========

const typeMarkers = [
  { type: 'single', re: /^一[、.．]\s*单项选择题/ },
  { type: 'multiple', re: /^二[、.．]\s*多项选择题/ },
  { type: 'judge', re: /^三[、.．]\s*判断题/ },
  { type: 'analyze', re: /^四[、.．]\s*辨析题/ },
  { type: 'short', re: /^五[、.．]\s*简(?:要回答)?答题?/ },
];

const answerMarkers = [
  { type: 'single', re: /^[【［\[]单项选择题答案[】］\]]$/ },
  { type: 'multiple', re: /^[【［〔\[]多项选择题答案[】］〕\]]$/ },
  { type: 'judge', re: /^[【［\[]判断题答案[】］\]]$/ },
  { type: 'judge', re: /^\[参考答案\]$/ },
];

let currentChapter = '导论';
let currentType = null;
let currentMode = null;
let currentLines = [];
const segments = [];

function flush() {
  if (currentType && currentLines.length > 0) {
    segments.push({
      chapter: currentChapter,
      type: currentType,
      mode: currentMode,
      lines: currentLines.filter(l => l !== '')
    });
  }
  currentLines = [];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (/^第[一二三四五六七八九十]+章/.test(line)) {
    flush();
    currentChapter = line;
    currentType = null;
    currentMode = null;
    continue;
  }

  if (line === '导论') {
    flush();
    currentChapter = '导论';
    currentType = null;
    currentMode = null;
    continue;
  }

  let matched = false;
  for (const marker of typeMarkers) {
    if (marker.re.test(line)) {
      flush();
      currentType = marker.type;
      currentMode = 'questions';
      matched = true;
      break;
    }
  }
  if (matched) continue;

  for (const marker of answerMarkers) {
    if (marker.re.test(line)) {
      flush();
      currentType = marker.type;
      currentMode = 'answers';
      matched = true;
      break;
    }
  }
  if (matched) continue;

  // "单项选择题" + "答案："
  if ((line === '单项选择题' || line === '多项选择题') && i + 1 < lines.length && /^答案[：:]/.test(lines[i + 1])) {
    flush();
    currentType = line === '单项选择题' ? 'single' : 'multiple';
    currentMode = 'answers';
    i++;
    continue;
  }

  if (/^辨析题答案[：:]/.test(line)) {
    flush();
    currentType = 'analyze';
    currentMode = 'answers';
    continue;
  }

  if (/^马克思主义基本原理/.test(line) && /复习题/.test(line)) continue;
  if (/^（附答案）/.test(line) || /^\(附答案\)/.test(line)) continue;

  if (/^\d+$/.test(line) && currentType === null) continue;

  if (currentType) {
    currentLines.push(line);
  }
}
flush();

// ========== 第3步：判断题题目段中检测无标记的答案区域 ==========

// 第六章判断题没有答案标记，答案直接跟在题目后面
// 特征：在判断题题目段中，出现 "√" 或 "×" 单独成行，说明答案开始了
function splitJudgeAnswers(segLines) {
  // 从后往前找第一个 "√" 或 "×" 行
  // 答案区域：连续的 "数字." + "√/×" 模式
  let answerStart = -1;
  for (let i = 0; i < segLines.length; i++) {
    const line = segLines[i];
    // "√" 或 "×" 单独成行（或 "×" 后跟文字）
    if (/^[√×]/.test(line)) {
      // 检查前面是否有 "数字." 行
      if (i > 0) {
        const prev = segLines[i - 1];
        if (/^\d+[.、．]?$/.test(prev) || /^\d+$/.test(prev)) {
          // 找到答案区域开始（回溯到数字行）
          answerStart = i - 1;
          break;
        }
      }
    }
  }

  if (answerStart > 0) {
    return {
      qLines: segLines.slice(0, answerStart),
      aLines: segLines.slice(answerStart)
    };
  }
  return { qLines: segLines, aLines: [] };
}

// 修正判断题段：将无标记的答案区域分离出来
const fixedSegments = [];
for (const seg of segments) {
  if (seg.type === 'judge' && seg.mode === 'questions') {
    const { qLines, aLines } = splitJudgeAnswers(seg.lines);
    fixedSegments.push({ chapter: seg.chapter, type: seg.type, mode: 'questions', lines: qLines });
    if (aLines.length > 0) {
      fixedSegments.push({ chapter: seg.chapter, type: seg.type, mode: 'answers', lines: aLines });
    }
  } else {
    fixedSegments.push(seg);
  }
}

// 替换 segments
segments.length = 0;
segments.push(...fixedSegments);

// ========== 第4步：解析答案 ==========

function parseAnswersForType(segLines, qtype) {
  const text = segLines.join('');
  const answers = {};
  const re = /(\d+)\s*[.、．]?\s*([A-E]+|√|×)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const num = parseInt(m[1]);
    let ans = m[2];
    if (num > 0 && num <= 30) {
      if (qtype === 'multiple' && /[A-E]/.test(ans)) {
        ans = ans.split('').sort().join('');
      }
      answers[num] = ans;
    }
  }
  return answers;
}

// ========== 第5步：解析题目 ==========

function parseQuestions(segLines, qtype) {
  // 过滤噪声行（单独的 "0"）
  const filtered = segLines.filter(l => l !== '0');

  // 找到所有题号位置
  const positions = [];
  let i = 0;
  while (i < filtered.length) {
    const line = filtered[i];

    // 纯数字行
    if (/^\d+$/.test(line)) {
      const num = parseInt(line);
      if (num >= 1 && num <= 30) {
        // 判断题：纯数字行后如果是另一个 "数字." 行，不是题号（噪声）
        if (qtype === 'judge' && i + 1 < filtered.length && /^\d+[.、．]/.test(filtered[i + 1])) {
          i++;
          continue;
        }

        // 先检查是否跨行：下一行也是单数字
        if (i + 1 < filtered.length && /^\d$/.test(filtered[i + 1])) {
          const d1 = num;
          const d2 = parseInt(filtered[i + 1]);
          if (d1 >= 1 && d1 <= 3 && d2 >= 0 && d2 <= 9) {
            const combined = d1 * 10 + d2;
            if (combined >= 10 && combined <= 30) {
              // 检查第三行是否以标点开头
              if (i + 2 < filtered.length) {
                const third = filtered[i + 2];
                if (/^[、．.]/.test(third) || (qtype === 'judge' && !/^[A-E]/.test(third) && !/^\d/.test(third))) {
                  // 提取第三行的题干内容（如果有）
                  const prefix = /^[、．.]/.test(third) ? third.replace(/^[、．.]\s*/, '') : '';
                  positions.push({ num: combined, startIdx: i, endIdx: i + 2, prefix });
                  i += 3;
                  continue;
                }
              }
            }
          }
        }

        // 非跨行：检查下一行是否以标点开头
        if (i + 1 < filtered.length) {
          const next = filtered[i + 1];
          if (/^[、．.]/.test(next)) {
            // 提取标点行的题干内容（如果有）
            const prefix = next.replace(/^[、．.]\s*/, '');
            positions.push({ num, startIdx: i, endIdx: i + 1, prefix });
            i += 2;
            continue;
          }
          // 判断题可能没有标点
          if (qtype === 'judge' && !/^[A-E]$/.test(next) && !/^\d+$/.test(next) && !/^[√×]/.test(next)) {
            positions.push({ num, startIdx: i, endIdx: i, prefix: '' });
            i += 1;
            continue;
          }
        }
      }
    }

    // "数字." "数字、" "数字．" 开头
    const m = /^(\d+)[、．.]\s*(.*)$/.exec(line);
    if (m) {
      const num = parseInt(m[1]);
      if (num >= 1 && num <= 30) {
        positions.push({ num, startIdx: i, endIdx: i, prefix: m[2] || '' });
        i += 1;
        continue;
      }
    }

    i++;
  }

  // 按题号分割，提取每个题目
  const questions = [];
  for (let p = 0; p < positions.length; p++) {
    const pos = positions[p];
    const nextPos = p + 1 < positions.length ? positions[p + 1] : null;
    const startContent = pos.endIdx + 1;
    const endContent = nextPos ? nextPos.startIdx : filtered.length;
    const contentLines = filtered.slice(startContent, endContent);

    let questionText = pos.prefix || '';
    let options = {};
    let currentOption = null;

    for (let j = 0; j < contentLines.length; j++) {
      const cl = contentLines[j];

      // 选项标记：单字母 A-E
      if (/^[A-E]$/.test(cl)) {
        // 确认是选项：下一行是标点或内容
        if (j + 1 < contentLines.length) {
          const nextCl = contentLines[j + 1];
          if (/^[、．.]/.test(nextCl) || nextCl.length > 1) {
            currentOption = cl;
            if (!(cl in options)) options[cl] = '';
            // 下一行以标点开头
            if (/^[、．.]/.test(nextCl)) {
              if (nextCl.length === 1) {
                // 标点单独一行，跳过
                j++;
                continue;
              } else {
                options[cl] += nextCl.replace(/^[、．.]\s*/, '');
                j++;
                continue;
              }
            }
            continue;
          }
        }
        // 不能确认是选项，当作普通文本
        if (currentOption) {
          options[currentOption] = (options[currentOption] || '') + cl;
        } else {
          questionText += cl;
        }
        continue;
      }

      // 选项标记：A. A、 A． 后跟内容
      const optMatch = /^([A-E])[、．.]\s*(.*)$/.exec(cl);
      if (optMatch) {
        currentOption = optMatch[1];
        if (!(currentOption in options)) options[currentOption] = '';
        if (optMatch[2]) options[currentOption] += optMatch[2];
        continue;
      }

      // 其他行
      if (currentOption) {
        if (options[currentOption]) options[currentOption] += cl;
        else options[currentOption] = cl;
      } else {
        questionText += cl;
      }
    }

    // 清理题干：去掉末尾的括号和噪声数字
    questionText = questionText.trim()
      .replace(/[（(]\s*[)）]\s*\d+$/, '')  // "（）1" → ""
      .replace(/[\(（]\s*[\)）]\s*$/, '')   // "（）" → ""
      .trim();

    questions.push({
      num: pos.num,
      question: questionText,
      options: Object.keys(options).length > 0 ? options : null
    });
  }

  return questions;
}

// ========== 第6步：合并解析 ==========

const allQuestions = [];

// 按章节和题型分组
const grouped = {};
segments.forEach(s => {
  const key = `${s.chapter}||${s.type}`;
  if (!grouped[key]) grouped[key] = { chapter: s.chapter, type: s.type, qSegs: [], aSegs: [] };
  if (s.mode === 'questions') grouped[key].qSegs.push(s.lines);
  else grouped[key].aSegs.push(s.lines);
});

console.log('\n=== 分组结果 ===');
Object.keys(grouped).sort().forEach(k => {
  const g = grouped[k];
  if (g.type === 'analyze' || g.type === 'short') return;
  console.log(`  ${g.chapter} | ${g.type}: ${g.qSegs.length} 个题目段, ${g.aSegs.length} 个答案段`);
});

Object.keys(grouped).sort().forEach(k => {
  const g = grouped[k];
  if (g.type === 'analyze' || g.type === 'short') return;

  const qLines = g.qSegs.flat();
  const aLines = g.aSegs.flat();

  const questions = parseQuestions(qLines, g.type);
  const answers = parseAnswersForType(aLines, g.type);

  console.log(`\n--- ${g.chapter} | ${g.type} ---`);
  console.log(`  解析出 ${questions.length} 道题目, ${Object.keys(answers).length} 个答案`);

  questions.forEach(q => {
    const ans = answers[q.num];
    if (ans) {
      allQuestions.push({
        chapter: g.chapter,
        type: g.type,
        num: q.num,
        question: q.question,
        options: q.options,
        answer: ans
      });
    } else {
      console.log(`  [警告] 题 ${q.num} 无答案: ${q.question.substring(0, 40)}...`);
    }
  });
});

console.log('\n=== 总计 ===');
console.log('有效题目数:', allQuestions.length);
const byType = {};
allQuestions.forEach(q => { byType[q.type] = (byType[q.type] || 0) + 1; });
console.log('题型分布:', byType);

const byChapter = {};
allQuestions.forEach(q => { byChapter[q.chapter] = (byChapter[q.chapter] || 0) + 1; });
console.log('章节分布:');
Object.keys(byChapter).sort().forEach(c => console.log(`  ${c}: ${byChapter[c]} 题`));

// 预览
console.log('\n=== 预览前3题 ===');
allQuestions.slice(0, 3).forEach(q => {
  console.log(`  [${q.chapter}] ${q.type} #${q.num}: ${q.question.substring(0, 50)}`);
  console.log(`    答案: ${q.answer}`);
  if (q.options) {
    Object.keys(q.options).forEach(k => {
      console.log(`    ${k}: ${q.options[k].substring(0, 40)}`);
    });
  }
});

// 保存
fs.writeFileSync('D:/Claude/projects/study-hub/temp_doc/parsed_questions.json', JSON.stringify(allQuestions, null, 2));
console.log('\n已保存到 temp_doc/parsed_questions.json');
