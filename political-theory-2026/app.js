(() => {
'use strict';
const KEY='zhixu-political-theory-2026-v1';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon={
arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="m15 18-6-6 6-6"/>',
close:'<path d="m18 6-12 12M6 6l12 12"/>',check:'<path d="m5 12 5 5L20 7"/>',
star:'<path d="m12 2 3.09 6.26 6.91 1.01-5 4.88 1.18 6.87L12 17.77l-6.18 3.25L7 14.15l-5-4.88 6.91-1.01z"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
shuffle:'<path d="m18 14 4 4-4 4m0-20 4 4-4 4M2 18h3c5 0 7-12 13-12h4M2 6h3c3 0 4 4 6 6m3 3c2 3 4 3 8 3"/>',
book:'<path d="M12 6a8 8 0 0 0-9-2v15a8 8 0 0 1 9 2m0-15a8 8 0 0 1 9-2v15a8 8 0 0 0-9 2zm0 0v15"/>',
reset:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
chev:'<path d="m6 9 6 6 6-6"/>',
layers:'<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>'
};
const svg=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icon[n]||icon.spark)+'</svg>';
const topics=[
 {name:'2026全国两会',sym:'✦',color:'#806bfa',bg:'#eeeaff',desc:'规划 · 民生 · 重要指标',points:[
 ['规划与会议成果','“十四五”圆满收官，“十五五”扬帆启航；审议批准政府工作报告、相关法律和“十五五”规划纲要。'],
 ['经济建设与执行力','必须发展实体经济；好规划与执行力结合；树立和践行正确政绩观。'],
 ['经济民生指标','材料给出GDP增长预期目标4.5%—5%、粮食产量约1.4万亿斤、单位GDP二氧化碳排放降低约3.8%。'],
 ['民生建设','强调普惠性、基础性、兜底性；城乡居民基础养老金月最低标准再提高20元；促进就业、教育、基本医疗。'],
 ['区域发展','支持京津冀、长三角、粤港澳大湾区打造世界级城市群，实施国家产业转移发展提升工程。'],
 ['重要法律','材料列举生态环境法典、民族团结进步促进法、国家发展规划法等。']
 ],tip:'把两会内容按“规划—经济—指标—民生—区域—法律”分组记忆。'},
 {name:'总体国家安全观',sym:'◎',color:'#22aaa2',bg:'#e3f7f3',desc:'宗旨 · 根本 · 法定义务',points:[
 ['四个核心定位','人民安全是宗旨、政治安全是根本、经济安全是基础、军事科技文化社会安全是保障。'],
 ['重要理念','统筹发展和安全两件大事。'],
 ['时间与电话','全民国家安全教育日4月15日；国家安全机关举报电话12339。'],
 ['公民法定义务','遵守国家安全法律法规、报告危害国家安全活动线索、保守所知悉的国家秘密。'],
 ['安全领域','涵盖政治、经济、军事、国土、文化、社会、科技、网络、生态等；非传统领域包括数据、生物、网络安全。']
 ],tip:'人民宗旨、政治根本、经济基础、多维保障。'},
 {name:'青年五四精神',sym:'✺',color:'#ed976e',bg:'#fff0e7',desc:'理想 · 奋斗 · 岗位实干',points:[
 ['理想与追求','胸怀远大理想，矢志拼搏奋斗，把个人追求融入国家发展大局。'],
 ['青年作为','立足岗位创造新业绩，将远大理想转化为干事创业实际行动。'],
 ['扎根基层一线','题目涉及科技创新、乡村振兴、卫国戍边等实践领域。'],
 ['表彰条件','政治进步、品德高尚、贡献突出。']
 ],tip:'“个人追求融入发展大局”与“远大理想转化实际行动”两种原题表述要区分。'},
 {name:'中华优秀传统文化',sym:'◈',color:'#ad77da',bg:'#f6eafa',desc:'两个结合 · 创新发展',points:[
 ['两个结合','马克思主义基本原理同中国具体实际相结合，同中华优秀传统文化相结合。'],
 ['传承方法','创造性转化、创新性发展；古为今用、推陈出新，有鉴别地对待、有扬弃地继承。'],
 ['文化定位','中华文明智慧结晶、中华民族的根和魂、文化激荡中站稳脚跟的根基。'],
 ['文化精神资源','天下为公、修齐治平、民为邦本、为政以德等。']
 ],tip:'“第二个结合”专指中华优秀传统文化。'},
 {name:'全民阅读',sym:'▤',color:'#559de2',bg:'#e6f3ff',desc:'读书日 · 书香社会',points:[
 ['节日与主张','世界读书日为4月23日，倡导阅读、尊重版权与知识产权。'],
 ['根本目的','建设书香社会是为了提升全民族思想文化素养，而不是只面向青年。'],
 ['学习方法','读原著、学原文、悟原理，做到学思用贯通。'],
 ['实践方式','深度阅读、甄选优质读物、读书分享和经典诵读。']
 ],tip:'国家安全教育日4月15日，世界读书日4月23日。'},
 {name:'非法金融风险',sym:'◇',color:'#e3748f',bg:'#ffebf0',desc:'非法集资 · 风险防范',points:[
 ['非法集资信号','借国家政策、养老、文旅、乡村振兴等名义，承诺保本高收益。'],
 ['典型方式','未经许可向社会公众吸收资金、拉人头、设置多层级返利。'],
 ['参与风险','损失由参与者自行承担；可能导致资金无法追回、信息泄露及承担法律责任。'],
 ['识别骗局','所谓“国家兜底、零风险、高回报”并不可信。']
 ],tip:'牢记“高收益、零风险、政策包装、拉人头”四个警示。'},
 {name:'雷锋精神',sym:'♡',color:'#d59b44',bg:'#fff2dc',desc:'服务人民 · 奉献精神',points:[
 ['核心实质','全心全意为人民服务。'],
 ['理想与奉献','热爱党、热爱祖国、热爱社会主义；服务人民、助人为乐。'],
 ['爱岗敬业','干一行、爱一行、专一行、精一行。'],
 ['艰苦奋斗','勤俭节约、奋发进取、不贪图安逸。'],
 ['辩证认识','把握奉献与索取的关系，尊重个人正当权益。']
 ],tip:'核心问服务人民，艰苦奋斗问勤俭节约，敬业问干一行爱一行。'}
];
const makeEmpty=()=>({attempts:{},starred:[],wrong:[],sessions:{},lastMode:'all',exams:[],exam:null,learned:{},theme:'light',reviewTab:'wrong'});
let state;
try{state=Object.assign(makeEmpty(),JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){state=makeEmpty()}
for(const k of ['attempts','sessions','learned'])if(!state[k]||typeof state[k]!=='object')state[k]={};
for(const k of ['starred','wrong','exams'])if(!Array.isArray(state[k]))state[k]=[];
let bank=[],byId=new Map(),activeMode='all',reviewTab='wrong',openLesson='',lastHash='',toastTimeout;
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notice('设备存储不可用，请注意备份')}};
const pct=(n,d)=>d?Math.round(n/d*100):0;
const sourceCount=()=>bank.filter(q=>!!state.attempts[q.id]).length;
const accuracy=()=>{const done=bank.filter(q=>state.attempts[q.id]);return pct(done.filter(q=>state.attempts[q.id].correct).length,done.length)};
const toLetters=a=>(a||[]).map(n=>'ABCD'[n]).sort().join('');
const equal=(q,a)=>toLetters(a)===q.answer.split('').sort().join('');
const idxString=(n)=>String(n+1).padStart(2,'0');
const listForMode=mode=>mode==='all'?bank:mode==='random'?mix(bank):mode==='wrong'?bank.filter(q=>state.wrong.includes(q.id)):mode==='star'?bank.filter(q=>state.starred.includes(q.id)):mode.startsWith('topic:')?bank.filter(q=>q.topic===mode.slice(6)):bank;
const mix=arr=>{const r=arr.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r};
const modeName=m=>m==='all'?'完整题库 · 60题':m==='random'?'随机练习 · 60题':m==='wrong'?'错题强化':m==='star'?'收藏练习':m.startsWith('topic:')?m.slice(6):'刷题';
function session(mode,reset=false){
 if(reset||!state.sessions[mode])state.sessions[mode]={order:listForMode(mode).map(q=>q.id),index:0,answers:{},drafts:{}};
 const s=state.sessions[mode];
 s.order=(s.order||[]).filter(id=>byId.has(id));s.answers=s.answers||{};s.drafts=s.drafts||{};
 s.index=Math.max(0,Math.min(s.index||0,Math.max(0,s.order.length-1)));
 return s;
}
function goto(path){const hash='#'+path;if(location.hash===hash)render();else location.hash=hash}
function notice(t){const node=$('#toast');node.textContent=t;node.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('show'),1900)}
function ring(n,d){return '<div class="progress-track"><div class="progress-bar" style="width:'+pct(n,d)+'%"></div></div>'}
function stat(value,label,sym){return '<div class="metric"><span class="metric-symbol">'+sym+'</span><div><div class="value">'+h(value)+'</div><div class="key">'+h(label)+'</div></div></div>'}
function rowFeature(a,subtitle,sym,action){return '<button class="feature-row" data-act="'+h(action)+'"><span class="feature-icon">'+sym+'</span><span><strong>'+h(a)+'</strong><small>'+h(subtitle)+'</small></span><span class="feature-chevron">›</span></button>'}
function renderHome(){
 const s=state.sessions[state.lastMode||'all'];
 const msg=s?.order?.length?'继续上次练习 · '+(s.index+1)+' / '+s.order.length:'完整题库 · 全部 60 道';
 $('#view').innerHTML='<div class="page"><section class="welcome"><div class="welcome-copy"><div class="eyebrow">STUDY, BEAUTIFULLY.</div><h1>把知识，<br><span>练成底气。</span></h1><p>政治理论应知应会 · 2025级<br>完整60道原题，轻盈而专注地复习。</p><div class="welcome-actions"><button class="btn btn-primary" data-act="continue">'+svg('arrow')+' 继续刷题</button><button class="btn btn-translucent" data-act="open-mode" data-mode="random">'+svg('shuffle')+' 随机练习</button></div></div><div class="orb-area" aria-hidden="true"><div class="orb-aura"></div><div class="orb-ring"></div><div class="orb-main"></div><span class="orb-star star-1">✧</span><span class="orb-star star-2">✦</span></div></section>'+
 '<div class="mini-metrics">'+stat('60','完整题库','⌑')+stat(sourceCount(),'已练习','✓')+stat(accuracy()+'%','正确率','◎')+'</div>'+
 '<div class="home-split"><section><div class="heading-row"><div><h2>接下来做什么？</h2><p>Less noise. More focus.</p></div></div><div class="feature-list">'+
 rowFeature('完整题库','40单选 + 20多选 · '+msg,'▦','open-all')+
 rowFeature('按知识点学习','7大专题 · 提纲与记忆法','✎','learn')+
 rowFeature('模拟考试','随机20单选 + 10多选','◉','exam-intro')+
 '</div></section><section class="glass progress-glass"><div class="progress-decoration"></div><div class="eyebrow">YOUR MOMENTUM</div><div class="progress-title" style="margin-top:9px">已经走过的学习旅程</div><div class="progress-number">'+pct(sourceCount(),60)+'<span style="font-size:25px;color:var(--violet)">%</span></div><div class="progress-percent">每一次认真作答，都在积累。</div><div style="margin-top:22px">'+ring(sourceCount(),60)+'</div><div class="progress-meta"><span>已掌握进度</span><span>'+sourceCount()+' / 60</span></div><button class="link-mini" data-act="me" style="margin-top:22px;padding:0">查看我的错题与收藏 →</button></section></div></div>';
}
function topicButton(t){
 const q=bank.filter(x=>x.topic===t.name);const done=q.filter(x=>state.attempts[x.id]).length;
 return '<button class="topic-item" data-act="topic" data-topic="'+h(t.name)+'"><span class="topic-symbol" style="--tc:'+t.color+';--tbg:'+t.bg+'">'+t.sym+'</span><span style="flex:1"><span class="topic-name">'+h(t.name)+'</span><span class="topic-secondary">'+q.length+' 道练习 · 已做 '+done+' 题</span></span><span class="topic-arrow">›</span></button>';
}
function renderLearn(){
 $('#view').innerHTML='<div class="page"><div class="simple-head"><div class="eyebrow">KNOWLEDGE MAP</div><h1 class="title">知识，有迹可循。</h1><div class="subtext">七个专题，一套清晰的复习路径。点开理解，再用原题巩固。</div></div><div class="topic-list">'+topics.map(topicButton).join('')+'</div></div>';
}
function renderTopic(name){
 const t=topics.find(x=>x.name===name);if(!t){goto('learn');return}
 const q=bank.filter(x=>x.topic===name),done=q.filter(x=>state.attempts[x.id]).length;
 $('#view').innerHTML='<div class="page"><button class="link-mini" data-act="learn" style="padding:7px 0;display:inline-flex;align-items:center;gap:4px">'+svg('back')+' 所有知识专题</button><div class="topic-top"><div class="topic-symbol" style="--tc:'+t.color+';--tbg:'+t.bg+'">'+t.sym+'</div><div><h1>'+h(t.name)+'</h1><p>'+h(t.desc)+'</p></div></div><div class="study-layout"><section class="glass study-panel"><h2>这章需要记住的事</h2>'+
 t.points.map(([title,body],i)=>'<div class="lesson"><button class="lesson-button" data-act="lesson" data-lesson="'+i+'" aria-expanded="'+(openLesson===name+':'+i?'true':'false')+'"><span class="lesson-number">'+idxString(i)+'</span><strong>'+h(title)+'</strong><span class="lesson-chevron">⌄</span></button><div class="lesson-drawer" style="'+(openLesson===name+':'+i?'height:auto':'')+'"><div class="lesson-body"><p class="lesson-note">'+h(body)+'</p></div></div></div>').join('')+
 '</section><aside class="sticky-aside"><div class="glass study-callout"><div class="eyebrow">MEMORY NOTE</div><h3 class="callout-title" style="margin-top:10px">记忆提示 ✦</h3><p>'+h(t.tip)+'</p><div class="thin-rule"></div><div class="study-progress-meta"><span>本专题进度</span><strong>'+done+'/'+q.length+'</strong></div>'+ring(done,q.length)+'<button class="btn btn-primary btn-block" style="margin-top:23px" data-act="open-mode" data-mode="topic:'+h(name)+'">开始专题刷题 '+svg('arrow')+'</button><button class="btn btn-secondary btn-block btn-small" style="margin-top:9px" data-act="mark-learned" data-topic="'+h(name)+'">'+(state.learned[name]?'✓ 已标记学习':'标记已学习')+'</button></div></aside></div></div>';
}
function getNumGrid(mode,sheetMode=false){
 const s=session(mode);
 return '<div class="number-grid">'+s.order.map((id,i)=>{const a=s.answers[id],st=a?(a.correct?'done':'wrong'):'';return '<button class="number-dot '+st+'" data-act="jump" data-mode="'+h(mode)+'" data-index="'+i+'" aria-label="跳转第'+(i+1)+'题">'+(i+1)+'</button>'}).join('')+'</div>';
}
function renderPractice(){
 const s=session('all');const done=s.order.filter(id=>s.answers[id]).length;
 $('#view').innerHTML='<div class="page"><div class="simple-head"><div class="eyebrow">QUESTION BANK</div><h1 class="title">60题，全都要掌握。</h1><div class="subtext">无遗漏收录 40 道单选、20 道多选。想练多少、练到哪里，由你决定。</div></div>'+
 '<div class="practice-hero"><div><div class="eyebrow">FULL LIBRARY</div><h2>完整题库 · '+done+' / 60</h2><p>从上次的位置继续。单选即点即判，多选选好提交；题目之间切换无需滑到页面底部。</p></div><button class="btn btn-primary" data-act="open-all">进入完整刷题 '+svg('arrow')+'</button></div>'+
 '<div class="mode-list"><button class="mode-card" data-act="open-mode" data-mode="random"><span class="mode-icon">'+svg('shuffle')+'</span><span class="mode-info"><strong>随机练习</strong><small>60题乱序 · 独立进度</small></span><span class="mode-arrow">›</span></button><button class="mode-card" data-act="exam-intro"><span class="mode-icon" style="background:#e7f7f1;color:#18a58b">◉</span><span class="mode-info"><strong>模拟考试</strong><small>随机30题 · 交卷评分</small></span><span class="mode-arrow">›</span></button><button class="mode-card" data-act="open-mode" data-mode="wrong"><span class="mode-icon" style="background:#ffedf0;color:#e47889">↻</span><span class="mode-info"><strong>错题强化</strong><small>'+state.wrong.length+'题 · 专练薄弱点</small></span><span class="mode-arrow">›</span></button><button class="mode-card" data-act="open-mode" data-mode="star"><span class="mode-icon" style="background:#fff2de;color:#daa248">☆</span><span class="mode-info"><strong>我的收藏</strong><small>'+state.starred.length+'题 · 重温考点</small></span><span class="mode-arrow">›</span></button></div>'+
 '<div class="heading-row"><div><h2>题目速览</h2><p>轻点号码，直接开始对应题目</p></div><span class="pill">全 60 题</span></div><details class="glass numbers-wrap"><summary><span>打开全部 60 题索引</span><span class="hint">单选 01—40 · 多选 41—60　⌄</span></summary>'+getNumGrid('all')+'</details></div>';
}
function renderMe(){
 const tab=reviewTab,ids=tab==='wrong'?state.wrong:state.starred;
 const q=bank.filter(x=>ids.includes(x.id));
 $('#view').innerHTML='<div class="page"><div class="simple-head"><div class="eyebrow">YOUR SPACE</div><h1 class="title">认真练过的，都记得。</h1><p class="subtext">收藏、错题、历史模拟成绩只保存在当前浏览器，不需要登录。</p></div><div class="me-cards">'+stat(sourceCount(),'已练习','✓')+stat(state.wrong.length,'错题数','↻')+stat(state.exams.length,'模拟次数','◉')+'</div>'+
 '<div class="filters"><button class="filter '+(tab==='wrong'?'active':'')+'" data-act="review-tab" data-tab="wrong">错题 · '+state.wrong.length+'</button><button class="filter '+(tab==='star'?'active':'')+'" data-act="review-tab" data-tab="star">收藏 · '+state.starred.length+'</button></div>'+
 (q.length?'<div class="review-list">'+q.map(x=>'<button class="review-row" data-act="open-review" data-mode="'+(tab==='wrong'?'wrong':'star')+'" data-id="'+x.id+'"><span>'+x.id+'</span><strong>'+h(x.stem)+'</strong><span style="font-size:20px;color:var(--faint)">›</span></button>').join('')+'</div><button class="btn btn-primary" style="margin-top:16px" data-act="open-mode" data-mode="'+(tab==='wrong'?'wrong':'star')+'">集中练习这 '+q.length+' 题 '+svg('arrow')+'</button>':
 '<div class="empty"><span class="emoji">'+(tab==='wrong'?'✧':'☆')+'</span><h3>'+(tab==='wrong'?'还没有错题':'还没有收藏的题目')+'</h3><p>完成题目后，这里会自动记录你的学习轨迹。</p><button class="btn btn-primary btn-small" data-act="open-all">开始完整刷题</button></div>')+
 '<div class="glass me-panel" style="margin-top:22px"><div class="heading-row"><div><h2>学习数据</h2><p>跨天续练 · 本机保存</p></div><span class="pill">仅此设备</span></div>'+
 '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:12px"><strong>整体完成度</strong><span class="micro">'+sourceCount()+' / 60</span></div>'+ring(sourceCount(),60)+
 '<div style="margin:21px 0 0;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-secondary btn-small" data-act="export">'+svg('download')+' 导出记录</button><button class="btn btn-secondary btn-small" data-act="clear">清空本网站进度</button></div>'+
 (state.exams.length?'<div class="thin-rule"></div><strong style="font-size:13px">最近模拟考试</strong>'+state.exams.slice(-3).reverse().map(x=>'<p class="micro" style="display:flex;justify-content:space-between"><span>'+h(x.date)+'</span><b>'+Number(x.score).toFixed(1)+' / 3.0</b></p>').join(''):'')+'</div></div>';
}
function openMode(mode,index=null){
 let s=session(mode);
 // Wrong/star sessions are dynamic, refreshed on explicit start only when question set changes
 if(['wrong','star'].includes(mode) && (s.order.length!==listForMode(mode).length || listForMode(mode).some(x=>!s.order.includes(x.id))))s=session(mode,true);
 if(!s.order.length){notice(mode==='wrong'?'还没有错题，先完成几道练习':'目前没有可练习的题目');return}
 if(index!==null)s.index=Math.max(0,Math.min(index,s.order.length-1));
 state.lastMode=mode;persist();goto('quiz/'+encodeURIComponent(mode));
}
function renderQuiz(mode){
 const s=session(mode);
 if(!s.order.length){goto('practice');return}
 const id=s.order[s.index],q=byId.get(id),entry=s.answers[id],draft=s.drafts[id]||[],chosen=entry?.selected||draft;
 const right=entry?.correct;
 const options=q.options.map((o,i)=>{
  const selected=chosen.includes(i),correctKey=entry&&q.answer.includes('ABCD'[i]),wrongKey=entry&&selected&&!q.answer.includes('ABCD'[i]);
  const klass=correctKey?'answer-good':wrongKey?'answer-bad':selected?'is-picked':'';
  return '<button class="option '+klass+'" data-act="answer" data-index="'+i+'" '+(entry?'disabled':'')+' aria-pressed="'+selected+'"><span class="option-key">'+String.fromCharCode(65+i)+'</span><span class="option-copy">'+h(o)+'</span>'+(entry&&(correctKey||wrongKey)?'<span class="option-status">'+(correctKey?'✓':'×')+'</span>':'')+'</button>';
 }).join('');
 const done=s.order.filter(i=>s.answers[i]).length;
 const tag='<span class="pill">'+(q.type==='single'?'单项选择':'多项选择')+'</span><span class="pill tag-dim">'+h(q.topic)+'</span><span class="question-serial">'+q.id+'</span>';
 const feedback=entry?'<section class="feedback"><div class="feedback-top '+(right?'good':'bad')+'">'+(right?'✦ 已掌握':'↗ 再记住这个考点')+'</div><div class="feedback-answer">正确答案 '+q.answer+'</div><p>'+h(q.explanation)+'</p><div class="feedback-note">解析根据原题及材料答案归纳；原文件未附独立解析。</div></section>':
  (q.type==='multi'?'<button class="btn btn-primary inline-submit" data-act="submit" '+(chosen.length?'':'disabled')+'>确认答案 · 已选 '+chosen.length+' 项 '+svg('arrow')+'</button><div class="help-under">多选、少选、错选均不得分；选好再提交。</div>':'<div class="help-under">选择后即时判题。大题量练习也可以随时返回。</div>');
 $('#view').innerHTML='<div class="focus-page"><div class="focus-top"><button class="focus-icon" data-act="go-practice" aria-label="退出刷题">'+svg('back')+'</button><div class="focus-center"><strong>'+h(modeName(mode))+'</strong><small>已作答 '+done+' / '+s.order.length+'</small></div><div class="focus-right"><button class="focus-icon" data-act="toggle-star" data-id="'+id+'" aria-label="收藏题目" style="'+(state.starred.includes(id)?'color:var(--gold)':'')+'">'+(state.starred.includes(id)?'★':'☆')+'</button><button class="focus-icon" data-act="show-sheet" aria-label="题目导航">'+svg('grid')+'</button></div></div><div class="focus-progress"><div class="focus-progress-inner" style="width:'+pct(s.index+1,s.order.length)+'%"></div></div><section class="question-zone"><div class="question-tags">'+tag+'</div><h1 class="question-title">'+h(q.stem)+'</h1><div class="answer-list">'+options+'</div>'+feedback+
 '<div class="question-footnote">自动保存进度 · 底部始终可以切换题目</div></section></div>';
 $('#quizDock').innerHTML='<div class="focus-dock"><div class="dock-inner"><button class="btn btn-secondary dock-btn" data-act="prev" '+(!s.index?'disabled':'')+'>'+svg('back')+' 上一题</button><span class="dock-mid">'+(s.index+1)+' / '+s.order.length+'</span><button class="btn btn-primary dock-btn next" data-act="next">'+(s.index===s.order.length-1?'完成练习':'下一题')+' '+svg('arrow')+'</button></div></div>';
}
function recordAnswer(q,selection,s){
 const a={selected:selection.slice(),correct:equal(q,selection),at:Date.now()};
 s.answers[q.id]=a;state.attempts[q.id]=a;
 if(!a.correct&&!state.wrong.includes(q.id))state.wrong.push(q.id);
 delete s.drafts[q.id];persist();
}
function choice(index){
 const mode=activeMode,s=session(mode),q=byId.get(s.order[s.index]);if(s.answers[q.id])return;
 if(q.type==='single'){recordAnswer(q,[index],s);const y=window.scrollY;renderQuiz(mode);window.scrollTo(0,y);const k=$('.option.is-picked,.option.answer-good,.option.answer-bad');if(k)k.classList.add(s.answers[q.id].correct?'jelly':'shake')}
 else{const selection=s.drafts[q.id]||[];s.drafts[q.id]=selection.includes(index)?selection.filter(x=>x!==index):selection.concat(index).sort();persist();const y=window.scrollY;renderQuiz(mode);window.scrollTo(0,y);const b=$$('.option')[index];if(b)b.classList.add('jelly')}
}
function submitMulti(){
 const s=session(activeMode),q=byId.get(s.order[s.index]),sel=s.drafts[q.id]||[];if(!sel.length)return;recordAnswer(q,sel,s);
 const y=window.scrollY;renderQuiz(activeMode);window.scrollTo(0,y);$('.feedback')?.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.22,1.3,.36,1)'});
}
function move(delta){
 const s=session(activeMode);
 if(delta>0&&s.index===s.order.length-1){goto('finish/'+encodeURIComponent(activeMode));return}
 s.index=Math.min(s.order.length-1,Math.max(0,s.index+delta));persist();renderQuiz(activeMode);window.scrollTo({top:0,behavior:'instant'});
}
function renderFinish(mode){
 const s=session(mode),d=s.order.filter(id=>s.answers[id]),good=d.filter(id=>s.answers[id].correct).length;
 $('#view').innerHTML='<div class="page results"><div class="eyebrow">SESSION COMPLETE</div><h1 class="title">又进步了一点。</h1><p class="subtext">不必追求一次完美，每一次练习都有效。</p><div class="score-bubble" style="--score:'+pct(good,Math.max(1,d.length))+'%"><strong>'+pct(good,Math.max(1,d.length))+'%</strong><small>本轮正确率</small></div><p class="subtext">练习 '+d.length+' 题，正确 '+good+' 题</p><div class="result-actions"><button class="btn btn-primary" data-act="resume-mode" data-mode="'+h(mode)+'">查看本轮 '+svg('arrow')+'</button><button class="btn btn-secondary" data-act="restart" data-mode="'+h(mode)+'">'+svg('reset')+' 再练一遍</button></div></div>';
}
function renderExamIntro(){
 const e=state.exam,active=e&&!e.finished;
 $('#view').innerHTML='<div class="page simple-head"><div class="eyebrow">EXAM MODE</div><h1 class="title">试一场，不留遗憾。</h1><p class="subtext">根据材料：单选20题，多选10题；30题，每题0.1分，满分3.0分。<br>题目来自这60道原题。交卷后统一显示成绩与错题。</p><div class="mini-metrics">'+stat(20,'单项选择','◇')+stat(10,'多项选择','▤')+stat('3.0','总分','◎')+'</div><div class="glass study-callout" style="max-width:570px"><h2 style="margin:0 0 12px;font-size:20px">准备好了吗？</h2><p>试卷会自动保存作答进度；多选需要手动确认，提交后展示完整评分。</p><button class="btn btn-primary btn-block" data-act="start-exam">'+(active?'继续上次试卷':'进入模拟考试')+' '+svg('arrow')+'</button>'+(active?'<button class="btn btn-secondary btn-block" style="margin-top:10px" data-act="new-exam">重新随机抽题</button>':'')+'</div></div>';
}
function resetExam(){
 const order=[...mix(bank.filter(q=>q.type==='single')).slice(0,20),...mix(bank.filter(q=>q.type==='multi')).slice(0,10)].map(q=>q.id);
 state.exam={ids:order,index:0,answers:{},drafts:{},finished:false};persist();
}
function renderExamPlay(){
 if(!state.exam||state.exam.finished){goto('exam-intro');return}
 const e=state.exam,q=byId.get(e.ids[e.index]),entry=e.answers[q.id],chosen=e.drafts[q.id]||entry?.selected||[];
 const options=q.options.map((o,i)=>'<button class="option '+(chosen.includes(i)?'is-picked':'')+'" data-act="exam-answer" data-index="'+i+'" aria-pressed="'+chosen.includes(i)+'"><span class="option-key">'+String.fromCharCode(65+i)+'</span><span class="option-copy">'+h(o)+'</span></button>').join('');
 $('#view').innerHTML='<div class="focus-page"><div class="focus-top"><button class="focus-icon" data-act="exam-intro" aria-label="退出模拟考试">'+svg('back')+'</button><div class="focus-center"><strong>模拟考试</strong><small>已完成 '+Object.keys(e.answers).length+' / 30 题</small></div><div class="focus-right"><button class="focus-icon" data-act="show-sheet" aria-label="题号导航">'+svg('grid')+'</button></div></div><div class="focus-progress"><div class="focus-progress-inner" style="width:'+pct(e.index+1,30)+'%"></div></div><section class="question-zone"><div class="question-tags"><span class="pill">'+(q.type==='single'?'单项选择':'多项选择')+'</span><span class="pill tag-dim">模拟考试</span><span class="question-serial">第 '+(e.index+1)+' 题 / 30</span></div><h1 class="question-title">'+h(q.stem)+'</h1><div class="answer-list">'+options+'</div>'+
 (q.type==='multi'?'<button class="btn btn-primary inline-submit" data-act="exam-submit" '+(chosen.length?'':'disabled')+'>'+svg('check')+' 确认多选答案 · '+chosen.length+'项</button>':'<div class="help-under">单选选择后自动保存，交卷前不显示正确答案。</div>')+
 '<p class="question-footnote">'+(entry?'✓ 本题已保存':'尚未确认本题')+' · 可自由前后切换</p></section></div>';
 $('#quizDock').innerHTML='<div class="focus-dock"><div class="dock-inner"><button class="btn btn-secondary dock-btn" data-act="exam-prev" '+(e.index===0?'disabled':'')+'>'+svg('back')+' 上一题</button><span class="dock-mid">'+(e.index+1)+' / 30</span><button class="btn btn-primary dock-btn next" data-act="exam-next">'+(e.index===29?'交卷评分':'下一题')+' '+svg('arrow')+'</button></div></div>';
}
function finishExam(){
 const e=state.exam,n=Object.keys(e.answers).length;
 if(n<30&&!confirm('还有 '+(30-n)+' 道题未完成，确定现在交卷吗？'))return;
 const good=e.ids.filter(id=>e.answers[id]&&equal(byId.get(id),e.answers[id].selected)).length;
 for(const id of e.ids){
  const a=e.answers[id];
  if(a){const correct=equal(byId.get(id),a.selected);state.attempts[id]={selected:a.selected,correct,at:Date.now()};if(!correct&&!state.wrong.includes(id))state.wrong.push(id)}
  else if(!state.wrong.includes(id))state.wrong.push(id);
 }
 state.exams.push({date:new Date().toLocaleDateString('zh-CN'),score:good*.1,correct:good,total:30,ids:e.ids,answers:structuredClone(e.answers)});
 e.finished=true;persist();goto('exam-result');
}
function renderExamResult(){
 const r=state.exams.at(-1);if(!r){goto('exam-intro');return}
 const wrong=r.ids.filter(id=>!r.answers[id]||!equal(byId.get(id),r.answers[id].selected));
 $('#view').innerHTML='<div class="page results"><div class="eyebrow">EXAM COMPLETE</div><h1 class="title">这次，答得怎么样？</h1><p class="subtext">成绩已经保存。考试表现，是下一次进步的起点。</p><div class="score-bubble" style="--score:'+pct(r.correct,30)+'%"><strong>'+Number(r.score).toFixed(1)+'</strong><small>满分 3.0 分</small></div><p class="subtext">答对 '+r.correct+' 题 · 需巩固 '+wrong.length+' 题</p><div class="result-actions"><button class="btn btn-primary" data-act="new-exam">再考一次 '+svg('arrow')+'</button><button class="btn btn-secondary" data-act="me">查看错题</button></div></div><div class="page" style="max-width:720px;margin:15px auto"><div class="heading-row"><h2>需要再记住的知识</h2><span class="pill">'+wrong.length+' 题</span></div>'+(!wrong.length?'<div class="empty">✦ 全部答对，继续保持。</div>':wrong.map(id=>{const q=byId.get(id);return '<div class="glass" style="padding:18px 20px;margin-bottom:11px"><strong style="font-size:14px;line-height:1.7">'+h(q.stem)+'</strong><p style="font-size:12px;color:var(--violet);font-weight:800">正确答案 '+q.answer+'</p><p class="subtext" style="font-size:12px">'+h(q.explanation)+'</p></div>'}).join(''))+'</div>';
}
function toggleLesson(btn){
 const target=btn.nextElementSibling,expand=btn.getAttribute('aria-expanded')!=='true';
 const y=target.getBoundingClientRect().height;
 target.style.transition='none';target.style.height=y+'px';void target.offsetHeight;
 btn.setAttribute('aria-expanded',String(expand));openLesson=expand?decodeURIComponent(location.hash.slice(7))+':'+btn.dataset.lesson:'';
 target.style.transition='height '+(expand?430:325)+'ms cubic-bezier(.18,.82,.22,1)';
 requestAnimationFrame(()=>{target.style.height=expand?target.scrollHeight+'px':'0px'});
 const token=(target.__token||0)+1;target.__token=token;
 const done=ev=>{if(ev.propertyName!=='height'||target.__token!==token)return;if(expand)target.style.height='auto';target.removeEventListener('transitionend',done)};
 target.addEventListener('transitionend',done);
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){target.style.height=expand?'auto':'0px';return}
 if(expand){$$('.lesson-note',target).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(-9px) scaleY(.84)'},{opacity:1,transform:'none'}],{duration:245,delay:58+Math.min(i*42,180),easing:'cubic-bezier(.18,.86,.25,1)' })) }
}
function navIndicator(){
 const active=$('.nav-item.active'),thumb=$('#navThumb'),shell=$('#navShell');if(!active||!thumb||!shell)return;
 const a=active.getBoundingClientRect(),b=shell.getBoundingClientRect();
 thumb.style.left=(a.left-b.left)+'px';thumb.style.width=a.width+'px';
}
function render(){
 if(!bank.length)return;
 const route=decodeURIComponent((location.hash||'#home').slice(1)),focused=route.startsWith('quiz/')||route==='exam-play';
 document.body.classList.toggle('in-focus',focused);
 document.documentElement.classList.toggle('night',state.theme==='dark');
 $('#themeIcon').textContent=state.theme==='dark'?'☼':'☾';
 $('#quizDock').innerHTML='';$('#overlayRoot').innerHTML='';
 const tab=route.startsWith('topic/')?'learn':route.startsWith('quiz/')||route.startsWith('finish/')?'practice':route==='exam-play'||route==='exam-intro'||route==='exam-result'?'practice':route==='me'?'me':route;
 $$('.nav-item').forEach(el=>{el.classList.toggle('active',el.dataset.page===tab);el.setAttribute('aria-current',el.dataset.page===tab?'page':'false')});
 requestAnimationFrame(navIndicator);
 if(route==='home')renderHome();
 else if(route==='learn')renderLearn();
 else if(route.startsWith('topic/'))renderTopic(route.slice(6));
 else if(route==='practice')renderPractice();
 else if(route==='me')renderMe();
 else if(route.startsWith('quiz/')){activeMode=route.slice(5);renderQuiz(activeMode)}
 else if(route.startsWith('finish/'))renderFinish(route.slice(7));
 else if(route==='exam-intro')renderExamIntro();
 else if(route==='exam-play')renderExamPlay();
 else if(route==='exam-result')renderExamResult();
 else{history.replaceState(null,'','#home');renderHome()}
 if(route!==lastHash){lastHash=route;window.scrollTo({top:0,behavior:'instant'})}
}
function showSheet(){
 const isExam=location.hash==='#exam-play';
 const s=isExam?state.exam:session(activeMode);
 if(!s)return;
 const order=isExam?s.ids:s.order;
 $('#overlayRoot').innerHTML='<div class="sheet-scrim" data-act="close-sheet"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="题目导航"><div class="sheet-grabber"></div><div class="sheet-heading"><h2>快速跳转 · '+order.length+'题</h2><button class="focus-icon" data-act="close-sheet" aria-label="关闭">'+svg('close')+'</button></div><div class="number-grid">'+order.map((id,i)=>{const a=s.answers[id],st=a?(isExam?'done':a.correct?'done':'wrong'):'';const on=i===s.index;return '<button class="number-dot '+st+'" style="'+(on?'border:2px solid var(--violet);color:var(--violet)':'')+'" data-act="sheet-jump" data-index="'+i+'">'+(i+1)+'</button>'}).join('')+'</div><p class="sheet-legend"><span class="indicator done"></span>已完成　<span class="indicator wrong"></span>错误　<span class="indicator"></span>当前题目</p></section>';
}
function closeSheet(){$('#overlayRoot').innerHTML=''}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b||!bank.length)return;
 const act=b.dataset.act,mode=b.dataset.mode,topic=b.dataset.topic;
 if(b.classList.contains('btn') && !matchMedia('(prefers-reduced-motion:reduce)').matches){
  const r=b.getBoundingClientRect(),sp=document.createElement('span');sp.className='rip';sp.style.left=(e.clientX-r.left)+'px';sp.style.top=(e.clientY-r.top)+'px';b.appendChild(sp);sp.addEventListener('animationend',()=>sp.remove(),{once:true});
 }
 switch(act){
 case 'theme':state.theme=state.theme==='dark'?'light':'dark';persist();render();break;
 case 'continue':openMode(state.lastMode||'all');break;
 case 'open-all':openMode('all');break;
 case 'open-mode':openMode(mode);break;
 case 'resume-mode':openMode(mode);break;
 case 'restart':if(confirm('重新开始这一轮？全局错题与学习记录不会清空。')){session(mode,true);persist();openMode(mode)}break;
 case 'learn':goto('learn');break;
 case 'me':goto('me');break;
 case 'go-practice':goto('practice');break;
 case 'topic':openLesson='';goto('topic/'+encodeURIComponent(topic));break;
 case 'lesson':toggleLesson(b);break;
 case 'mark-learned':state.learned[topic]=!state.learned[topic];persist();renderTopic(topic);notice(state.learned[topic]?'已标记为学习过':'已撤销标记');break;
 case 'jump':openMode(mode,Number(b.dataset.index));break;
 case 'answer':choice(Number(b.dataset.index));break;
 case 'submit':submitMulti();break;
 case 'prev':move(-1);break;
 case 'next':move(1);break;
 case 'toggle-star':{const id=b.dataset.id;state.starred=state.starred.includes(id)?state.starred.filter(x=>x!==id):[...state.starred,id];persist();renderQuiz(activeMode);notice(state.starred.includes(id)?'已收藏此题':'取消收藏');break}
 case 'show-sheet':showSheet();break;
 case 'close-sheet':closeSheet();break;
 case 'sheet-jump':{const index=Number(b.dataset.index);if(location.hash==='#exam-play'){state.exam.index=index;persist();closeSheet();renderExamPlay()}else{session(activeMode).index=index;persist();closeSheet();renderQuiz(activeMode)}window.scrollTo({top:0,behavior:'instant'});break}
 case 'review-tab':reviewTab=b.dataset.tab;renderMe();break;
 case 'open-review':{const m=b.dataset.mode;const s=session(m);const id=b.dataset.id;if(!s.order.includes(id))session(m,true);openMode(m,session(m).order.indexOf(id));break}
 case 'exam-intro':goto('exam-intro');break;
 case 'start-exam':if(!state.exam||state.exam.finished)resetExam();goto('exam-play');break;
 case 'new-exam':if(!state.exam||state.exam.finished||confirm('重新抽题会放弃未交卷的记录，确定继续吗？')){resetExam();goto('exam-play')}break;
 case 'exam-answer':{const ex=state.exam,q=byId.get(ex.ids[ex.index]),i=Number(b.dataset.index);
  if(q.type==='single'){ex.answers[q.id]={selected:[i]};delete ex.drafts[q.id]}
  else{const arr=ex.drafts[q.id]||ex.answers[q.id]?.selected||[];ex.drafts[q.id]=arr.includes(i)?arr.filter(n=>n!==i):[...arr,i].sort();delete ex.answers[q.id]}
  persist();const y=window.scrollY;renderExamPlay();window.scrollTo(0,y);break}
 case 'exam-submit':{const ex=state.exam,q=byId.get(ex.ids[ex.index]),arr=ex.drafts[q.id]||ex.answers[q.id]?.selected||[];if(arr.length){ex.answers[q.id]={selected:arr};delete ex.drafts[q.id];persist();renderExamPlay();notice('答案已确认')}break}
 case 'exam-prev':state.exam.index=Math.max(0,state.exam.index-1);persist();renderExamPlay();window.scrollTo(0,0);break;
 case 'exam-next':if(state.exam.index===29)finishExam();else{state.exam.index++;persist();renderExamPlay();window.scrollTo(0,0)}break;
 case 'export':{const blob=new Blob([JSON.stringify({version:2,app:'知序',date:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='知序-学习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);notice('学习记录已导出');break}
 case 'clear':if(confirm('确定清空本网站的学习进度吗？原有浏览器记录将无法找回。')){state=makeEmpty();persist();goto('home');notice('记录已清空')}break;
 }
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeSheet();
 if(location.hash.startsWith('#quiz/')&&e.target.tagName!=='INPUT'&&!e.ctrlKey&&!e.metaKey){
  if(e.key==='ArrowRight'){e.preventDefault();move(1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
  else if(['1','2','3','4'].includes(e.key)){e.preventDefault();choice(Number(e.key)-1)}
 }
});
window.addEventListener('resize',()=>requestAnimationFrame(navIndicator));
window.addEventListener('hashchange',render);
fetch('./questions.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('题库请求失败');return r.json()}).then(data=>{
 bank=data.questions;byId=new Map(bank.map(x=>[x.id,x]));
 if(bank.length!==60||bank.filter(x=>x.type==='single').length!==40||bank.filter(x=>x.type==='multi').length!==20||bank.some(x=>x.options.length!==4||!x.answer))throw Error('题库完整性校验失败');
 if(!location.hash)history.replaceState(null,'','#home');
 render();
}).catch(e=>{
 $('#view').innerHTML='<div class="empty" style="margin:55px auto;max-width:610px"><span class="emoji">⚠</span><h3>未能加载题库</h3><p>'+h(e.message)+'，请通过 GitHub Pages 访问，或在本地 HTTP 服务中运行。</p><button class="btn btn-primary" onclick="location.reload()">重新尝试</button></div>';
});
})();