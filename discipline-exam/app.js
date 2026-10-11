/* 南京警察学院学生违纪行为处理标准 · 独立学习工具
 * 不依赖后端、第三方 JS 或远程接口。所有题目与原文均在 data.js 中。
 */
(() => {
'use strict';
const DATA = window.STUDY_DATA;
const RULES = DATA.rules;
const NOTES = DATA.notes;
const PDF_FILE = '南京警察学院学生违纪行为处理标准.pdf';
const STORAGE_KEY = 'discipline-lab-progress-v1';
const chapters = [{id:'all',label:'全部章节'},{id:'dorm',label:'宿舍内务'},{id:'behavior',label:'行为规范'},{id:'sanction',label:'校级处分'},{id:'notes',label:'扣分备注'}];
const quickPoints = [
  {label:'旷课按「课时」扣分',key:'旷课',rule:'behavior-04'},
  {label:'超假与晚归的时间界限',key:'30 分钟',rule:'behavior-08'},
  {label:'晚归与逃寝如何区分',key:'熄灯半小时',rule:'behavior-44'},
  {label:'警容风纪容易混淆的规定',key:'着警服时穿浅色袜子',rule:'behavior-14'},
  {label:'违纪行为的扣分原则',key:'',rule:'note-2'}
];
const specialQuestions = [
  {id:'sp-01',rid:'behavior-04',text:'按照标准，旷课的扣分是以什么为单位计算的？',choices:['每次','每课时','每天','每周'],answer:'每课时'},
  {id:'sp-02',rid:'behavior-08',text:'擅自超假达到多长时间及以上，符合该条所列情形？',choices:['10分钟','20分钟','30分钟','60分钟'],answer:'30分钟'},
  {id:'sp-03',rid:'behavior-11',text:'标准对女生穿非制式皮鞋的鞋跟高度提出了什么要求？',choices:['不得高于3cm','不得高于4cm','不得高于5cm','不得高于6cm'],answer:'不得高于4cm'},
  {id:'sp-04',rid:'behavior-03',text:'按照课堂管理条款，哪种课堂电子产品使用情形被明确列为例外？',choices:['学生自行决定使用','只要不玩游戏即可','因教学需要老师要求使用','只要坐在后排即可'],answer:'因教学需要老师要求使用'},
  {id:'sp-05',rid:'behavior-43',text:'无正当理由晚归一项中，原文注明的时间界限是哪一项？',choices:['熄灯前半小时','熄灯半小时之内','熄灯后一小时','熄灯后两小时'],answer:'熄灯半小时之内'},
  {id:'sp-06',rid:'behavior-44',text:'逃寝一项中，原文对检查时间与情形如何表述？',choices:['晚点名前不在宿舍','熄灯半小时之后检查不在宿舍','午休时不在宿舍','熄灯之前不在宿舍'],answer:'熄灯半小时之后检查不在宿舍'},
  {id:'sp-07',rid:'behavior-39',text:'单人行进中接听电话，按原文要求应如何操作？',choices:['边走边接','站停接听电话','开免提接听','直接挂断'],answer:'站停接听电话'},
  {id:'sp-08',rid:'behavior-39',text:'在多人队列中行进间有电话，按原文应如何操作？',choices:['在队伍中边走边接','离开队列，原地接听电话','由同学帮忙接听','直接在队伍中停下'],answer:'离开队列，原地接听电话'},
  {id:'sp-09',rid:'behavior-12',text:'警服扣子未系的列举情形中，原文特别注明不含什么？',choices:['领带夹','风纪扣','袖扣','纽扣'],answer:'风纪扣'},
  {id:'sp-10',rid:'behavior-03',text:'上课观看视频时，原文特别注明哪类视频除外？',choices:['娱乐短视频','与学习相关的视频','无声音视频','下载到本地的视频'],answer:'与学习相关的视频'},
  {id:'sp-11',rid:'behavior-53',text:'集体活动违规携带明令禁止的物品，原文规定造成不良影响或实际后果的如何处理？',choices:['不再处理','只口头提醒','给予处分','一律扣1分'],answer:'给予处分'},
  {id:'sp-12',rid:'behavior-75',text:'一般违纪行为情节轻微、危害不大时，标准允许根据后果和认错情况扣多少分？',choices:['1分或2分','2分或3分','3分或4分','统一扣1分'],answer:'2分或3分'},
  {id:'sp-13',rid:'behavior-17',text:'警容风纪一项中，佩戴有色眼镜的例外情况是什么？',choices:['参加集体活动','眼疾','雨雪天气','在宿舍内'],answer:'眼疾'},
  {id:'sp-14',rid:'behavior-22',text:'在校园内逗、喂、收留、饲养、接触流浪猫狗等动物按该条扣几分？',choices:['-1 分/次','-2 分/次','-3 分/次','不扣分'],answer:'-2 分/次'}
];
const noteQuizzes = [
  {id:'note-1',text:'根据标准备注，对同一个违纪行为应当怎样扣分？',choices:['不同人员可以多次扣分','只给予一次扣分，不得重复扣分','每条标准分别扣分','按次数累加扣分'],answer:'只给予一次扣分，不得重复扣分'},
  {id:'note-2',text:'同一行为符合两条以上扣分标准时，原文要求怎样处理？',choices:['将各项扣分叠加','按照最低分值扣分','按照最高分值扣分','一律不扣分'],answer:'按照最高分值扣分'},
  {id:'note-3',text:'关于集体违规违纪，下列哪项与标准备注一致？',choices:['一律只扣集体不扣个人','只能扣全体成员相同分数','可对主要责任人扣分，也可按实际分别通报集体和扣分个人','集体违规不处理'],answer:'可对主要责任人扣分，也可按实际分别通报集体和扣分个人'},
  {id:'note-4',text:'未尽扣分内容及标准，由哪个部门研究确定？',choices:['学生工作部门','任课教师个人','班委会','学生本人'],answer:'学生工作部门'}
];
const ruleIndex = new Map(RULES.map(r=>[r.id,r]));
function hash(s){let a=2166136261;for(let i=0;i<s.length;i++)a=(Math.imul(a^s.charCodeAt(i),16777619))>>>0;return a;}
function permute(array,key){const arr=[...array];let z=hash(key);for(let i=arr.length-1;i>0;i--){z=(Math.imul(1664525,z)+1013904223)>>>0;let j=z%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function scoreOptions(r){
 if(r.id==='behavior-75')return permute(['-1 分/次','-2 分/次','-3 分/次','扣2或3分'],'s'+r.id);
 if(r.part==='sanction'){
  const options=['-3 分/次','-4 分/次','-6 分/次','-8 分/次','-10 分/次'];
  const removed=options.filter(v=>v!==r.score)[hash(r.id)%(options.length-1)];
  return permute(options.filter(v=>v!==removed),r.id);
 }
 let options=['-1 分/次','-2 分/次','-3 分/次','-4 分/次'];
 if(!options.includes(r.score)){options=['-1 分/次','-2 分/次','-2 分/课时','-3 分/次'];}
 return permute(options,r.id);
}
const QUESTIONS=[
 ...RULES.map(r=>({id:'q-'+r.id,ruleId:r.id,chapter:r.chapter,section:r.section,scope:r.part,type:'score',
  title:r.part==='sanction'?`校级处分「${r.content}」对应的扣分标准是？`:'根据《标准》，下列行为对应的扣分标准是？',
  excerpt:r.content,choices:scoreOptions(r),answer:r.score,origin:r.content,reference:`第${r.page}页 · ${r.chapter} / ${r.section} · 序号${r.n}`})),
 ...noteQuizzes.map((q,i)=>({id:q.id,ruleId:q.id,chapter:'扣分备注',section:'扣分原则',scope:'notes',type:'note',title:q.text,
  excerpt:'请根据原文备注作答。',choices:permute(q.choices,q.id),answer:q.answer,origin:NOTES[i],reference:`第3页 · 备注第${i+1}条`})),
 ...specialQuestions.map(s=>{const r=ruleIndex.get(s.rid);return {id:s.id,ruleId:r.id,chapter:r.chapter,section:r.section,scope:r.part,type:'detail',title:s.text,excerpt:'考查条款中的具体条件和例外情形。',choices:permute(s.choices,s.id),answer:s.answer,origin:r.content,reference:`第${r.page}页 · ${r.chapter} / ${r.section} · 序号${r.n}`};})
];
const questionIndex=new Map(QUESTIONS.map(q=>[q.id,q]));
const navItems=[{id:'home',icon:'grid',label:'学习总览'},{id:'quiz',icon:'target',label:'专项刷题'},{id:'wrong',icon:'error',label:'错题重练'},{id:'favorites',icon:'star',label:'我的收藏'},{id:'study',icon:'book',label:'知识点学习'}];
const pageTitles={home:'学习总览',quiz:'专项刷题',wrong:'错题重练',favorites:'我的收藏',study:'知识点学习'};
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico=(id)=>`<svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
function emptyProgress(){return {version:1,answers:{},wrong:[],saved:[]};}
function readProgress(){try{let x=JSON.parse(localStorage.getItem(STORAGE_KEY));if(x&&typeof x==='object'&&x.answers&&Array.isArray(x.wrong)&&Array.isArray(x.saved))return x;}catch(_e){}return emptyProgress();}
let progress=readProgress();
const saveProgress=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch(_e){toast('浏览器无法保存学习记录，请检查隐私模式或存储空间');}};
let state={view:'home',session:null,studyChapter:'all',studySearch:'',quizScope:'all',quizOrder:'random',settingsOpen:false};
let toastTimer;
function toast(msg){let el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function stats(){let attempted=Object.keys(progress.answers).filter(k=>questionIndex.has(k)).length;let count=0,right=0;for(let rec of Object.values(progress.answers)){if(!rec||typeof rec!=='object')continue;count+=Number(rec.count)||0;right+=Number(rec.correct)||0;}return {attempted,count,right,accuracy:count?Math.round(right/count*100):0,wrong:progress.wrong.filter(k=>questionIndex.has(k)).length,saved:progress.saved.filter(k=>questionIndex.has(k)).length};}
function countByPart(part){return RULES.filter(r=>r.part===part).length;}
function updateNav(){let a=stats();const html=(mobile=false)=>navItems.map(v=>{
 const count=v.id==='wrong'?a.wrong:v.id==='favorites'?a.saved:null;
 return `<button type="button" class="${mobile?'bottom-link':'side-link'} ${state.view===v.id?'active':''}" data-action="goto" data-view="${v.id}" aria-current="${state.view===v.id?'page':'false'}">${ico(v.icon)}<span>${mobile?({home:'首页',quiz:'刷题',wrong:'错题',favorites:'收藏',study:'原文'}[v.id]):v.label}</span>${count>0&&!mobile?`<small class="nav-count">${count}</small>`:''}</button>`;
 }).join('');$('#side-nav').innerHTML=html();$('#bottom-nav').innerHTML=html(true);$('#crumb-title').textContent=pageTitles[state.view];document.title=`${pageTitles[state.view]} · 督察备考`;
}
function navigate(view){if(!pageTitles[view])view='home';state.view=view;state.settingsOpen=false;if(view==='quiz'&&!state.session)begin('all','random');else render();window.scrollTo({top:0,behavior:'instant'});}
function setHash(view){if(location.hash!==`#${view}`)history.replaceState(null,'',`#${view}`);}
function syncViewState(){const immersive=state.view==='quiz';document.body.dataset.view=state.view;document.body.classList.toggle('quiz-immersive',immersive);document.body.classList.toggle('quiz-active',immersive&&!!(state.session&&state.session.questions[state.session.index]));}
function render(){updateNav();setHash(state.view);syncViewState();let main=$('#main');
 if(state.view==='home')main.innerHTML=renderHome();
 if(state.view==='quiz')main.innerHTML=renderQuiz();
 if(state.view==='wrong')main.innerHTML=renderCollection('wrong');
 if(state.view==='favorites')main.innerHTML=renderCollection('saved');
 if(state.view==='study'){main.innerHTML=renderStudy();renderStudyList();}
}
function cardStat(label,value,caption,icon,color){return `<article class="stat-card"><div class="stat-upper"><span>${label}</span><span class="stat-icon ${color}">${ico(icon)}</span></div><strong class="stat-value">${value}</strong><span class="stat-foot">${caption}</span></article>`;}
function renderHome(){const s=stats();const total=QUESTIONS.length;const ratio=Math.round(s.attempted/total*100);
const content=[{id:'dorm',icon:'🛏️',label:'宿舍内务',num:15,desc:'床铺、地面、阳台与卫生间',color:'sage'},
{id:'behavior',icon:'🛡️',label:'行为规范',num:75,desc:'课堂、警容、安全与日常纪律',color:'blue'},
{id:'sanction',icon:'⚖️',label:'校级处分',num:5,desc:'通报批评到留校察看',color:'peach'},
{id:'notes',icon:'📌',label:'扣分原则',num:4,desc:'不重复扣分、最高分值等备注',color:'violet'}];
const used=r=>QUESTIONS.filter(q=>q.scope===r).filter(q=>progress.answers[q.id]).length;
return `<div class="page-enter">
<section class="hero"><div class="hero-copy"><span class="hero-tag">${ico('sparkle')} 督察考试 · 自主备考系统</span><h1>把校纪校规，<br/><em>练成条件反射。</em></h1><p>基于原始文件逐条整理 · 选择题即时反馈 · 每道题均可回查原文</p><div class="hero-actions"><button type="button" class="btn btn-mint" data-action="start" data-scope="all" data-order="random">${ico('target')} 开始随机刷题 ${ico('arrow')}</button><button type="button" class="btn btn-transparent" data-action="start" data-scope="all" data-order="sequential">${ico('book')} 顺序刷题</button></div></div><div class="hero-art"><span class="orb-dot"></span><div class="orb">${ico('shield')}</div><span class="orb-dot d2"></span></div></section>
<section class="stats" aria-label="学习统计">${cardStat('题库总量',total,'覆盖全部95条标准及备注','book','')}${cardStat('已练题目',s.attempted,`题库覆盖 ${ratio}%`,'check','green')}${cardStat('作答正确率',s.accuracy+'%',s.count?`累计作答 ${s.count} 次`:'开始第一次练习吧','target','purple')}${cardStat('待复习错题',s.wrong,'答对后自动移出','repeat','orange')}</section>
<div class="section-head"><div><span class="section-overline">LEARNING MODULES</span><h2>按知识模块开始</h2></div><button type="button" class="section-link" data-action="goto" data-view="study">完整知识点 ${ico('arrow')}</button></div>
<div class="study-grid">${content.map(x=>`<button type="button" class="study-card" data-action="start" data-scope="${x.id}" data-order="random"><div class="study-glyph ${x.color}">${x.icon}</div><strong>${x.label}</strong><p>${x.desc}</p><div class="study-card-end"><span>${x.num} 条内容</span>${ico('arrow')}</div></button>`).join('')}</div>
<div class="home-columns"><section class="panel"><div class="panel-heading"><h3>你的学习进度</h3><span>实时保存在本机</span></div><div class="progress-summary"><div class="progress-ring" style="--p:${ratio}%"><div class="progress-ring-inner"><strong>${ratio}%</strong><span>题库覆盖</span></div></div><div class="progress-lines">${[{id:'dorm',n:'宿舍内务',total:15,cls:'mint'},{id:'behavior',n:'行为规范',total:75,cls:''},{id:'sanction',n:'校级处分',total:5,cls:'purple'}].map(x=>{let done=used(x.id);return `<div class="progress-line"><div class="progress-line-top"><span>${x.n}</span><strong>${done} / ${x.total}</strong></div><div class="track"><i class="${x.cls}" style="width:${done/x.total*100}%"></i></div></div>`}).join('')}</div></div></section>
<section class="panel"><div class="panel-heading"><h3>高频易混 · 重点速记</h3><span>点按查看原文</span></div><div class="keypoint-list">${quickPoints.map(x=>`<button type="button" class="keypoint-row" data-action="focus-rule" data-key="${escapeHTML(x.key)}" data-rid="${x.rule}"><span class="keypoint-mark">${ico('file')}</span><span>${x.label}</span>${ico('chevron')}</button>`).join('')}</div></section></div>
<section class="tools-row"><p>换手机或清除浏览器数据之前，建议先导出学习记录备份。</p><div class="action-row"><button type="button" class="btn btn-outline" data-action="export">导出学习记录</button><button type="button" class="btn btn-outline" data-action="import">恢复学习记录</button></div></section></div>`;
}
function scopePool(scope){if(scope==='all')return [...QUESTIONS];if(scope==='notes')return QUESTIONS.filter(q=>q.scope==='notes');return QUESTIONS.filter(q=>q.scope===scope||q.section===scope);}
function shuffled(a){let arr=[...a];for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function begin(scope='all',order='random',poolType='all',ids){
 const q=ids?ids.map(id=>questionIndex.get(id)).filter(Boolean):poolType==='wrong'?progress.wrong.map(id=>questionIndex.get(id)).filter(Boolean):poolType==='saved'?progress.saved.map(id=>questionIndex.get(id)).filter(Boolean):scopePool(scope);
 const collection=order==='random'?shuffled(q):q;
 state.session={questions:collection.map(v=>v.id),index:0,answers:{},poolType,order,scope};state.quizScope=scope;state.quizOrder=order;state.settingsOpen=false;state.view='quiz';render();window.scrollTo({top:0,behavior:'instant'});
}
function startFocused(id){begin('all','sequential','single',[id]);}
function highlightExcerpt(text){
 return escapeHTML(text).replace(/情节轻微、危害不大|根据后果和认错情况扣\s*2\s*或\s*3\s*分|熄灯半小时(?:之内|之后)|30\s*分钟及以上|每课时|不得高于\s*4cm|眼疾除外/g,
  match=>`<mark class="rule-mark">${match}</mark>`);
}
function inlineFeedback(q,rec){
 return '<div class="inline-result '+(rec.correct?'is-right':'is-wrong')+'"><span class="inline-result-icon">'+ico(rec.correct?'check':'x')+'</span><span>'+(rec.correct?'回答正确':'回答错误')+'</span><span class="inline-result-answer">正确答案：<strong>'+escapeHTML(q.answer)+'</strong></span></div>'
  +'<div class="origin-footnote"><span class="origin-label">原文注释 · '+escapeHTML(q.reference)+'</span><p>'+escapeHTML(q.origin)+'</p></div>';
}
function questionView(q,rec){return `<div class="question-header"><div class="question-tags"><span class="tag">${escapeHTML(q.chapter)}</span><span class="tag light">${escapeHTML(q.section)}</span></div><button type="button" class="favorite-icon-btn ${progress.saved.includes(q.id)?'saved':''}" data-action="favorite" data-qid="${q.id}" aria-label="${progress.saved.includes(q.id)?'取消收藏':'收藏本题'}" title="收藏本题">${ico('star')}</button></div>
<div class="question-type"><span class="type-dot"></span>${q.type==='score'?'扣分标准 · 单选题':q.type==='detail'?'细节辨析 · 单选题':'备注理解 · 单选题'}</div><h2 class="question-title">${escapeHTML(q.type==='score'&&q.scope!=='sanction'?'下列行为应扣几分？':q.title)}</h2>${q.type==='score'?`<div class="question-excerpt ${q.ruleId==='behavior-75'?'featured-rule':''}"><div class="rule-label">${ico('book')} <span>本题考查条款</span></div><div class="rule-content" id="rule-content">${highlightExcerpt(q.excerpt)}</div>${q.excerpt.length>88?`<button class="rule-more" type="button" data-action="expand-rule" aria-expanded="false" aria-controls="rule-content">展开完整条款 ${ico('chevron')}</button>`:''}</div>`:``}
<div class="question-answers">${q.choices.map((choice,i)=>{
 const chosen=rec&&rec.choice===i,correct=rec&&q.answer===choice;
 const classes=rec?(correct?'right':chosen?'wrong':'dim'):'';
 const marker=rec&&correct?ico('check'):rec&&chosen?ico('x'):'';
 return `<button type="button" class="option ${classes}" data-action="answer" data-opt="${i}" ${rec?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span class="option-text">${escapeHTML(choice)}</span>${marker}</button>`;
 }).join('')}</div>
<div class="inline-feedback ${rec?'revealed':''}" id="inline-feedback" role="status" aria-live="polite" aria-atomic="true"><div class="inline-feedback-inner">${rec?inlineFeedback(q,rec):''}</div></div>`;}
function renderQuiz(){const s=state.session;if(!s)return '';const qid=s.questions[s.index];const q=questionIndex.get(qid);
if(!q){return `<div class="page-enter"><div class="quiz-end"><div class="end-emoji">${s.questions.length?'🎉':'📭'}</div><h2>${s.questions.length?'本轮练习完成！':'这里还没有题目'}</h2><p>${s.questions.length?'本轮题目已全部练习。答错的题会保留在错题本，重做正确后自动移出。':s.poolType==='wrong'?'暂时没有错题。先做几道题，再回来巩固吧。':s.poolType==='saved'?'还没有收藏题目，刷题时点击星标即可收藏。':'换一个知识模块试试。'}</p><div class="end-stats"><div><strong>${s.questions.length}</strong><span>本轮题量</span></div><div><strong>${Object.values(s.answers).filter(v=>v.correct).length}</strong><span>答对题数</span></div></div><div class="action-row" style="justify-content:center"><button class="btn btn-primary" data-action="start" data-scope="all" data-order="random">再刷一轮 ${ico('arrow')}</button><button class="btn btn-outline" data-action="goto" data-view="home">返回总览</button></div></div></div>`;}
const rec=s.answers[qid];const pct=Math.round((s.index+(rec?1:0))/s.questions.length*100);
return `<div class="question-surface exam-layout page-enter">
<header class="exam-header">
<div class="exam-header-row"><button class="exam-exit" data-action="goto" data-view="home">${ico('back')} 退出</button><span class="exam-position"><strong>${String(s.index+1).padStart(2,'0')}</strong><span>/ ${s.questions.length}</span></span><button class="exam-chapters ${state.settingsOpen?'active':''}" data-action="toggle-settings" aria-expanded="${state.settingsOpen}" aria-controls="exam-settings">${ico('filter')} 章节</button></div>
<div class="exam-header-detail"><span class="exam-category">${escapeHTML(q.chapter)}<span class="exam-dot">·</span>${escapeHTML(q.section)}</span><span class="exam-mode">${s.poolType==='wrong'?'错题重练':s.poolType==='saved'?'收藏复习':s.poolType==='single'?'单题练习':s.order==='random'?'随机练习':'顺序练习'}</span></div><div class="exam-progress" role="progressbar" aria-valuenow="${s.index+1}" aria-valuemin="1" aria-valuemax="${s.questions.length}"><span style="width:${pct}%"></span></div>
<div class="exam-settings" id="exam-settings" ${state.settingsOpen?'':'hidden'}><label for="quiz-select">选择新的练习章节</label><div class="action-row"><select class="filter-box" id="quiz-select" aria-label="选择刷题章节">${chapters.map(x=>`<option value="${x.id}" ${x.id===state.quizScope?'selected':''}>${x.label}</option>`).join('')}${[...new Set(RULES.map(r=>r.section))].filter(a=>a!=='校级处分').map(sec=>`<option value="${escapeHTML(sec)}" ${sec===state.quizScope?'selected':''}>${escapeHTML(sec)}</option>`).join('')}</select><button class="btn btn-primary" data-action="restart-scope">切换章节</button></div></div>
</header><div class="exam-scroll" id="exam-scroll"><section class="question-card" aria-label="当前题目">${questionView(q,rec)}</section></div><nav class="exam-bottom" aria-label="答题导航"><button class="exam-prev" data-action="previous" ${s.index===0?'disabled':''}>${ico('back')} 上一题</button><button class="exam-next" data-action="next">${s.index===s.questions.length-1?'完成本轮':'下一题'} ${ico('arrow')}</button></nav></div>`
}
function renderCollection(type){let ids=type==='wrong'?progress.wrong:progress.saved;const entries=ids.map(id=>questionIndex.get(id)).filter(Boolean);const wrong=type==='wrong';
return `<div class="page-enter"><div class="page-heading"><div><span class="section-overline">PERSONAL NOTEBOOK</span><h1>${wrong?'错题重练':'我的收藏'}</h1><p>${wrong?'做错自动记录；在错题训练中答对后，题目将自动移出错题本。':'在做题时点击星标，即可把重点题目留在这里。'} 当前 ${entries.length} 题。</p></div>${entries.length?`<button class="btn btn-primary" data-action="start-collection" data-type="${type}">${ico('target')} ${wrong?'开始错题重练':'复习所有收藏'}</button>`:''}</div>
${entries.length?`<div class="collection-list">${entries.map(q=>`<article class="collection-card"><div class="collection-content"><div class="collection-heading"><span class="tag">${escapeHTML(q.chapter)}</span><span>${escapeHTML(q.section)}</span></div><strong>${escapeHTML(q.title)} ${q.type==='score'?'「'+escapeHTML(q.excerpt.length>90?q.excerpt.slice(0,90)+'…':q.excerpt)+'」':''}</strong><div class="collection-footer">${escapeHTML(q.reference)}</div></div><div class="collection-actions"><button class="mini-btn" data-action="focus-question" data-qid="${q.id}">再做这题</button><button class="mini-btn remove" data-action="remove-${type}" data-qid="${q.id}">${wrong?'移出':'取消收藏'}</button></div></article>`).join('')}</div>`:renderEmpty(wrong?'✅':'⭐',wrong?'没有待复习的错题':'收藏夹还是空的',wrong?'所有错题已经掌握，或还没有作答。继续挑战，保持状态。':'看到想重点记忆的条款，就在题目右上角点一下星标。','开始随机刷题')}
${entries.length?`<div class="tools-row"><p>学习记录会保存在当前浏览器中；清除浏览器数据后可能丢失。</p><div class="action-row"><button class="btn btn-outline" data-action="export">导出学习记录</button></div></div>`:''}</div>`;}
function renderEmpty(symbol,title,description,button){return `<div class="empty"><div><div class="empty-illustration">${symbol}</div><h3>${title}</h3><p>${description}</p><button class="btn btn-primary" data-action="start" data-scope="all" data-order="random">${button} ${ico('arrow')}</button></div></div>`;}
function renderStudy(){return `<div class="page-enter"><div class="page-heading"><div><span class="section-overline">KNOWLEDGE LIBRARY</span><h1>校纪校规 · 原文学习</h1><p>涵盖宿舍内务15条、行为规范75条、校级处分5项及4条备注。按 PDF 顺序整理。</p></div><div class="page-tools"><label class="search-box">${ico('search')}<input type="search" id="study-search" value="${escapeHTML(state.studySearch)}" placeholder="搜索条款、关键词或扣分…" autocomplete="off" aria-label="搜索原文" /></label></div></div>
<div class="study-banner"><div><strong>完整条款库 · 95 项标准 + 4 项备注</strong><p>每条保留原始内容、所属项目、扣分标准及 PDF 页码。支持关键词搜索和分类速查。</p></div><button type="button" class="btn btn-outline" data-action="pdf">${ico('file')} PDF原件</button></div>
<div class="chip-row" role="group" aria-label="原文分类">${chapters.map(c=>`<button type="button" class="chip ${state.studyChapter===c.id?'active':''}" data-action="study-chapter" data-chapter="${c.id}">${c.label}</button>`).join('')}</div><p id="study-count" class="study-count"></p><div id="study-list"></div><div class="study-help">${ico('shield')} 这是基于用户所提供文件建立的自学速查工具，并非学院官方发布或更新渠道。</div></div>`;}
function renderStudyList(){const box=$('#study-list');if(!box)return;const filter=state.studyChapter;const keyword=state.studySearch.trim().toLowerCase();let records=RULES.filter(r=>filter==='all'||r.part===filter);
if(keyword)records=records.filter(r=>[r.content,r.section,r.chapter,r.score,'序号'+r.n].some(v=>String(v).toLowerCase().includes(keyword)));
const shownNotes=(filter==='all'||filter==='notes')?NOTES.map((text,i)=>({id:'note-'+(i+1),i:i+1,text})).filter(r=>!keyword||(`${r.text}备注${r.i}`).toLowerCase().includes(keyword)):[];
const groupMap=new Map();for(let r of records){const name=`${r.chapter}${r.part==='dorm'?'（0.4）':r.part==='behavior'?'（0.6）':''} · ${r.section}`;if(!groupMap.has(name))groupMap.set(name,[]);groupMap.get(name).push(r);}
let html=[...groupMap].map(([name,items],g)=>`<details class="study-section" open><summary><span class="section-icon">${items[0].part==='dorm'?'🛏':items[0].part==='sanction'?'⚖':'📖'}</span><strong>${escapeHTML(name)}</strong><small>${items.length} 条</small>${ico('chevron')}</summary>${items.map(r=>`<div class="study-record" id="study-${r.id}"><span class="study-number">${String(r.n).padStart(2,'0')}</span><div class="study-record-body"><p>${escapeHTML(r.content)}</p><span class="source-mini">PDF 第${r.page}页 · ${escapeHTML(r.section)}</span></div><span class="score-badge ${r.part==='sanction'?'green':''}">${escapeHTML(r.score)}</span></div>`).join('')}</details>`).join('');
if(shownNotes.length)html+=`<section class="study-notes" id="study-note"><h3>备注 · 扣分处理原则</h3>${shownNotes.map(r=>`<div class="note-text" id="study-note-${r.i}"><span class="note-num">${r.i}</span><span>${escapeHTML(r.text)}</span></div>`).join('')}<span class="source-mini">PDF 第3页 · 原文备注</span></section>`;
if(!records.length&&!shownNotes.length)html='<div class="empty"><div><div class="empty-illustration">🔍</div><h3>没有匹配的条款</h3><p>试试缩短关键词，或切换“全部章节”。</p></div></div>';
box.innerHTML=html;$('#study-count').textContent=`共显示 ${records.length} 项条款${shownNotes.length?` + ${shownNotes.length} 项备注`:''}`;
}
function answer(index){let s=state.session;if(!s)return;let qid=s.questions[s.index],q=questionIndex.get(qid);if(!q||s.answers[qid]||index<0||index>=q.choices.length)return;
const correct=q.choices[index]===q.answer;
s.answers[qid]={choice:index,correct};const prev=progress.answers[qid]||{count:0,correct:0};prev.count+=1;prev.correct+=Number(correct);prev.lastCorrect=correct;prev.lastAt=Date.now();progress.answers[qid]=prev;
progress.wrong=progress.wrong.filter(id=>id!==qid);if(!correct)progress.wrong.unshift(qid);
saveProgress();
const buttons=[...document.querySelectorAll('.question-answers .option')];
buttons.forEach((btn,i)=>{
 const isRight=q.choices[i]===q.answer, isPicked=i===index;
 btn.disabled=true;
 btn.classList.add(isRight?'right':isPicked?'wrong':'dim');
 if(isRight||isPicked)btn.insertAdjacentHTML('beforeend',ico(isRight?'check':'x'));
});
const feedback=$('#inline-feedback');
if(feedback){
 const inner=feedback.querySelector('.inline-feedback-inner');
 inner.innerHTML=inlineFeedback(q,s.answers[qid]);
 requestAnimationFrame(()=>feedback.classList.add('revealed'));
}
const pct=Math.round((s.index+1)/s.questions.length*100);
const bar=$('.exam-progress span')||$('.quiz-progress span');if(bar)bar.style.width=pct+'%';
}
function changeFavorite(qid){const i=progress.saved.indexOf(qid);const saved=i<0;if(i>=0){progress.saved.splice(i,1);toast('已取消收藏');}else{progress.saved.unshift(qid);toast('已加入收藏夹 ⭐');}saveProgress();if(state.view==='quiz'){const b=document.querySelector('.favorite-icon-btn');if(b){b.classList.toggle('saved',saved);b.setAttribute('aria-label',saved?'取消收藏':'收藏本题');b.title=saved?'取消收藏':'收藏本题';}return;}let y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});}
function moveQuestion(step){
 const session=state.session;if(!session)return;
 const nextIndex=Math.max(0,Math.min(session.questions.length,session.index+step));
 if(nextIndex===session.index)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const switchCard=(fallback=false)=>{session.index=nextIndex;state.settingsOpen=false;render();const viewport=$('#exam-scroll');if(viewport)viewport.scrollTop=0;window.scrollTo({top:0,behavior:'instant'});if(fallback&&!reduced)document.querySelector('.question-card')?.classList.add('question-card-enter');};
 if(!reduced&&typeof document.startViewTransition==='function')document.startViewTransition(()=>switchCard(false));
 else switchCard(true);
}
function focusRule(id,key){state.view='study';state.studyChapter='all';state.studySearch='';render();if(id.startsWith('note')){setTimeout(()=>$('#study-note-'+id.split('-')[1])?.scrollIntoView({behavior:'smooth',block:'center'}),30);return;}
const el=document.getElementById('study-'+id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});else if(key){state.studySearch=key;render();}
}
function exportProgress(){let blob=new Blob([JSON.stringify({product:'discipline-lab',savedAt:new Date().toISOString(),progress},null,2)],{type:'application/json'});let url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download=`督察备考-学习记录-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('学习记录已导出');}
function importProgress(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{try{if(!input.files?.length)return;const payload=JSON.parse(await input.files[0].text());let next=payload.progress;if(payload.product!=='discipline-lab'||!next||typeof next.answers!=='object'||!Array.isArray(next.wrong)||!Array.isArray(next.saved))throw Error('格式不正确');if(!confirm('恢复备份将覆盖当前浏览器里的学习记录，确定继续吗？'))return;
progress={version:1,answers:Object.fromEntries(Object.entries(next.answers).filter(([id,r])=>questionIndex.has(id)&&r&&typeof r==='object'&&Number.isFinite(Number(r.count))&&Number.isFinite(Number(r.correct))).map(([id,r])=>[id,{count:Math.max(0,Math.floor(Number(r.count))),correct:Math.max(0,Math.floor(Number(r.correct))),lastCorrect:Boolean(r.lastCorrect),lastAt:Number(r.lastAt)||Date.now()}])),wrong:[...new Set(next.wrong.filter(id=>questionIndex.has(id)))],saved:[...new Set(next.saved.filter(id=>questionIndex.has(id)))]};state.session=null;saveProgress();render();toast('学习记录已恢复');}catch(e){toast('恢复失败：请选择本站导出的 JSON 记录');}});input.click();}
function pdfOpen(){window.open(encodeURI(PDF_FILE),'_blank','noopener,noreferrer');}
function actionHandler(el){const action=el.dataset.action;if(!action)return;
if(action==='goto'){navigate(el.dataset.view);return;}
if(action==='start'){begin(el.dataset.scope||'all',el.dataset.order||'random');return;}
if(action==='restart-scope'){begin(state.quizScope,state.quizOrder);return;}
if(action==='answer'){answer(Number(el.dataset.opt));return;}
if(action==='toggle-settings'){state.settingsOpen=!state.settingsOpen;const panel=$('#exam-settings');const trigger=$('.exam-chapters');if(panel)panel.hidden=!state.settingsOpen;if(trigger){trigger.classList.toggle('active',state.settingsOpen);trigger.setAttribute('aria-expanded',String(state.settingsOpen));}return;}
if(action==='expand-rule'){const block=el.closest('.question-excerpt');if(block){const expanded=block.classList.toggle('expanded');el.setAttribute('aria-expanded',String(expanded));el.innerHTML=`${expanded?'收起条款':'展开完整条款'} ${ico('chevron')}`;}return;}


if(action==='previous'){moveQuestion(-1);return;}
if(action==='next'){moveQuestion(1);return;}
if(action==='favorite'){changeFavorite(el.dataset.qid);return;}
if(action==='focus-question'){startFocused(el.dataset.qid);return;}
if(action==='start-collection'){begin('all','random',el.dataset.type==='wrong'?'wrong':'saved');return;}
if(action==='remove-wrong'||action==='remove-saved'){const key=action==='remove-wrong'?'wrong':'saved';progress[key]=progress[key].filter(v=>v!==el.dataset.qid);saveProgress();render();toast(key==='wrong'?'已从错题本移出':'已取消收藏');return;}
if(action==='study-chapter'){state.studyChapter=el.dataset.chapter;render();return;}
if(action==='focus-rule'){focusRule(el.dataset.rid,el.dataset.key);return;}
if(action==='pdf'){pdfOpen();return;}
if(action==='export'){exportProgress();return;}
if(action==='import'){importProgress();return;}
}
document.addEventListener('click',e=>{let el=e.target.closest('[data-action]');if(el)actionHandler(el);});
document.addEventListener('input',e=>{if(e.target.id==='study-search'){state.studySearch=e.target.value;renderStudyList();}});
document.addEventListener('change',e=>{if(e.target.id==='quiz-select')state.quizScope=e.target.value;});
document.addEventListener('keydown',e=>{if(state.view!=='quiz'||!state.session||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
 if(/^[1-4]$/.test(e.key)){e.preventDefault();answer(Number(e.key)-1);}else if(e.key==='Enter'){e.preventDefault();moveQuestion(1);}else if(e.key.toLowerCase()==='f'){const qid=state.session.questions[state.session.index];if(qid)changeFavorite(qid);}});
window.addEventListener('resize',syncViewState);
window.addEventListener('hashchange',()=>{const value=location.hash.slice(1);if(pageTitles[value]&&value!==state.view)navigate(value);});
const requested=location.hash.slice(1);if(pageTitles[requested])state.view=requested;
if(state.view==='quiz')begin('all','random');else render();
})();