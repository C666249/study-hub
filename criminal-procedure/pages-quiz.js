(function(L){
L.views.quiz=function(){
 const sess=L.session(),q=L.current(),mode=L.P.lastSession.split(":")[0];
 let filters=`<div class="chiprow" style="margin-bottom:12px">${[["all","全部题"],["new","未做题"],["wrong","错题"],["saved","收藏"]].map(([m,t])=>`<button class="chip ${m===mode?"active":""}" data-action="start" data-mode="${m}" data-unit="all">${t}</button>`).join("")}</div>`;
 if(!q)return `<div class="view quiz-frame"><div class="quiz-intro"><h1>章节刷题</h1><button class="icon-btn" data-action="grid">${L.icon("grid")}</button></div>${filters}<div class="card empty"><h3>当前筛选没有题目</h3><p>可切换到全部题目或继续学习。</p><button class="btn primary" data-action="start" data-mode="all" data-unit="all">查看全部题</button></div></div>`;
 let a=L.P.answers[q.id],picked=L.UI.choices[q.id]||a?.choices||[];
 let opts=Object.entries(q.options).map(([k,v])=>{let cls=a?(q.answer.includes(k)?"right":a.choices.includes(k)?"wrong":""):picked.includes(k)?"selected":"";return `<button class="option ${cls}" data-action="pick" data-id="${q.id}" data-letter="${k}" ${a?"disabled":""} aria-pressed="${picked.includes(k)}"><span class="option-letter">${k}</span><span>${L.h(v)}</span></button>`}).join("");
 let exp=a?`<section class="explain"><div class="result-line ${a.correct?"result-ok":"result-no"}">${L.icon(a.correct?"check":"close")} ${a.correct?"答对了":"本题需巩固"} · 正确答案 ${q.answer.join("")}</div>
 <div class="summary"><strong>详细解释</strong><div style="margin-top:6px">${L.h(q.analysis)}</div></div>
 <div class="content-label" style="margin-top:15px">选项逐项解析</div>
 ${Object.entries(q.reasons).map(([k,v])=>`<div class="explain-item ${q.answer.includes(k)?"correct":""}"><span class="exp-letter">${k}</span><span>${L.h(v)}</span></div>`).join("")}
 <div class="source">题目来源：${L.h(q.source)}</div>
 <div class="quiz-actions"><button class="btn outline" data-action="openunit" data-unit="${q.unit}">${L.icon("book")} 复习考点</button><div class="actions-right">
 ${L.P.mistakes[q.id]?`<button class="btn good" data-action="mastered" data-id="${q.id}">标记已掌握</button>`:""}<button class="btn soft" data-action="redo" data-id="${q.id}">重做</button></div></div></section>`:
 `<div class="hintbar" style="margin-top:14px">${q.type==="multi"?"多选题可以选择多个选项。":"单选题请选择一个选项。"} 提交后才会揭晓解析。</div>`;
 return `<div class="view quiz-frame"><div class="quiz-intro"><div><span class="eyebrow">CHAPTER 02 / PRACTICE</span><h1>第二章 · 专项刷题</h1></div><button class="icon-btn" data-action="grid" title="题号导航">${L.icon("grid")}</button></div>
 ${filters}<div class="quiz-progress"><strong>${sess.index+1} / ${sess.ids.length}</strong><div class="progress-track"><div class="progress-fill" style="width:${L.pct(sess.index+1,sess.ids.length)}%"></div></div><span>自动保存</span></div>
 <article class="quiz-card"><div class="question-head"><span class="tag blue">${q.type==="multi"?"多选":"单选"}</span><span class="tag">${L.h(L.unit(q.unit).title)}</span><span class="tag ${a?(a.correct?"green":"red"):""}">${a?"已作答":"尚未提交"}</span><button class="icon-btn" data-action="bookmark" data-id="${q.id}" style="margin-left:auto;color:${L.P.bookmarks[q.id]?"#d9a03d":"#9da8bd"}">${L.icon("star")}</button></div>
 <h2 class="question-title">${L.h(q.stem)}</h2><div class="options">${opts}</div>${exp}</article>
 <div class="quiz-sticky"><button class="btn outline" data-action="move" data-offset="-1" ${sess.index===0?"disabled":""}>${L.icon("back")} 上一题</button>
 ${a?`<button class="btn primary" data-action="move" data-offset="1" ${sess.index===sess.ids.length-1?"disabled":""}>下一题 ${L.icon("arrow")}</button>`:`<button class="btn primary" data-action="submit" ${picked.length?"":"disabled"}>${L.icon("check")} 提交答案</button>`}</div></div>`;
};
})(window.L);