// study-hub core logic functions
// Shared between tests (Node.js) and browser (HTML script tag)

function isAnswerCorrect(userAnswer, correctAnswer, type) {
    if (!userAnswer || !correctAnswer) return false;
    if (type === 'multiple') {
        return userAnswer.split('').sort().join('') === correctAnswer.split('').sort().join('');
    }
    return userAnswer === correctAnswer;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeMediaSrc(value) {
    if (typeof value !== 'string') return '';
    const src = value.trim().replace(/\\/g, '/');
    if (!src.startsWith('data/media/')) return '';
    if (src.includes('..') || src.includes('?') || src.includes('#')) return '';
    if (!/\.(?:png|jpe?g|webp|gif|svg|avif)$/i.test(src)) return '';
    return src;
}

function blockSearchText(blocks) {
    if (!Array.isArray(blocks)) return '';
    return blocks.map(block => {
        if (!block || typeof block !== 'object') return '';
        if (block.type === 'text') return block.text || '';
        if (block.type === 'image') return [block.alt || '', block.caption || ''].join(' ');
        return '';
    }).join(' ');
}

function getQuestionSearchText(item) {
    const optionText = Object.values(item.options || {})
        .filter(value => typeof value === 'string');
    const optionContentText = Object.values(item.optionContent || {})
        .map(blockSearchText);
    return [
        item.question || '',
        blockSearchText(item.questionContent),
        ...optionText,
        ...optionContentText,
        item.explanation || '',
        blockSearchText(item.explanationContent),
        item.detail || '',
        blockSearchText(item.detailContent),
        ...(item.tags || [])
    ].join(' ');
}

function renderContentBlocks(blocks, fallbackText = '', options = {}) {
    const content = Array.isArray(blocks) && blocks.length
        ? blocks
        : [{ type: 'text', text: fallbackText }];
    const interactiveImages = options.interactiveImages !== false;
    const compactClass = options.compact ? ' content-blocks-compact' : '';

    return `<div class="content-blocks${compactClass}">` + content.map(block => {
        if (!block || typeof block !== 'object') return '';
        if (block.type === 'text') {
            return `<div class="content-text">${escapeHtml(block.text || '').replace(/\r?\n/g, '<br>')}</div>`;
        }
        if (block.type !== 'image') return '';

        const src = sanitizeMediaSrc(block.src);
        if (!src) {
            return '<div class="content-image-error" role="status">⚠ 图片路径无效</div>';
        }

        const alt = escapeHtml(block.alt || '题目图片');
        const caption = block.caption
            ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
            : '';
        const image = `<img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" onerror="handleMediaError(this)">`;
        const body = interactiveImages
            ? `<button type="button" class="content-image-open" onclick="openImageViewer(this.querySelector('img'))" aria-label="放大查看${alt}">${image}</button>`
            : image;
        return `<figure class="content-image">${body}${caption}</figure>`;
    }).join('') + '</div>';
}

function searchQuestions(query, questions) {
    if (!query || !query.trim()) return [...questions];
    const q = query.trim().toLowerCase();
    return questions.filter(item => {
        const searchText = getQuestionSearchText(item).toLowerCase();
        return searchText.includes(q);
    });
}

function getQuestionsByTag(tag, questions) {
    if (!tag) return [...questions];
    return questions.filter(item => (item.tags || []).includes(tag));
}

function getKnowledgePointStats(questions) {
    const stats = {};
    questions.forEach(q => {
        (q.tags || []).forEach(tag => {
            stats[tag] = (stats[tag] || 0) + 1;
        });
    });
    return stats;
}

function shuffleArray(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAnswerCorrect,
        searchQuestions,
        getQuestionsByTag,
        getKnowledgePointStats,
        shuffleArray,
        getQuestionSearchText,
        renderContentBlocks,
        sanitizeMediaSrc
    };
}
