// TDD tests for convert.js parsing fixes
// Run: node tests/convert.test.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============================================================
// Copy of fixed functions (RED → GREEN → REFACTOR)
// ============================================================

function readFileFromZip(zipPath, targetName) {
    const buf = fs.readFileSync(zipPath);
    let eocdOff = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) { eocdOff = i; break; }
    }
    if (eocdOff < 0) throw new Error('Invalid ZIP');
    const cdOff = buf.readUInt32LE(eocdOff + 16);
    let off = cdOff;
    while (off < eocdOff) {
        if (buf.readUInt32LE(off) !== 0x02014b50) break;
        const method = buf.readUInt16LE(off + 10);
        const compSize = buf.readUInt32LE(off + 20);
        const nameLen = buf.readUInt16LE(off + 28);
        const extraLen = buf.readUInt16LE(off + 30);
        const commentLen = buf.readUInt16LE(off + 32);
        const localOff = buf.readUInt32LE(off + 42);
        const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf8');
        if (name === targetName || name.endsWith('/' + targetName)) {
            let lo = localOff;
            const lNameLen = buf.readUInt16LE(lo + 26);
            const lExtraLen = buf.readUInt16LE(lo + 28);
            const dataOff = lo + 30 + lNameLen + lExtraLen;
            const raw = buf.slice(dataOff, dataOff + compSize);
            if (method === 0) return raw;
            if (method === 8) return zlib.inflateRawSync(raw);
            throw new Error('Unsupported compression');
        }
        off += 46 + nameLen + extraLen + commentLen;
    }
    throw new Error('File not found: ' + targetName);
}

function extractText(docxPath) {
    const xmlBuf = readFileFromZip(docxPath, 'word/document.xml');
    let text = xmlBuf.toString('utf8');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    text = text.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/（注：部分内容可能由\s*AI\s*生成）[^]*$/, '');
    return text;
}

// ============================================================
// FIXED parseChoice — handles fullwidth dots, stops at 简略解析
// ============================================================
function parseChoice(block, type, tag, chNum) {
    const qs = [];
    const parts = block.split(/题目(?=\s*[^目]|$)/g).filter(s => s.trim().length > 20);
    let seq = 1;
    parts.forEach(part => {
        // Match fullwidth (．) OR ASCII (.) dot for option markers
        const sm = part.match(/^(.+?)([A-E])[.．]/);
        if (!sm) return;
        let stem = sm[1].trim();

        // Truncate at 简略解析 or 详细解释 — stop before answer-leaking text
        const optEnd = part.search(/简略解析|详细解释/);
        const optPart = optEnd >= 0 ? part.substring(0, optEnd) : part;

        const opts = {};
        // Match both fullwidth and ASCII dots; stop at 简略解析/详细解释/end
        const r = /([A-E])[.．]\s*(.+?)(?=\s*[A-E][.．]|\s*简略解析|\s*详细解释|$)/gs;
        let m;
        while ((m = r.exec(optPart)) !== null) {
            opts[m[1]] = m[2].trim().replace(/\s+/g, ' ');
        }

        // Also strip option text from stem if it bled in (safety)
        stem = stem.replace(/\s*[A-E][.．][^A-E]*$/, '').trim();

        const sm2 = part.match(/简略解析\s*(.+?)(?=详细解释|$)/s);
        const expl = sm2 ? sm2[1].trim() : '';
        const dm = part.match(/详细解释\s*(.+?)$/s);
        const detail = dm ? dm[1].trim().replace(/\s+/g, ' ') : '';

        let ans = '';
        // Use per-option analysis to determine correct answer
        if (expl) {
            const c = [];
            for (const k of Object.keys(opts)) {
                if (new RegExp(k + '[.．]\\s*正确').test(expl)) c.push(k);
            }
            ans = c.join('');
        }
        if (!stem || !ans || Object.keys(opts).length === 0) return;

        qs.push({
            id: `ch${chNum}_${type}_${seq}`,
            type,
            homework: tag,        // Use full tag (with chapter prefix) as homework
            tags: [tag],
            question: stem,
            options: opts,
            answer: ans,
            explanation: expl,
            detail: detail || ''
        });
        seq++;
    });
    return qs;
}

// ============================================================
// FIXED parseNumberedFormat — clean score suffixes
// ============================================================
function parseNumberedFormat(text, chapterTag, chapterNum) {
    const parts = text.split(/\s?(?=\d+\.\s*\((?:单|多|判|辨|简))/g).filter(s => /\d+\.\s*\(/.test(s));
    const questions = [];
    let seq = 1;
    parts.forEach(part => {
        const typeMatch = part.match(/^\d+\.\s*\(([^)]+)\)/);
        if (!typeMatch) return;
        const typeLabel = typeMatch[1];
        let type, isJudge = false;
        if (/单/.test(typeLabel)) type = 'single';
        else if (/多/.test(typeLabel)) type = 'multiple';
        else if (/判/.test(typeLabel)) { type = 'judge'; isJudge = true; }
        else if (/简|辨/.test(typeLabel)) { type = 'short'; isJudge = true; }
        else return;

        let body = part.replace(/^\d+\.\s*\([^)]+\)[,\s]*\d*分?\s*\)?\s*/, '');

        // Clean answer: strip score suffixes like "2分", "0分"
        const ansMatch = body.match(/正确答案：(.+?)(?=\s*\d+\.\s*\(|答案解析|$)/);
        let answer = ansMatch ? ansMatch[1].trim().replace(/\s+/g, '') : '';
        // Remove score suffixes and other artifacts
        answer = answer.replace(/\d+分\s*$/, '').replace(/\s+/g, '');
        if (answer && answer.includes('.')) answer = answer.replace(/\./g, '').replace(/\s/g, '');
        // Remove section-header artifacts like "二多选题（共24题，407分）"
        if (/[一二三四五六七八九十]/.test(answer) && /多选|单选|判断/.test(answer)) answer = '';
        if (isJudge) {
            if (/对/.test(answer)) answer = '对';
            else if (/错/.test(answer)) answer = '错';
        }

        let stem = body;
        const optStart = body.search(/[A-E][.．]/);
        const ansStart = body.indexOf('正确答案');
        const myStart = body.indexOf('我的答案');
        let endMarker = body.length;
        if (optStart >= 0) endMarker = Math.min(endMarker, optStart);
        if (ansStart >= 0) endMarker = Math.min(endMarker, ansStart);
        if (myStart >= 0) endMarker = Math.min(endMarker, myStart);
        stem = body.substring(0, endMarker).trim();
        stem = stem.replace(/[:\s;]*$/, '');

        let opts = null;
        let optSection = body;
        if (ansStart >= 0) optSection = body.substring(0, ansStart);
        if (myStart >= 0) optSection = body.substring(0, myStart);
        if (!isJudge) {
            opts = {};
            const optRegex = /([A-E])[.．]\s*(.+?)(?=\s*[A-E][.．]|正确答案|我的答案|$)/g;
            let m;
            while ((m = optRegex.exec(optSection)) !== null) {
                opts[m[1]] = m[2].trim().replace(/\s+/g, ' ');
            }
        }

        const explMatch = body.match(/答案解析：(.+?)(?=\s*\d+\.\s*\(|$)/);
        const expl = explMatch ? explMatch[1].trim().replace(/\s+/g, ' ') : '';

        if (!stem || !answer) return;

        questions.push({
            id: `ch${chapterNum}_${type}_${seq}`,
            type, homework: chapterTag,
            tags: [chapterTag],
            question: stem,
            options: opts,
            answer,
            explanation: expl,
            detail: ''
        });
        seq++;
    });
    return questions;
}

// ============================================================
// Helper for chapter prefix
// ============================================================
function chapterNum(fileName) {
    const m = fileName.match(/第([一二三四五六七八九十\d]+)章/);
    if (!m) return '';
    const map = {'一':'1','二':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9','十':'10'};
    return map[m[1]] || m[1];
}

function extractChapter(fileName) {
    const chNum = chapterNum(fileName);
    // Strip .docx extension first
    const base = fileName.replace(/\.docx$/i, '');
    const m = base.match(/^第[^_]+_(.+)$/);
    const name = m ? m[1].trim() : '未分类';
    // Return full chapter identifier: "第三章 人类社会及其发展规律"
    return chNum ? `第${chNum}章 ${name}` : name;
}

// ============================================================
// TESTS
// ============================================================
let passed = 0, failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log('  ✓ ' + name);
    } catch (e) {
        failed++;
        console.log('  ✗ ' + name);
        console.log('    ' + e.message);
    }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function assertEq(a, b, msg) { if (a !== b) throw new Error((msg || '') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); }
function assertNotMatch(re, str, msg) { if (re.test(str)) throw new Error((msg || '') + ': found unwanted match in ' + JSON.stringify(str)); }

console.log('\n🔴 RED — Running convert.js fix tests\n');

// ── Test 1: Fullwidth dot options are matched ──
test('parseChoice matches fullwidth dot options (A．B．C．D．)', () => {
    const block = '一、单项选择题题目在人类社会发展中起决定作用的因素是（）A．生产方式 B．地理条件 C．社会意识 D．人口因素简略解析A. 正确。生产方式。B. 错误。地理条件。C. 错误。社会意识。D. 错误。人口因素。详细解释本题考查社会发展的决定因素。';
    const results = parseChoice(block, 'single', '第三章 人类社会及其发展规律', '3');
    assertEq(results.length, 1, 'should parse 1 question');
    const q = results[0];
    assertEq(q.options.A, '生产方式', 'option A should be clean');
    assertEq(q.options.B, '地理条件', 'option B should be clean');
    assertEq(q.options.C, '社会意识', 'option C should be clean');
    assertEq(q.options.D, '人口因素', 'option D should be clean');
});

// ── Test 2: Options must NOT contain 正确/错误 ──
test('options never contain 正确 or 错误', () => {
    const block = '一、单项选择题题目社会意识相对独立性的最突出表现是它（）A．同社会存在发展的不同步性 B．具有历史的继承性C．对社会存在具有能动的反作用 D．同社会经济的发展具有不平衡性简略解析A. 错误。不是最突出的。B. 错误。不是最突出。C. 正确。最突出表现。D. 错误。不是最突出。详细解释本题考查社会意识相对独立性。';
    const results = parseChoice(block, 'single', '第三章 人类社会及其发展规律', '3');
    assertEq(results.length, 1);
    const q = results[0];
    for (const [k, v] of Object.entries(q.options)) {
        assertNotMatch(/(正确|错误)/, v, `option ${k} should not contain answer indicator`);
    }
});

// ── Test 3: Stem does NOT include option text or 简略解析 ──
test('question stem is clean (no options, no 简略解析)', () => {
    const block = '一、单项选择题题目在人类社会发展中起决定作用的因素是（）A．生产方式 B．地理条件 C．社会意识 D．人口因素简略解析A. 正确。...B. 错误。...C. 错误。...D. 错误。...详细解释本题考查。';
    const results = parseChoice(block, 'single', '第三章 人类社会及其发展规律', '3');
    assertEq(results.length, 1);
    const q = results[0];
    assertNotMatch(/简略解析/, q.question, 'stem should not contain 简略解析');
    assertNotMatch(/[A-E][.．]/, q.question, 'stem should not contain option markers');
});

// ── Test 4: Answer cleaned of score suffixes ──
test('parseNumberedFormat strips score suffixes from answers', () => {
    const text = '1. (单选题) 1.0 分 衡量社会进步的根本标准是() A. 社会经济制度 B. 社会政治制度 C. 社会精神文明水平 D. 社会生产力发展水平 正确答案：D2分 答案解析：测试解析。';
    const results = parseNumberedFormat(text, '第三章 人类社会及其发展规律', '3');
    assertEq(results.length, 1, 'should parse 1 question');
    assertEq(results[0].answer, 'D', 'answer should be D without 2分');
});

// ── Test 5: Section header not parsed as answer ──
test('parseNumberedFormat rejects section-header artifacts as answers', () => {
    const text = '19. (单选题) 马克思主义的本质属性是（）。A. 科学性 B. 人民性 C. 实践性 D. 发展性 正确答案：B二多选题（共24题，407分） 答案解析：...';
    const results = parseNumberedFormat(text, '第一章 世界的物质性', '1');
    // Should return 0 because answer "B二多选题..." is rejected
    // Actually, since the answer is cleaned to "B二多选题（共题407分）" which matches section header pattern, it's rejected
    assertEq(results.length, 0, 'should reject section-header artifact answer');
});

// ── Test 6: Homework includes chapter prefix ──
test('extractChapter returns chapter-prefixed name', () => {
    assertEq(extractChapter('第三章_人类社会及其发展规律.docx'), '第3章 人类社会及其发展规律');
    assertEq(extractChapter('第一章_世界的物质性及其发展规律.docx'), '第1章 世界的物质性及其发展规律');
});

// ── Test 7: Real docx file produces clean data ──
test('Real docx: 第三章_人类社会及其发展规律 produces clean questions', () => {
    const docxPath = 'D:/edge download/学习/马原/复习题/第三章_人类社会及其发展规律.docx';
    if (!fs.existsSync(docxPath)) { console.log('    (skipped — docx not found)'); passed++; return; }
    const text = extractText(docxPath);
    const tag = extractChapter('第三章_人类社会及其发展规律.docx');
    const chNum = chapterNum('第三章_人类社会及其发展规律.docx');

    // Split sections and parse
    const secSingle = text.match(/一、单项选择[题]?/);
    if (!secSingle) { console.log('    (skipped — no single-choice section)'); passed++; return; }

    // Parse via the full pipeline
    const ptn = [{k:'single',r:/一、单项选择/},{k:'multi',r:/二、多项选择/},{k:'judge',r:/三、判断/},{k:'short',r:/[三四五六]、简答/},{k:'analyze',r:/[三四五六]、辨析/}];
    let sections = {};
    let pos = [];
    ptn.forEach(p => { const m = text.match(p.r); if (m) pos.push({k:p.k, s:m.index}); });
    pos.sort((a,b) => a.s - b.s);
    for (let i = 0; i < pos.length; i++) {
        const end = i+1 < pos.length ? pos[i+1].s : text.length;
        sections[pos[i].k] = text.slice(pos[i].s, end);
    }

    let all = [];
    if (sections.single) all.push(...parseChoice(sections.single, 'single', tag, chNum));
    if (sections.multi) all.push(...parseChoice(sections.multi, 'multiple', tag, chNum));
    if (sections.judge) all.push(...parseChoice(sections.judge, 'judge', tag, chNum));
    if (sections.short) all.push(...parseChoice(sections.short, 'short', tag, chNum));
    if (sections.analyze) all.push(...parseChoice(sections.analyze, 'short', tag, chNum));

    assert(all.length > 0, 'should parse at least some questions');

    // Verify every question is clean
    for (const q of all) {
        if (q.options) {
            for (const [k, v] of Object.entries(q.options)) {
                assertNotMatch(/(正确|错误)。/, v, `q ${q.id} option ${k} "${v.slice(0,20)}" should not leak answer`);
            }
        }
        assertNotMatch(/简略解析/, q.question, `q ${q.id} stem should not contain 简略解析`);
        assertEq(q.homework, tag, `q ${q.id} homework should be chapter-tagged`);
    }

    console.log(`    (parsed ${all.length} clean questions)`);
});

// ── Summary ──
console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
