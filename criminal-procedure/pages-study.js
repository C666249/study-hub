(function(L){
const D=L.D;
L.studyUnit=u=>{
let completed=!!L.P.views[u.id],qs=L.forUnit(u.id),opened=L.UI.unitToOpen===u.id;
return `<details class="unit" id="${u.id}" ${opened?"open":""}><summary>
<span class="unit-index">${String(D.units.indexOf(u)+1).padStart(2,"0")}</span>
<span class="unit-info"><strong>${L.h(u.title)}</strong><small>${L.h(u.section)} · ${L.h(u.slides)} · ${qs.length}题</small></span>
<span class="tag ${completed?"green":"blue"}">${completed?"已学习":"待学习"}</span><span class="chevron">${L.icon("down")}</span>
</summary><div class="unit-content"><div class="content-label">要点导读</div>
<p class="unit-lead">${L.h(u.lead)}</p><div class="content-label">核心提纲</div>
<div class="points">${u.points.map(v=>`<div class="point">${L.h(v)}</div>`).join("")}</div>
<div class="warn-box"><strong>易错提醒</strong><div style="margin-top:8px">${u.pitfalls.map(v=>"· "+L.h(v)).join("<br>")}</div></div>
<div class="memo-box"><strong>速记卡片</strong> · ${L.h(u.memory)}</div>
<div class="unit-end"><span class="small muted">对应讲义 ${L.h(u.slides)}</span>
<div class="actions-right"><button class="btn ${completed?"good":"soft"}" data-action="learn" data-unit="${u.id}">${L.icon("check")} ${completed?"已标记学过":"标记已学"}</button>
<button class="btn primary" data-action="start" data-mode="all" data-unit="${u.id}">${L.icon("quiz")} 专项练习</button></div></div>
</div></details>`;
};
L.filtered=()=>{
const term=L.UI.search.trim().toLowerCase();
return D.units.filter(u=>(L.UI.section==="all"||u.section.startsWith(L.UI.section))&&(!term||(u.title+u.lead+u.points.join(" ")+u.memory).toLowerCase().includes(term)));
};
L.views.study=()=>{
let pct=L.pct(L.learned(),D.units.length);
return `<div class="view"><div class="guide-header"><span class="eyebrow">CHAPTER 02 / STUDY GUIDE</span><h1>章节学习 · 把知识真正学懂</h1><p>严格沿第二章PPT的结构整理，点击任一知识点展开完整提纲、例子与易错辨析。完成一个模块后可以自行标记学习进度。</p></div>
<div class="split"><div>
<div class="card feature-box" style="margin-bottom:16px"><div class="welcome-inline"><div><span class="tag blue">第二章 · 学习进度</span><h3>已学习 ${L.learned()} / ${D.units.length} 个模块</h3><p>第一节：诉讼构造 · 第二节：诉讼主体</p></div><div class="ring" style="--percent:${pct}%;width:79px;height:79px"><strong style="font-size:17px">${pct}%</strong></div></div><div class="progress-track" style="margin-top:15px"><div class="progress-fill" style="width:${pct}%"></div></div></div>
<div class="study-toolbar"><label class="search">${L.icon("search")}<input id="unitSearch" placeholder="搜索本章知识点…" autocomplete="off" value="${L.h(L.UI.search)}"></label></div>
<div class="chiprow" style="margin-bottom:15px">${[["all","全部10个"],["第一节","第一节 · 诉讼构造"],["第二节","第二节 · 诉讼主体"]].map(([id,t])=>`<button class="chip ${L.UI.section===id?"active":""}" data-action="section" data-id="${id}">${t}</button>`).join("")}</div>
<div id="unitContainer" class="unit-list">${L.filtered().map(L.studyUnit).join("")||'<div class="card empty">没有匹配的知识点</div>'}</div>
</div><aside class="side-panel"><div class="card"><div class="eyebrow">LEARNING PATH</div><h3>本章学习路线</h3>
<div class="side-list">${["认识控辩审：看清基本结构","比较职权、当事人和混合式","掌握我国的控辩式特征","区分公检法、当事人与其他参与人","通过习题检验实际理解"].map((v,i)=>`<div class="side-list-item"><span class="tag blue">${String(i+1).padStart(2,"0")}</span><b>${v}</b></div>`).join("")}</div>
<div class="divider"></div><button class="btn primary wide" data-action="page" data-page="map">${L.icon("map")} 查看思维导图</button></div>
<div class="notice" style="margin-top:12px">提纲来源：已上传的第二章课件。题目包含课件所示法考原题与原创改编题；两者在题后来源栏分别标注。</div></aside></div></div>`;
};
L.views.map=()=>{
let groups=[{name:"第一节 · 刑事诉讼构造",items:D.units.slice(0,5)},{name:"第二节 · 刑事诉讼主体",items:D.units.slice(5)}];
return `<div class="view"><div class="guide-header"><span class="eyebrow">INTERACTIVE KNOWLEDGE MAP</span><h1>思维导图 · 建立知识之间的联系</h1><p>第二章分为两大部分、10个模块；点击任一节点，即可打开对应讲义和知识点详解。手机端可以横向滚动查看。</p></div>
<div class="card" style="overflow:hidden"><div class="mind-head"><div><h3 style="margin:0 0 5px">全章知识网络</h3><p>从章节到知识单元 · 可点击</p></div><span class="tag blue">10个知识点</span></div>
<div class="mindwrap"><div class="mind-root"><div class="mind-main">第二章 · 刑事诉讼构造与刑事诉讼主体</div>
<div class="mind-branches">${groups.map(g=>`<div class="mind-col"><strong>${g.name}</strong>${g.items.map(u=>`<button data-action="openunit" data-unit="${u.id}">${L.h(u.title)} →</button>`).join("")}</div>`).join("")}</div></div></div><p class="mind-note">点击知识节点前往对应学习卡片</p></div>
<div class="section-header"><div><h2>三种经典诉讼构造对照</h2><p>把典型国家、法官角色、主要价值放在一张表中记忆</p></div></div>
<div class="card compare"><table><thead><tr><th>比较角度</th><th>职权主义</th><th>当事人主义</th><th>混合式</th></tr></thead><tbody>
<tr><td>典型国家</td><td>法国、德国</td><td>英国、美国</td><td>日本、意大利</td></tr>
<tr><td>程序主导</td><td>法官积极</td><td>控辩积极、法官居中</td><td>兼采两种模式</td></tr>
<tr><td>庭前阅卷</td><td>典型模式允许先阅卷</td><td>强调避免预断</td><td>按具体制度兼顾</td></tr>
<tr><td>价值目标</td><td>实体真实与效率</td><td>人权保障与程序公正</td><td>协调公正与效率</td></tr>
<tr><td>易错提醒</td><td>不等于没有控辩</td><td>不等于法官不裁判</td><td>不等于简单对半</td></tr></tbody></table></div>
<div class="section-header"><div><h2>诉讼主体速记图</h2><p>宏观两类、当事人六方、其他参与人1+2+3</p></div></div>
<div class="cards"><div class="card"><span class="tag blue">专门机关</span><h3>公 · 检 · 法</h3><p>依法分工负责、相互配合、相互制约。</p></div>
<div class="card"><span class="tag blue">当事人6类</span><h3>被害、自诉、嫌疑、被告、附民两方</h3><p>当事人是诉讼参与人的重要组成部分。</p></div>
<div class="card"><span class="tag blue">其他参与人 1+2+3</span><h3>代理人、律师角色和居中人员</h3><p>法定代理人；辩护人及诉讼代理人；证人、鉴定人、翻译人员。</p></div></div></div>`;
};
})(window.L);