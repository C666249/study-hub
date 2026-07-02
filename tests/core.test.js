// study-hub core logic tests
// Run: node tests/core.test.js
const assert = require('assert');
const { isAnswerCorrect, searchQuestions, getQuestionsByTag, getKnowledgePointStats, shuffleArray } = require('../src/core.js');

// Sample question data for tests
const sampleQuestions = [
  { id: 'q1', type: 'single', tags: ['危害行为'], question: '不作为犯罪的构成要件？', options: { A: '有义务', B: '无义务', C: '均可', D: '视情况' }, answer: 'A', explanation: '不作为须有作为义务' },
  { id: 'q2', type: 'judge', tags: ['危害行为'], question: '不作为只能是故意犯罪。', options: null, answer: '错', explanation: '不作为可以是过失' },
  { id: 'q3', type: 'multiple', tags: ['因果关系'], question: '因果关系的特点包括？', options: { A: '客观性', B: '相对性', C: '主观性', D: '时间顺序性' }, answer: 'ABD', explanation: '因果关系是客观的' },
  { id: 'q4', type: 'single', tags: ['犯罪主体'], question: '单位犯罪的主体是？', options: { A: '自然人', B: '单位', C: '国家', D: '以上都是' }, answer: 'B', explanation: '单位犯罪主体是单位本身' },
];

// --- Test 1: isAnswerCorrect ---
console.log('TEST 1: isAnswerCorrect');

// Single choice - correct
assert.strictEqual(
  isAnswerCorrect('A', sampleQuestions[0].answer, 'single'),
  true,
  'single choice correct answer should return true'
);

// Single choice - wrong
assert.strictEqual(
  isAnswerCorrect('B', sampleQuestions[0].answer, 'single'),
  false,
  'single choice wrong answer should return false'
);

// Judge - correct
assert.strictEqual(
  isAnswerCorrect('错', sampleQuestions[1].answer, 'judge'),
  true,
  'judge correct answer should return true'
);

// Judge - wrong
assert.strictEqual(
  isAnswerCorrect('对', sampleQuestions[1].answer, 'judge'),
  false,
  'judge wrong answer should return false'
);

// Multiple - correct (order independent)
assert.strictEqual(
  isAnswerCorrect('BDA', sampleQuestions[2].answer, 'multiple'),
  true,
  'multiple choice correct (any order) should return true'
);

// Multiple - wrong
assert.strictEqual(
  isAnswerCorrect('AB', sampleQuestions[2].answer, 'multiple'),
  false,
  'multiple choice incomplete should return false'
);

console.log('  PASS');

// --- Test 2: searchQuestions ---
console.log('TEST 2: searchQuestions');

// Search by question text
let results = searchQuestions('不作为', sampleQuestions);
assert.strictEqual(results.length, 2, 'should find 2 questions with 不作为 in question text');

// Search by explanation
results = searchQuestions('过失', sampleQuestions);
assert.strictEqual(results.length, 1, 'should find 1 question with 过失 in explanation');

// Search by tag
results = searchQuestions('因果关系', sampleQuestions);
assert.strictEqual(results.length, 1, 'should find 1 question with 因果关系 tag');

// Search by option value
results = searchQuestions('自然人', sampleQuestions);
assert.strictEqual(results.length, 1, 'should find question with 自然人 in options');

// Empty query returns all
results = searchQuestions('', sampleQuestions);
assert.strictEqual(results.length, sampleQuestions.length, 'empty query should return all');

// No match
results = searchQuestions('zzz_nonexistent', sampleQuestions);
assert.strictEqual(results.length, 0, 'no match should return empty');

// Case insensitive (Chinese chars are already case-insensitive, but test anyway)
results = searchQuestions('不作为犯罪', sampleQuestions);
assert.strictEqual(results.length, 1, 'should match longer phrase');

console.log('  PASS');

// --- Test 3: getQuestionsByTag ---
console.log('TEST 3: getQuestionsByTag');

results = getQuestionsByTag('危害行为', sampleQuestions);
assert.strictEqual(results.length, 2, '危害行为 tag should find 2 questions');

results = getQuestionsByTag('犯罪主体', sampleQuestions);
assert.strictEqual(results.length, 1, '犯罪主体 tag should find 1 question');

results = getQuestionsByTag('不存在', sampleQuestions);
assert.strictEqual(results.length, 0, 'nonexistent tag should return empty');

console.log('  PASS');

// --- Test 4: getKnowledgePointStats ---
console.log('TEST 4: getKnowledgePointStats');

const stats = getKnowledgePointStats(sampleQuestions);
assert.strictEqual(stats['危害行为'], 2, '危害行为 should have 2 questions');
assert.strictEqual(stats['因果关系'], 1, '因果关系 should have 1 question');
assert.strictEqual(stats['犯罪主体'], 1, '犯罪主体 should have 1 question');

console.log('  PASS');

// --- Test 5: shuffleArray ---
console.log('TEST 5: shuffleArray');

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = shuffleArray(arr);
// Should not mutate original
assert.deepStrictEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'original array should not be mutated');
// Should have same length
assert.strictEqual(shuffled.length, arr.length, 'shuffled array should have same length');
// Should contain same elements
assert.deepStrictEqual(shuffled.sort((a, b) => a - b), arr, 'shuffled array should contain same elements');
// With 10 elements, probability of same order is 1/10! ≈ 0 — but check anyway
// (technically could fail by chance, but 1 in 3.6 million chance)

console.log('  PASS');

// --- Edge Cases ---
console.log('TEST 6: Edge cases');

// isAnswerCorrect with null/undefined
assert.strictEqual(isAnswerCorrect(null, 'A', 'single'), false, 'null userAnswer returns false');
assert.strictEqual(isAnswerCorrect('A', null, 'single'), false, 'null correctAnswer returns false');
assert.strictEqual(isAnswerCorrect(undefined, 'A', 'single'), false, 'undefined returns false');

// searchQuestions with null query
assert.deepStrictEqual(searchQuestions(null, sampleQuestions), sampleQuestions, 'null query returns all');
assert.deepStrictEqual(searchQuestions('  ', sampleQuestions), sampleQuestions, 'whitespace query returns all');

// getQuestionsByTag with null tag
assert.deepStrictEqual(getQuestionsByTag(null, sampleQuestions), sampleQuestions, 'null tag returns all');

// getKnowledgePointStats with empty array
assert.deepStrictEqual(getKnowledgePointStats([]), {}, 'empty array returns empty object');

// shuffleArray with single element
assert.deepStrictEqual(shuffleArray([42]), [42], 'single element shuffle returns same');
// shuffleArray with empty array
assert.deepStrictEqual(shuffleArray([]), [], 'empty array shuffle returns empty');

console.log('  PASS');

console.log('\n✅ ALL CORE LOGIC TESTS PASSED');
