// study-hub AI model switching tests
// Run: node tests/ai-config.test.js
const assert = require('assert');

// Simulate localStorage for Node.js
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; }
};

// Import ai config functions
const {
  getAiProvider, setAiProvider,
  getDeepseekKey, setDeepseekKey,
  getAiConfig, AI_PROVIDERS
} = require('../src/ai-config.js');

// ── TEST 1: Default provider is agnes ──
console.log('TEST 1: default provider');
assert.strictEqual(getAiProvider(), 'agnes', 'default provider should be agnes');
assert.ok(AI_PROVIDERS.agnes, 'should have agnes provider config');
assert.ok(AI_PROVIDERS.deepseek, 'should have deepseek provider config');
console.log('  PASS');

// ── TEST 2: setAiProvider / getAiProvider ──
console.log('TEST 2: set/get provider');
setAiProvider('deepseek');
assert.strictEqual(getAiProvider(), 'deepseek', 'should return deepseek after switching');
setAiProvider('agnes');
assert.strictEqual(getAiProvider(), 'agnes', 'should return agnes after switching back');
setAiProvider('invalid');
assert.strictEqual(getAiProvider(), 'agnes', 'invalid provider should fallback to agnes');
console.log('  PASS');

// ── TEST 3: DeepSeek key management ──
console.log('TEST 3: deepseek key');
assert.strictEqual(getDeepseekKey(), '', 'should be empty by default');
setDeepseekKey('sk-test-123');
assert.strictEqual(getDeepseekKey(), 'sk-test-123', 'should return saved key');
setDeepseekKey('');
assert.strictEqual(getDeepseekKey(), '', 'should clear key');
console.log('  PASS');

// ── TEST 4: getAiConfig resolves correct config ──
console.log('TEST 4: getAiConfig');
setAiProvider('agnes');
const agnesCfg = getAiConfig();
assert.strictEqual(agnesCfg.endpoint, 'https://apihub.agnes-ai.com/v1/chat/completions');
assert.strictEqual(agnesCfg.model, 'agnes-2.0-flash');
assert.ok(agnesCfg.apiKey.startsWith('sk-'), 'agnes key should be preset');

setAiProvider('deepseek');
setDeepseekKey('sk-user-deepseek-key');
const dsCfg = getAiConfig();
assert.strictEqual(dsCfg.endpoint, 'https://api.deepseek.com/v1/chat/completions');
assert.strictEqual(dsCfg.model, 'deepseek-chat');
assert.strictEqual(dsCfg.apiKey, 'sk-user-deepseek-key', 'should use user deepseek key');

// DeepSeek without key
setDeepseekKey('');
const dsNoKey = getAiConfig();
assert.strictEqual(dsNoKey.apiKey, '', 'empty key when not configured');
console.log('  PASS');

// ── TEST 5: AI_PROVIDERS list ──
console.log('TEST 5: AI_PROVIDERS structure');
assert.strictEqual(Object.keys(AI_PROVIDERS).length, 2);
assert.ok(AI_PROVIDERS.agnes.default);
assert.strictEqual(AI_PROVIDERS.deepseek.needUserKey, true);
console.log('  PASS');

console.log('\n✅ ALL AI CONFIG TESTS PASSED');
