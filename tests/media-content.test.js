const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getQuestionSearchText,
  renderContentBlocks,
  sanitizeMediaSrc,
} = require('../src/core.js');

test('media source only accepts repository-local image paths', () => {
  assert.equal(
    sanitizeMediaSrc('data/media/xingce/mock/q001/stem-01.png'),
    'data/media/xingce/mock/q001/stem-01.png'
  );
  assert.equal(sanitizeMediaSrc('https://example.com/tracker.png'), '');
  assert.equal(sanitizeMediaSrc('javascript:alert(1)'), '');
  assert.equal(sanitizeMediaSrc('data/media/../行政法.json'), '');
  assert.equal(sanitizeMediaSrc('data/行测.json'), '');
});

test('content renderer escapes text and renders safe image metadata', () => {
  const html = renderContentBlocks([
    { type: 'text', text: '<img src=x onerror=alert(1)>' },
    {
      type: 'image',
      src: 'data/media/xingce/mock/q001/stem-01.png',
      alt: '题干“图形”',
      caption: '观察图形变化',
    },
  ]);

  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /data\/media\/xingce\/mock\/q001\/stem-01\.png/);
  assert.doesNotMatch(html, /<img src=x onerror=alert\(1\)>/);
  assert.match(html, /观察图形变化/);
});

test('invalid image blocks render a visible error without using the URL', () => {
  const html = renderContentBlocks([
    { type: 'image', src: 'https://evil.example/image.png', alt: '非法图片' },
  ]);
  assert.match(html, /图片路径无效/);
  assert.doesNotMatch(html, /evil\.example/);
});

test('question search includes block text, image alt text, and option blocks', () => {
  const question = {
    question: '选择正确选项',
    questionContent: [
      { type: 'text', text: '观察下列图形' },
      { type: 'image', src: 'data/media/xingce/q1.png', alt: '黑白几何图形序列' },
    ],
    options: { A: '', B: '' },
    optionContent: {
      A: [{ type: 'image', src: 'data/media/xingce/a.png', alt: '选项A三角形' }],
    },
    explanation: '位置依次变化',
    tags: ['图形推理'],
  };

  const text = getQuestionSearchText(question);
  assert.match(text, /黑白几何图形序列/);
  assert.match(text, /选项A三角形/);
  assert.match(text, /位置依次变化/);
});

test('legacy questions remain renderable without content blocks', () => {
  const html = renderContentBlocks(null, '第一行\n第二行');
  assert.match(html, /第一行<br>第二行/);
});
