/* 纪律研习室：纯静态，无第三方服务。所有个人学习记录仅存浏览器 localStorage。 */
(() => {
  'use strict';
  const db = window.DISCIPLINE_DATA;
  if (!db || !Array.isArray(db.questions)) {
    document.getElementById('main').textContent = '题库文件加载失败。请确认 data.js 与 index.html 位于同一目录。';
    return;
  }
  const storageKey = 'npa-discipline-lab-v1';
  const defaults = () => ({attempts:0, correctAttempts:0, solved:{}, wrong:{}, bookmarks:{}});
  let progress;
  try {progress = Object.assign(defaults(),JSON.parse(localStorage.getItem(storageKey) || 'null') || {});} catch {progress = defaults();}
  for (const k of ['solved','wrong','bookmarks']) if (!progress[k] || typeof progress[k] !== 'object') progress[k]={};
  const qById = new Map(db.questions.map(q=>[q.id,q]));
  const rById = new Map([...db.rules,...db.notes].map(r=>[r.id,r]));
  let view='home',session=null,studyCategory='全部',studySearch='',toastTimer=null;
  const main=document.getElementById('main');
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const E = escapeHtml;
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{notify('存储空间不可用，学习进度可能无法保存');}};
  const count=key=>Object.keys(progress[key]).filter(k=>progress[key][k]).length;
  const pct=()=>Math.round(count('solved')/db.questions.length*100);
  const accuracy=()=>progress.attempts?Math.round(progress.correctAttempts/progress.attempts*100):0;
  const pdf=(p)=>`standard.pdf#page=${Number(p)||1}`;
  const shuffle=(arr)=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const stat=(name,val,desc,ico)=>`<div class="stat-card"><div class="stat-title">${name}</div><div class="stat-value">${val}</div><div class="stat-desc">${desc}</div><div class="stat-icon" aria-hidden="true">${ico}</div></div>`;
  function notify(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2200);}
  function syncNav(){
    document.querySelectorAll('[data-nav]').forEach(el=>{
      const key=el.dataset.nav;
      el.classList.toggle('active',view==='practice'?key==='practice':key===view);
      if(el.tagName==='BUTTON')el.setAttribute('aria-current',(view==='practice'?key==='practice':key===view)?'page':'false');
    });
    document.getElementById('sideWrong').textContent=count('wrong');
    document.getElementById('sideSaved').textContent=count('bookmarks');
    document.getElementById('sidePct').textContent=`${pct()}%`;
    document.getElementById('sideProgressFill').style.width=pct()+'%';
    document.getElementById('sideProgressText').textContent=`已掌握 ${count('solved')} / ${db.questions.length} 道题`;
    document.getElementById('breadcrumbCurrent').textContent=({home:'学习总览',practice:'在线刷题',learn:'知识点学习',wrong:'错题重练',saved:'我的收藏'})[view]||'学习总览';
  }
  function navigate(next){
    if(next==='practice'){if(!session)startSession('all');else{view='practice';render();}return;}
    if(next==='wrong'){startSession('wrong');return;}
    if(next==='saved'){startSession('saved');return;}
    if(next==='learn')studySearch='';
    view=next;render();
  }
  function startSession(mode='all',filter=''){
    let q=db.questions.slice();
    if(mode==='wrong')q=q.filter(x=>progress.wrong[x.id]);
    if(mode==='saved')q=q.filter(x=>progress.bookmarks[x.id]);
    if(mode==='category')q=q.filter(x=>x.subcat===filter||x.category===filter);
    if(mode==='heavy')q=q.filter(x=>/^-3\s*分|^-4\s*分|^-6\s*分|^-8\s*分|^-10\s*分/.test(x.sourceScore)||x.sourceScore.includes('2或3')||x.tag==='重点易错');
    if(mode==='mock')q=shuffle(q).slice(0,20);
    else if(mode==='wrong'||mode==='saved')q=shuffle(q);
    else q=[...shuffle(q.filter(x=>!progress.solved[x.id])),...shuffle(q.filter(x=>progress.solved[x.id]))];
    session={mode,filter,ids:q.map(x=>x.id),index:0,answer:null,results:{},correct:0,wrong:0};
    view=mode==='wrong'?'wrong':mode==='saved'?'saved':'practice';render();
  }
  function home(){
    const labels=[['课堂管理','◉'],['警容风纪','✧'],['宿舍内务','▦'],['日常管理','▤']];
    return `<div class="hero"><div class="hero-content"><div class="eyebrow"><span class="eyebrow-dot"></span> YOUR EXAM COMPANION · 2026</div><h1>认真准备每一道题。<br>让规则成为你的底气。</h1><p>基于《南京警察学院学生违纪行为处理标准》整理。117 道练习题，逐题对应原文，让每一次复习都有据可查。</p><div class="hero-actions"><button class="btn btn-white" data-start="all">开始今日刷题 &nbsp; ↗</button><button class="btn btn-ghost" data-nav="learn">查看完整知识点 &nbsp; ↗</button></div></div></div>
    <div class="stat-grid">${stat('题库总数',db.questions.length,'涵盖 95 条标准与扣分原则','▤')}${stat('已掌握题目',count('solved'),'做对过的不同题目','✓')}${stat('我的错题',count('wrong'),'等待你重新攻克','↺')}${stat('累计正确率',accuracy()+'%','基于历史所有作答','⌁')}</div>
    <div class="section-title"><div><h2>开始专项训练</h2><p>从薄弱点切入，循序渐进地掌握每项规范</p></div><button class="text-link" data-start="all">全部 ${db.questions.length} 题 ↗</button></div>
    <div class="workspace-grid"><div class="module-card large"><div class="module-head"><h3>按知识模块刷题</h3><small>选择想练习的内容</small></div><div class="cat-grid">${labels.map(([t,ico])=>`<button class="cat-option" data-start="category" data-filter="${E(t)}"><span class="cat-ico">${ico}</span><span class="cat-txt"><strong>${t}</strong><small>${db.questions.filter(q=>q.subcat===t||q.category===t).length} 道专项练习</small></span><span class="cat-chevron">↗</span></button>`).join('')}</div></div><div class="module-card"><div class="module-head"><h3>考前冲刺计划</h3><small>EXAM PREP</small></div><div class="daily-card"><div class="daily-badge">✦ &nbsp; TODAY'S CHALLENGE</div><div class="daily-title">随机 20 题<br>检验真实掌握程度</div><p class="daily-desc">覆盖多个知识板块，答完查看正确率和薄弱点，错题自动收录。</p><button class="btn btn-primary" data-start="mock">开始模拟测验 &nbsp; ↗</button></div></div></div>
    <div class="section-title"><div><h2>常用备考入口</h2><p>集中攻克容易混淆的扣分分值与细节</p></div></div><div class="quick-row"><button class="quick-pill" data-start="heavy">✦ &nbsp; <strong>重点易错与较重扣分</strong> →</button><button class="quick-pill" data-start="wrong">↺ &nbsp; 错题重练 <strong>${count('wrong')}</strong> 道 →</button><button class="quick-pill" data-start="saved">☆ &nbsp; 我的收藏 <strong>${count('bookmarks')}</strong> 道 →</button><button class="quick-pill" data-nav="learn">▤ &nbsp; <strong>95 条</strong> 原文标准学习 →</button></div>`;
  }
  function quizName(){return ({all:'全部题库练习',category:session.filter+' · 专项练习',wrong:'错题强化训练',saved:'收藏题目练习',mock:'20 题模拟测验',heavy:'重点易错专项'})[session?.mode]||'专项练习';}
  function emptyView(){
    const wrong=view==='wrong',title=wrong?'错题本还是空的':'还没有收藏题目';
    return `<div class="page-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> ${wrong?'ERROR NOTEBOOK':'MY COLLECTION'}</span><h1>${title}</h1><p>${wrong?'答错的题目会自动进入这里，重练答对后会从错题本移除。':'点击题目右上角的星标，即可加入收藏并随时集中复习。'}</p></div><div class="empty-state"><div class="empty-icon">${wrong?'↺':'☆'}</div><h2>${wrong?'目前没有待重练的错题':'你还没有收藏任何题目'}</h2><p>${wrong?'这很棒。开始刷题，系统会自动为你记录需要复习的内容。':'刷题时点击每道题右上方的星标，就能创建自己的重点知识清单。'}</p><button class="btn btn-primary" data-start="all">去刷几道题 &nbsp; ↗</button></div>`;
  }
  function quiz(){
    if(!session||!session.ids.length)return emptyView();
    if(session.index>=session.ids.length)return finish();
    const q=qById.get(session.ids[session.index]);if(!q)return emptyView();
    const answered=session.answer!==null,correct=answered&&session.answer===q.correct;
    const choices=q.options.map((value,i)=>{
      const choiceCorrect=answered&&i===q.correct,choiceWrong=answered&&i===session.answer&&i!==q.correct;
      return `<button class="option ${choiceCorrect?'correct':''} ${choiceWrong?'wrong':''}" data-choice="${i}" ${answered?'disabled':''} aria-label="选项 ${'ABCD'[i]}，${E(value)}"><span class="letter">${'ABCD'[i]}</span><span class="opt-text">${E(value)}</span>${choiceCorrect?'<span class="outcome">✓</span>':choiceWrong?'<span class="outcome">×</span>':''}</button>`;
    }).join('');
    const reveal=answered?`<section class="answer-reveal" id="answerReveal" aria-label="答题解析"><div class="answer-banner"><span class="answer-status ${correct?'':'incorrect'}">${correct?'✓':'×'}</span><div class="answer-head"><strong>${correct?'答对了，继续保持！':'还差一点，记住这个考点'}</strong><small>正确答案：${'ABCD'[q.correct]} · ${E(q.options[q.correct])}</small></div></div><div class="quote-card"><div class="quote-header">📖 &nbsp;标准原文依据 <span>${E(q.category)} / ${E(q.subcat)} · 第 ${q.page} 页</span></div><p>“${E(q.sourceText)}”</p><div class="quote-footer"><span class="quote-score">${q.sourceScore?E(q.sourceScore):'扣分原则'}</span><a href="${pdf(q.page)}" target="_blank" rel="noopener">查看 PDF 第 ${q.page} 页 ↗</a></div></div><div class="question-actions"><button class="btn btn-outline" data-retry="true">↺ &nbsp;再答一次</button><button class="btn btn-primary" data-next="true">${session.index===session.ids.length-1?'查看练习报告':'下一题'} &nbsp; →</button></div></section>`:'';
    const bookmark=!!progress.bookmarks[q.id];
    return `<div class="session-label">◈ &nbsp;${E(quizName())} <span style="color:#cac9d5">/</span> ${E(q.subcat)}</div><div class="page-heading"><h1>${E(quizName())}</h1><p>选择你认为正确的答案，系统会立即反馈，并展示标准原文。</p></div><div class="practice-layout"><div class="question-card"><div class="question-top"><div class="question-topline"><div class="quiz-meta"><span class="tag">${E(q.subcat)}</span><span class="tag ${q.tag==='重点易错'?'amber':''}">${E(q.tag)}</span></div><button class="bookmark-btn ${bookmark?'saved':''}" data-bookmark="${q.id}" title="${bookmark?'取消收藏':'收藏这道题'}" aria-label="${bookmark?'取消收藏':'收藏这道题'}">${bookmark?'★':'☆'}</button></div><h2>${E(q.stem)}</h2><div class="question-subtitle"><span>单项选择题 · 请选择一个答案</span><span class="quiz-index">QUESTION ${String(session.index+1).padStart(2,'0')} / ${session.ids.length}</span></div></div><div class="option-list">${choices}</div>${reveal}</div><aside class="quiz-sidebar"><div class="module-card"><h3>本轮练习进度</h3><div class="mini-label">当前进度</div><div class="big-progress">${session.index+1} <span>/ ${session.ids.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round((session.index+(answered?1:0))/session.ids.length*100)}%"></div></div><div class="detail-row"><span>本轮答对</span><strong>${session.correct} 题</strong></div><div class="detail-row"><span>本轮答错</span><strong>${session.wrong} 题</strong></div></div><div class="module-card"><h3>随时回到学习原文</h3><p class="quiz-side-note">这里的题目依据原始文件编制。请以展开的原文解析为依据，注意“情节较轻”“按课时”等限定条件。</p><button class="btn btn-soft" data-nav="learn">打开知识点总览 ↗</button></div><div class="module-card"><h3>快捷答题</h3><p class="quiz-side-note">电脑可使用 <span class="kbd-key">1</span><span class="kbd-key">2</span><span class="kbd-key">3</span><span class="kbd-key">4</span> 选择选项；答完按 <span class="kbd-key">Enter</span> 进入下一题。</p></div></aside></div>`;
  }
  function finish(){
    const n=session.ids.length;const rate=n?Math.round(session.correct/n*100):0;
    return `<div class="page-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> SESSION COMPLETED</span><h1>本轮训练已完成</h1><p>这一轮的作答表现已经计入浏览器学习记录。</p></div><div class="finish-panel"><div class="finish-trophy">${rate>=80?'🏆':rate>=60?'✨':'📘'}</div><h1>恭喜完成 ${n} 道练习</h1><p>${rate>=80?'掌握得不错，继续复习细节和例外条款。':'别急，查看错题并结合原文继续巩固即可。'}</p><div class="finish-stats"><div class="finish-stat"><strong>${rate}%</strong><small>本轮正确率</small></div><div class="finish-stat"><strong>${session.correct}</strong><small>回答正确</small></div><div class="finish-stat"><strong>${session.wrong}</strong><small>回答错误</small></div></div><div class="finish-actions"><button class="btn btn-outline" data-nav="home">返回学习首页</button><button class="btn btn-soft" data-start="wrong">错题重练（${count('wrong')}）</button><button class="btn btn-primary" data-start="${E(session.mode)}" data-filter="${E(session.filter)}">再来一轮 ↗</button></div></div>`;
  }
  function study(){
    return `<div class="learn-headbar"><div class="page-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> KNOWLEDGE LIBRARY · ORIGINAL TEXT</span><h1>标准原文 · 知识点学习</h1><p>把三页标准整理为可检索的知识卡片，逐条标注原始序号、扣分和页码。</p></div><a class="btn btn-outline" href="standard.pdf" target="_blank" rel="noopener">↗ &nbsp;查看原始 PDF</a></div>
    <div class="study-note"><div>✦ &nbsp;<strong>原文学习说明</strong> &nbsp;收录宿舍内务 15 条、行为规范 75 条、校级处分 5 条及备注 4 条。原表标注宿舍内务（0.4）、行为规范（0.6）；点击各模块可展开或折叠，并支持关键词搜索。</div><span style="white-space:nowrap">SOURCE · 3 PAGES</span></div>
    <div class="learning-toolbar"><div class="filters">${['全部','宿舍内务','行为规范','校级处分','扣分原则'].map(s=>`<button class="filter-chip ${studyCategory===s?'active':''}" data-studycat="${s}">${s}</button>`).join('')}</div><label class="search-box"><input id="studySearch" type="search" placeholder="搜索：迟到、警服、熄灯..." value="${E(studySearch)}" autocomplete="off" aria-label="搜索知识点"></label></div><div class="learn-summary" id="studySummary"></div><div id="studyList"></div>`;
  }
  function renderStudyList(){
    const el=document.getElementById('studyList');if(!el)return;
    const rows=[...db.rules,...db.notes].filter(r=>(studyCategory==='全部'||r.category===studyCategory)&&[r.text,r.score||'',r.subcat,r.category].join(' ').toLowerCase().includes(studySearch.toLowerCase().trim()));
    document.getElementById('studySummary').textContent=`找到 ${rows.length} / 99 条原文条目`;
    if(!rows.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">⌕</div><h2>没有找到匹配内容</h2><p>试试其他关键词，或切换上方的知识分类。</p></div>';return;}
    const groups=[];
    rows.forEach(r=>{let grp=groups.find(g=>g.title===r.subcat);if(!grp){grp={title:r.subcat,category:r.category,rows:[]};groups.push(grp)}grp.rows.push(r);});
    el.innerHTML=groups.map((g,gi)=>`<details class="group-details" ${groups.length<9||!!studySearch||gi===0?'open':''}><summary><div><h3>${E(g.title)} <small>${E(g.category)} · ${g.rows.length} 条</small></h3></div><span class="rotate">›</span></summary>${g.rows.map(r=>`<div class="rule-row"><span class="rule-num">${r.number?String(r.number).padStart(2,'0'):r.id}</span><div class="rule-desc"><strong>${E(r.category)} / ${E(r.subcat)}</strong><p>${E(r.text)}</p><a href="${pdf(r.page)}" target="_blank" rel="noopener">原始文件第 ${r.page} 页 ↗</a></div>${r.score?`<span class="score-pill ${r.score.includes('-3')||r.score.includes('-4')||r.score.includes('-6')||r.score.includes('-8')||r.score.includes('-10')?'important':''}">${E(r.score)}</span>`:''}</div>`).join('')}</details>`).join('');
  }
  function render({scroll=true}={}){
    if(view==='home')main.innerHTML=home();
    else if(view==='learn'){main.innerHTML=study();renderStudyList();}
    else main.innerHTML=quiz();
    syncNav();
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  function choose(n){
    if(!session||session.index>=session.ids.length||session.answer!==null)return;
    const q=qById.get(session.ids[session.index]);if(!q||n<0||n>3)return;
    session.answer=n;
    progress.attempts++;
    if(n===q.correct){progress.correctAttempts++;progress.solved[q.id]=true;delete progress.wrong[q.id];}
    else{progress.wrong[q.id]=true;}
    session.results[q.id]=(n===q.correct);
    session.correct=Object.values(session.results).filter(Boolean).length;
    session.wrong=Object.values(session.results).filter(x=>!x).length;
    save();render({scroll:false});
    setTimeout(()=>{const reveal=document.getElementById('answerReveal');if(reveal){const rect=reveal.getBoundingClientRect();if(rect.bottom>window.innerHeight-80)reveal.scrollIntoView({behavior:'smooth',block:'nearest'});}},120);
  }
  function next(){if(!session||session.answer===null)return;session.index++;session.answer=null;render();}
  function retry(){if(!session||session.answer===null)return;session.answer=null;render({scroll:false});notify('题目已重置，再挑战一次');}
  function bookmark(id){if(!qById.has(id))return;if(progress.bookmarks[id]){delete progress.bookmarks[id];notify('已取消收藏');}else{progress.bookmarks[id]=true;notify('已加入收藏夹 ☆');}save();render({scroll:false});}
  function settings(){
    const layer=document.getElementById('modalLayer');layer.hidden=false;
    layer.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><h2 id="modalTitle">学习记录与设置</h2><p>当前共有 ${db.questions.length} 道题、${db.rules.length} 条标准与 ${db.notes.length} 条备注。<br>答题、错题和收藏记录保存在<strong>当前浏览器</strong>，不会上传服务器。清除浏览器网站数据、使用隐私模式或更换设备后，记录可能丢失。</p><div class="detail-row"><span>历史累计作答</span><strong>${progress.attempts} 次</strong></div><div class="detail-row"><span>已掌握题目</span><strong>${count('solved')} 道</strong></div><div class="detail-row"><span>待重练错题</span><strong>${count('wrong')} 道</strong></div><div class="modal-actions"><button class="btn btn-outline" data-closemodal="1">关闭</button><button class="btn btn-soft" data-reset="1">清空全部学习记录</button></div></div>`;
    layer.addEventListener('click',ev=>{if(ev.target===layer)closeModal();},{once:true});
  }
  function closeModal(){const layer=document.getElementById('modalLayer');layer.hidden=true;layer.innerHTML='';}
  function reset(){if(!confirm('确定清空所有学习进度、错题记录和收藏吗？此操作无法撤销。'))return;progress=defaults();session=null;save();closeModal();navigate('home');notify('已清空本机的学习记录');}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a[data-nav]');if(!b)return;
    if(b.dataset.nav){e.preventDefault();navigate(b.dataset.nav);return;}
    if('start' in b.dataset){e.preventDefault();startSession(b.dataset.start,b.dataset.filter||'');return;}
    if('choice' in b.dataset){choose(Number(b.dataset.choice));return;}
    if('bookmark' in b.dataset){bookmark(b.dataset.bookmark);return;}
    if('next' in b.dataset){next();return;}
    if('retry' in b.dataset){retry();return;}
    if('studycat' in b.dataset){studyCategory=b.dataset.studycat;render();return;}
    if('closemodal' in b.dataset){closeModal();return;}
    if('reset' in b.dataset){reset();return;}
  });
  document.addEventListener('input',e=>{if(e.target.id==='studySearch'){studySearch=e.target.value;renderStudyList();}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeModal();return;}
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(!document.getElementById('modalLayer').hidden)return;
    if(!['practice','wrong','saved'].includes(view)||!session)return;
    if(session.answer===null&&/^[1-4]$/.test(e.key)){choose(Number(e.key)-1);e.preventDefault();}
    else if(session.answer!==null&&e.key==='Enter'){next();e.preventDefault();}
  });
  document.getElementById('settingsButton').addEventListener('click',settings);
  render();
})();