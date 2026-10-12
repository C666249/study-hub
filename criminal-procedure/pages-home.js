(function(L){
const {D}=L;
const s=(n,label,tone="blue")=>`<span class="tag ${tone}">${label}</span>`;
L.views=L.views||{};
L.views.home=()=>{
let done=L.attempted(),pct=L.pct(done,D.questions.length),learn=L.learned();
return `<div class="view">
<section class="hero"><div class="eyebrow">YOUR PRIVATE STUDY SPACE · 2026</div>
<h1>从理解开始，<br>让每一道题都有答案。</h1>
<p>章节提纲、知识点精讲、可交互思维导图与逐项解析题库。将零散知识连成体系，沿着课堂进度持续更新。</p>
<div class="hero-actions"><button class="btn" data-action="page" data-page="study">${L.icon("book")} 开始学习</button><button class="btn light" data-action="resume">${L.icon("arrow")} ${done?"继续上次刷题":"进入章节题库"}</button></div></section>
<section class="stat-row">
<div class="card stat">${s(1,"已学模块")}<div class="num" style="margin-top:10px">${learn}<span class="muted" style="font-size:14px"> / ${D.units.length}</span></div><p>知识学习进度</p></div>
<div class="card stat">${s(1,"已练习题目")}<div class="num" style="margin-top:10px">${done}<span class="muted" style="font-size:14px"> / ${D.questions.length}</span></div><p>刷题完成进度</p></div>
<div class="card stat">${s(1,"正确率","green")}<div class="num" style="margin-top:10px">${done?L.pct(L.correct(),done)+"%":"—"}</div><p>当前作答记录</p></div>
<div class="card stat">${s(1,"待巩固","red")}<div class="num" style="margin-top:10px">${L.wrongs().length}</div><p>错题本中的题目</p></div>
</section>
<div class="section-header"><div><h2>课程章节</h2><p>已经收到第二章课件，其他章节可随上传继续扩充</p></div><span class="tag green">第二章已开放</span></div>
<div class="cards">${D.chapters.map(ch=>ch.ready?`<button type="button" class="card click chapter-ready" style="text-align:left" data-action="page" data-page="study">
<div class="welcome-inline"><span class="chapter-number">0${ch.id}</span><span class="tag green">正在学习</span></div>
<h3>${L.h(ch.title)}</h3><p>${L.h(ch.subtitle)}</p>
<div class="card-foot"><span class="small muted">${D.units.length} 个知识模块 · ${D.questions.length} 道题</span><span class="card-arrow">${L.icon("arrow")}</span></div></button>`:
`<div class="card chapter-disabled"><div class="welcome-inline"><span class="chapter-number">0${ch.id}</span><span class="tag">待导入</span></div><h3>${L.h(ch.title)}</h3><p>${L.h(ch.subtitle)}</p><div class="card-foot"><span class="small muted">等待本章课件</span><span class="card-arrow">${L.icon("clock")}</span></div></div>`).join("")}</div>
<div class="section-header"><div><h2>继续上次进度</h2><p>在当前设备自动记录题目位置，不会每次从第一题开始</p></div></div>
<div class="split"><div class="card"><div class="welcome-inline"><div><div class="eyebrow">CHAPTER 02 · QUESTION BANK</div><h3>54 道精讲练习</h3><p>每道题含正确答案、考点总结、所有选项独立解析</p></div><div class="ring" style="--percent:${pct}%"><strong>${pct}%</strong></div></div>
<div class="progress-track" style="margin-top:16px"><div class="progress-fill" style="width:${pct}%"></div></div>
<div class="card-foot"><span class="small muted">今天已做 ${L.today()} 道</span><button class="btn soft" data-action="resume">${L.icon("arrow")} 继续刷题</button></div></div>
<div class="card"><div class="eyebrow">STUDY ROUTINE</div><h3>先学，再练，再复习</h3><p>展开知识点掌握逻辑，再用思维导图建立全章联系，最后用逐项解析巩固易错点。</p>
<div class="card-foot"><span class="tag">建议每天 15 分钟</span><button class="icon-btn" data-action="page" data-page="map" aria-label="查看思维导图">${L.icon("map")}</button></div></div></div></div>`;
};
L.header=()=>{
 const pages=[["home","总览","home"],["study","知识学习","book"],["map","思维导图","map"],["quiz","章节刷题","quiz"],["review","错题复习","star"]];
 return `<header class="header"><div class="header-inner">
 <a class="logo" href="#home"><span class="brand-icon">${L.icon("book")}</span><span class="brand-name">诉研 <small>CRIMINAL PROCEDURE</small></span></a>
 <nav class="desktop-nav" aria-label="主导航">${pages.map(([k,t])=>`<button class="navlink ${L.UI.page===k?"active":""}" data-action="page" data-page="${k}">${t}</button>`).join("")}</nav>
 <div class="header-tools"><span class="header-kicker">刑事诉讼法 · 54题</span><button class="icon-btn" data-action="settings" title="备份及设置" aria-label="备份及设置">${L.icon("settings")}</button></div>
 </div></header>`;
};
L.bottom=()=>`<nav class="bottom-nav">${[["home","总览","home"],["study","学习","book"],["quiz","刷题","quiz"],["review","复习","star"]].map(([k,t,i])=>`<button data-action="page" data-page="${k}" class="${L.UI.page===k||k==="study"&&L.UI.page==="map"?"active":""}">${L.icon(i)}<span>${t}</span></button>`).join("")}</nav>`;
L.footer=()=>`<div class="footer">据第二章 54 页课堂课件整理 · 部分试题为考点原创改编<br>仅用于课程复习，具体法律规范请以现行权威文本为准<br>学习进度存储于当前设备浏览器，换设备请先导出备份</div>`;
})(window.L);