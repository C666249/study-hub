const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

test('every inline script in index.html parses', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1].trim())
    .filter(Boolean);
  assert.ok(scripts.length > 0);
  scripts.forEach(script => assert.doesNotThrow(() => new Function(script)));
});

test('quiz renderer uses structured content instead of raw question HTML', () => {
  assert.match(html, /renderContentBlocks\(q\.questionContent/);
  assert.match(html, /q\.optionContent && q\.optionContent\[key\]/);
  assert.match(html, /renderContentBlocks\(q\.detailContent/);
  assert.doesNotMatch(html, /<div class="text-base text-gray-800 leading-relaxed mb-5">\$\{q\.question\}<\/div>/);
});

test('image viewer and load failure UI are present', () => {
  assert.match(html, /function openImageViewer/);
  assert.match(html, /function handleMediaError/);
  assert.match(html, /className = 'content-image-error'/);
});
