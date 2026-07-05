// study-hub AI model switching — shared between Node.js tests and browser

const AI_PROVIDERS = {
  agnes: {
    id: 'agnes',
    label: 'Agnes AI',
    endpoint: 'https://apihub.agnes-ai.com/v1/chat/completions',
    model: 'agnes-2.0-flash',
    apiKey: 'sk-WES8VsOhWEkpWpWjK5dkn1nh4vi7Te9P5AduH456OAy5H7KI',
    default: true
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    apiKey: '', // user fills in
    needUserKey: true
  }
};

function getAiProvider() {
  if (typeof localStorage === 'undefined') return 'agnes';
  const v = localStorage.getItem('studyhub_ai_provider');
  if (v && AI_PROVIDERS[v]) return v;
  return 'agnes';
}

function setAiProvider(provider) {
  if (!AI_PROVIDERS[provider]) provider = 'agnes';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('studyhub_ai_provider', provider);
  }
}

function getDeepseekKey() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('studyhub_deepseek_key') || '';
}

function setDeepseekKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key) localStorage.setItem('studyhub_deepseek_key', key);
    else localStorage.removeItem('studyhub_deepseek_key');
  }
}

function getAiConfig() {
  const provider = getAiProvider();
  const cfg = AI_PROVIDERS[provider];
  const apiKey = provider === 'deepseek'
    ? getDeepseekKey()
    : cfg.apiKey;
  return {
    provider: provider,
    endpoint: cfg.endpoint,
    model: cfg.model,
    apiKey: apiKey
  };
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AI_PROVIDERS,
    getAiProvider, setAiProvider,
    getDeepseekKey, setDeepseekKey,
    getAiConfig
  };
}
