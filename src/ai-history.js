// AI chat history — localStorage, max 10, per-entry delete, restore conversation
// Loaded as a separate script in index.html

var AI_HISTORY_KEY = 'studyhub_ai_history';
var AI_HISTORY_MAX = 10;

function saveAiHistory(subject, questionPreview, messages, provider) {
  var h = getAiHistory();
  h.unshift({
    id: Date.now(),
    subject: subject,
    preview: questionPreview,
    messages: messages,
    provider: provider,
    time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  });
  if (h.length > AI_HISTORY_MAX) h = h.slice(0, AI_HISTORY_MAX);
  localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(h));
}

function getAiHistory() {
  try { return JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || '[]'); }
  catch (e) { return []; }
}

function deleteAiHistory(id) {
  var h = getAiHistory().filter(function (x) { return x.id !== id; });
  localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(h));
}

function toggleAiHistory() {
  var hv = document.getElementById('ai-history-view');
  var msgs = document.getElementById('ai-chat-msgs');
  var inputRow = document.getElementById('ai-chat-input').parentElement;
  var btn = document.getElementById('ai-hist-btn');
  if (!hv || !msgs) return;

  var showing = !hv.classList.contains('hidden');
  if (showing) {
    hv.classList.add('hidden');
    msgs.classList.remove('hidden');
    if (inputRow) inputRow.classList.remove('hidden');
    if (btn) btn.style.color = '';
  } else {
    hv.classList.remove('hidden');
    msgs.classList.add('hidden');
    if (inputRow) inputRow.classList.add('hidden');
    if (btn) btn.style.color = '#fbbf24';
    renderAiHistory();
  }
}

function renderAiHistory() {
  var hv = document.getElementById('ai-history-view');
  if (!hv) return;
  var h = getAiHistory();
  hv.innerHTML = '<div class="text-gray-400 text-xs text-center py-2">对话历史（最近' + AI_HISTORY_MAX + '条）</div>';
  if (!h.length) {
    hv.innerHTML += '<div class="text-gray-300 text-xs text-center py-4">暂无历史</div>';
    return;
  }
  h.forEach(function (entry) {
    var div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer';
    div.onclick = function () { restoreAiHistory(entry.id); };
    div.innerHTML =
      '<div class="flex-1 min-w-0">' +
      '<div class="text-xs text-gray-700 truncate">' + escHtml(entry.preview || '无标题') + '</div>' +
      '<div class="text-10px text-gray-400 mt-0.5">' + escHtml(entry.subject) + ' · ' + escHtml(entry.time) + ' · ' + escHtml(entry.provider || 'agnes') + '</div>' +
      '</div>' +
      '<span class="text-gray-300 hover:text-red-400 text-sm ml-2 shrink-0" onclick="event.stopPropagation();deleteAiHistory(' + entry.id + ');renderAiHistory();">×</span>';
    hv.appendChild(div);
  });
}

function restoreAiHistory(id) {
  var h = getAiHistory().find(function (x) { return x.id === id; });
  if (!h) return;
  aiChatHistory = h.messages.slice();
  aiChatQuestionId = 'restored_' + id;

  // Switch to chat view
  var hv = document.getElementById('ai-history-view');
  var msgs = document.getElementById('ai-chat-msgs');
  var inputRow = document.getElementById('ai-chat-input').parentElement;
  var btn = document.getElementById('ai-hist-btn');
  if (hv) hv.classList.add('hidden');
  if (msgs) msgs.classList.remove('hidden');
  if (inputRow) inputRow.classList.remove('hidden');
  if (btn) btn.style.color = '';

  // Render conversation
  if (!msgs) return;
  msgs.innerHTML = '<div class="text-gray-400 text-xs text-center py-2">已恢复对话 — 继续提问</div>';
  h.messages.forEach(function (m) {
    if (m.role === 'user') {
      msgs.innerHTML += '<div class="ai-msg text-right"><span class="inline-block bg-purple-100 text-purple-800 rounded-xl px-3 py-1.5 text-xs max-w-[85%] text-left">' + escHtml(m.content) + '</span></div>';
    } else if (m.role === 'assistant') {
      var html = (typeof marked !== 'undefined') ? marked.parse(m.content) : escHtml(m.content);
      msgs.innerHTML += '<div class="ai-msg"><div class="inline-block bg-gray-100 text-gray-700 rounded-xl px-3 py-1.5 text-xs max-w-[85%] ai-reply">' + html + '</div></div>';
    }
  });
  msgs.scrollTop = msgs.scrollHeight;

  // Restore mermaid buttons for any saved chart code blocks
  setTimeout(function() {
    var replies = msgs.querySelectorAll('.ai-reply');
    for (var i = 0; i < replies.length; i++) {
      if (typeof renderMermaid === 'function') renderMermaid(replies[i]);
    }
  }, 200);
}
