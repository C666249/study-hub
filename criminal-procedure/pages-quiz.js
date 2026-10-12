(function(L){
L.views.quiz=function(){
 const sess=L.session(),q=L.current(),section=(L.P.lastSession||"all:all").split(":")[1];
 const progress=`<div class="quiz-meter" aria-label="刷题进度"><div class="quiz-meter-fill" style="width:${L.pct(sess.index+1,sess.ids.length)}%"></div></div>`;
 const back=`<header class="focus-header"><button class="focus-exit" data-action="page" data-page="home" aria-label="退出刷题">${L.icon("back")}</button><div class="focus-heading"><strong>第二章 · 专项练习</strong><span>${sess.ids.length?"第 "+(sess.index+1)+" / "+sess.ids.length+" 题":"准备开始"}</span></div><button class="focus-tool" data-action="quizfilters" aria-label="选择题组" title="选择题组">${L.icon("settings")}</button><button class="focus-tool" data-action="grid" aria-label="题号导航" title="题号导航">${L.icon("grid")}</button></header>`;
 if(!q)return `<div class="view quiz-frame focus-page">${back}<div class="card empty" style="margin-top:28px"><h3>本组暂无待练习的题目</h3><p>可能是当前题组已经全部做完了，可以切换至完整题库继续练习。</p><button class="btn primary" data-action="start" data-mode="all" data-unit="all">查看所有题目</button></div></div>`;
 const a=L.P.answers[q.id],chosen=L.UI.choices[q.id]||a?.choices||[];
 const isMulti=q.type==="multi";
 const opts=Object.entries(q.options).map(([k,v])=>{
   let cls=a?(q.answer.includes(k)?"right":a.choices.includes(k)?"wrong":""):chosen.includes(k)?"selected":"";
   return `<button class="option ${cls}" data-action="pick" data-id="${q.id}" data-letter="${k}" ${a?"disabled":""} aria-pressed="${chosen.includes(k)}"><span class="option-letter">${k}</span><span>${L.h(v)}</span></button>`;
 }).join("");
 const explain=a?`<section class="explain"><div class="result-line ${a.correct?"result-ok":"result-no"}">${L.icon(a.correct?"check":"close")} ${a.correct?"回答正确":"回答有误"} <span class="answer-key">正确答案 ${q.answer.join("")}</span></div>
 <div class="explain-brief">${L.h(q.analysis)}</div>
 <details class="explain-expand" open><summary><span>完整逐项解析</span>${L.icon("down")}</summary><div class="explain-rows">
 ${Object.entries(q.reasons).map(([k,v])=>`<div class="explain-item ${q.answer.includes(k)?"correct":""}"><span class="exp-letter">${k}</span><span>${L.h(v)}</span></div>`).join("")}
 <div class="source">题目来源：${L.h(q.source)}</div><div class="quiz-actions"><button class="btn outline" data-action="openunit" data-unit="${q.unit}">${L.icon("book")} 回看知识点</button>
 <div class="actions-right">${L.P.mistakes[q.id]?`<button class="btn good" data-action="mastered" data-id="${q.id}">已掌握</button>`:""}<button class="btn soft" data-action="redo" data-id="${q.id}">${L.icon("refresh")} 重做</button></div></div></div></details></section>`:
 isMulti?`<div class="multi-submit"><button class="btn primary" data-action="submit" ${chosen.length?"":"disabled"}>${L.icon("check")} 提交答案 <span class="multi-count">已选 ${chosen.length} 项</span></button><span>多选题选完后确认答案</span></div>`:
 `<p class="auto-answer-hint">选择一个选项，立即揭晓答案与详细解析</p>`;
 return `<div class="view quiz-frame focus-page">
 ${back}${progress}
 <div class="focus-body">
 <div class="focus-question-meta"><span class="tag blue">${isMulti?"多项选择":"单项选择"}</span><span class="focus-unit">${L.h(L.unit(q.unit).title)}</span><button class="focus-bookmark" data-action="bookmark" data-id="${q.id}" aria-label="${L.P.bookmarks[q.id]?"取消收藏":"收藏题目"}" title="收藏这道题" style="color:${L.P.bookmarks[q.id]?"#d9a03d":"#9da8bd"}">${L.icon("star")}</button></div>
 <h1 class="question-title">${L.h(q.stem)}</h1>
 <div class="options" role="group" aria-label="题目选项">${opts}</div>
 ${explain}
 </div>
 <nav class="quiz-sticky" aria-label="题目导航"><button class="btn outline" data-action="move" data-offset="-1" ${sess.index===0?"disabled":""}>${L.icon("back")} 上一题</button><span class="quiz-sticky-counter">${sess.index+1} / ${sess.ids.length}</span><button class="btn primary" data-action="move" data-offset="1" ${sess.index>=sess.ids.length-1?"disabled":""}>下一题 ${L.icon("arrow")}</button></nav>
 </div>`;
};
})(window.L);