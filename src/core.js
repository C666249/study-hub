// study-hub core logic functions
// Shared between tests (Node.js) and browser (HTML script tag)

function isAnswerCorrect(userAnswer, correctAnswer, type) {
    if (!userAnswer || !correctAnswer) return false;
    if (type === 'multiple') {
        return userAnswer.split('').sort().join('') === correctAnswer.split('').sort().join('');
    }
    return userAnswer === correctAnswer;
}

function searchQuestions(query, questions) {
    if (!query || !query.trim()) return [...questions];
    const q = query.trim().toLowerCase();
    return questions.filter(item => {
        const searchText = [
            item.question || '',
            ...Object.values(item.options || {}),
            item.explanation || '',
            ...(item.tags || [])
        ].join(' ').toLowerCase();
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
        shuffleArray
    };
}
