(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key='zhixu-political-theory-2026-v1';
const nav=[
  ['home','总览','home'],['learn','知识学习','book-open'],['practice','完整刷题','layers'],['review','错题收藏','bookmark'],['stats','学习报告','chart']
];
const icons={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
  'book-open':'<path d="M12 7v14"/><path d="M3 18V5a2 2 0 0 1 2-2h2a8 8 0 0 1 5 2 8 8 0 0 1 5-2h2a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2H4a1 1 0 0 1-1-1Z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  bookmark:'<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 17V9M12 17V5M17 17v-6"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  moon:'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  'alert-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
  shuffle:'<path d="m18 14 4 4-4 4m0-20 4 4-4 4M2 18h2.5a6 6 0 0 0 5-3l5-7a6 6 0 0 1 5-3H22M2 6h2.5a6 6 0 0 1 5 3m5 6a6 6 0 0 0 5 3H22"/>',
  spark:'<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  star:'<path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7-6-3.3-6 3.3.9-7-5.1-5 7.1-1L12 2Z"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  medal:'<circle cx="12" cy="14" r="5"/><path d="m8.5 10-3-7h5L12 9l1.5-6h5l-3 7M10 14h4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  pencil:'<path d="m4 17 12-12 3 3L7 20l-4 1zM14 7l3 3"/>',
  filter:'<path d="M4 7h16M7 12h10m-7 5h4"/>',
  lightbulb:'<path d="M9 18h6m-5 3h4M8 15c-2-2-3-3.4-3-6a7 7 0 0 1 14 0c0 2.6-1 4-3 6l-1 2H9z"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>'
};
const ico=(id)=>'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[id]||icons.spark)+'</svg>';
const topics=[
{name:'2026全国两会',tag:'POLICY & DEVELOPMENT',symbol:'✦',color:'#8980f2',bg:'#f0edff',desc:'政府工作报告、规划纲要、区域发展与民生部署',tagline:'从宏观目标到具体部署，串起两会重要考点。',guide:[
['历史方位','“十四五”收官、“十五五”开局；审议批准政府工作报告及“十五五”规划纲要。'],
['实体经济与落实','坚持做强实体经济；好规划与执行力要结合；树立和践行正确政绩观。'],
['宏观指标','本材料列出的GDP增长预期目标为4.5%—5%，粮食产量约1.4万亿斤，单位GDP二氧化碳排放降低约3.8%。'],
['民生重点','普惠性、基础性、兜底性民生建设；城乡居民基础养老金月最低标准再提高20元；促进就业、医疗、教育。'],
['区域协同','京津冀、长三角、粤港澳大湾区打造世界级城市群，产业转移发展提升工程、雄安新区建设等。'],
['法律成果','材料列有生态环境法典、民族团结进步促进法、国家发展规划法等。']
],tip:'记忆顺序：规划纲要 → 实体经济 → 三项数字 → 民生 → 区域 → 法律成果。'},
{name:'总体国家安全观',tag:'NATIONAL SECURITY',symbol:'◎',color:'#32b8a5',bg:'#e4f8f4',desc:'宗旨、根本、基础、保障与国家安全公民义务',tagline:'用“宗旨—根本—基础—保障”串联概念。',guide:[
['四个关键词','以人民安全为宗旨、政治安全为根本、经济安全为基础、军事科技文化社会安全为保障。'],
['统筹关系','坚持总体国家安全观，统筹发展和安全两件大事。'],
['举报渠道','发现危害国家安全行为，拨打国家安全机关举报电话12339。'],
['法定义务','遵守相关法律、报告危害国家安全活动线索、保守所知悉的国家秘密。'],
['领域辨析','政治、军事、国土、经济、文化、社会、科技、网络、生态等；材料中非传统领域例子有数据、生物、网络安全。'],
['重要日期','全民国家安全教育日为每年4月15日。']
],tip:'先记口诀：“人民宗旨、政治根本、经济基础、多维保障”；再联想电话12339与日期4·15。'},
{name:'青年五四精神',tag:'YOUTH & RESPONSIBILITY',symbol:'❋',color:'#eb9b6f',bg:'#fff2e6',desc:'青年理想、岗位建功与个人追求融入国家发展',tagline:'从理想信念到岗位实干，抓住回信中的关键表述。',guide:[
['核心方向','胸怀远大理想，矢志拼搏奋斗，把个人追求融入国家发展大局。'],
['岗位建功','扎根科技创新、乡村振兴、卫国戍边等一线，不断创造新业绩。'],
['知行统一','将远大理想转化为干事创业的实际行动。'],
['表彰关键词','政治进步、品德高尚、贡献突出。']
],tip:'区分“个人追求融入国家发展大局”和“远大理想转化为实际行动”两种设问。'},
{name:'中华优秀传统文化',tag:'CULTURE & HERITAGE',symbol:'◇',color:'#a98bea',bg:'#f3edff',desc:'“两个结合”、创造性转化与传统文化科学态度',tagline:'把文化传承的理论与实践对应起来。',guide:[
['两个结合','马克思主义基本原理同中国具体实际相结合、同中华优秀传统文化相结合。'],
['传承方针','创造性转化、创新性发展。'],
['科学态度','古为今用、推陈出新，有鉴别地对待、有扬弃地继承，不能直接照搬古代制度。'],
['核心价值','中华文明智慧结晶、中华民族根和魂、文化激荡中站稳脚跟的根基。'],
['精神资源','天下为公、天下大同；修齐治平、兴亡有责；民为邦本、为政以德。']
],tip:'区别“两个结合”的第一、第二个结合，尤其是第二个结合对应中华优秀传统文化。'},
{name:'全民阅读',tag:'READING & CIVILIZATION',symbol:'▤',color:'#61a8df',bg:'#eaf5fd',desc:'世界读书日、知识产权与书香社会建设',tagline:'时间、理念和根本目的三层记忆。',guide:[
['重要日期','世界读书日为每年4月23日。'],
['核心倡导','倡导阅读、尊重版权、保护知识产权与创作者合法权益。'],
['书香社会','全民阅读面向全社会，根本目的是提升全民族思想文化素养。'],
['阅读方法','读原著、学原文、悟原理，做到学思用贯通。'],
['有效实践','深度阅读、甄别读物、经典诵读与读书分享。']
],tip:'4月15日国家安全教育日；4月23日世界读书日——两个日期一起背。'},
{name:'非法金融风险',tag:'FINANCIAL SAFETY',symbol:'◈',color:'#ed8e97',bg:'#fff0f2',desc:'非法集资识别、防骗信号和法律风险',tagline:'看穿“高收益、零风险、国家兜底”的陷阱。',guide:[
['警惕信号','假借国家政策、养老、文旅、乡村振兴等名义发行所谓理财项目。'],
['运作模式','未经许可向公众吸收资金、承诺还本付息；拉人头和多层级返利。'],
['风险判断','“零风险高回报”“国家兜底理财”等大概率是非法金融骗局。'],
['损失承担','参与非法集资的损失由参与者自行承担；不应预期政府、银行或公安机关全额赔付。'],
['其他风险','资金转移难追偿、身份及银行信息泄露、甚至可能承担法律责任。']
],tip:'关键词：保本高息＋不明牌照＋政策包装＋拉人头 → 高度警惕非法集资。'},
{name:'雷锋精神',tag:'SERVICE & DEDICATION',symbol:'♡',color:'#edac66',bg:'#fff5e8',desc:'为人民服务、无私奉献、爱岗敬业与艰苦奋斗',tagline:'把精神核心与不同表现形式分开记。',guide:[
['核心实质','全心全意为人民服务。'],
['理想信念','热爱党、热爱祖国、热爱社会主义的崇高理想。'],
['奉献精神','服务人民、助人为乐。'],
['敬业精神','干一行、爱一行、专一行、精一行。'],
['艰苦奋斗','勤俭节约、奋发进取、不贪图安逸。'],
['辩证理解','把握奉献与索取的辩证关系，既讲奉献也尊重个人正当权益。']
],tip:'注意不同题型：核心实质问服务人民，艰苦奋斗问勤俭节约，敬业精神问干一行爱一行。'}
];
const empty=()=>({attempts:{},starred:[],wrong:[],sessions:{},lastMode:'all',exams:[],exam:null,learned:{},theme:'light',reviewTab:'wrong'});
let state;
try{state=Object.assign(empty(),JSON.parse(localStorage.getItem(key)||'{}'));}catch(e){state=empty()}
for(const k of ['attempts','sessions','learned'])if(!state[k]||typeof state[k]!=='object')state[k]={};
for(const k of ['wrong','starred','exams'])if(!Array.isArray(state[k]))state[k]=[];
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch(e){toast('浏览器存储不可用，当前进度可能无法保存。')}};
let all=[], qmap=new Map(),bankQuery='',bankType='all',bankTopic='all',expandedKey='',toastTimer,returnFocus=null;
const go=(route)=>{const target='#'+route;if(location.hash===target)render();else location.hash=target};
const hash=()=>decodeURIComponent((location.hash||'#home').slice(1));
const shuffle=(a)=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b};
const correct=(q,sel)=>[...(sel||[])].sort().join('')===q.answer.split('').sort().join('');
const toLetters=(sel)=>(sel||[]).map(i=>'ABCD'[i]).sort().join('');
const isDone=(id)=>Boolean(state.attempts[id]);
const answered=()=>all.filter(q=>isDone(q.id)).length;
const totalCorrect=()=>all.filter(q=>state.attempts[q.id]?.correct).length;
const accuracy=()=>answered()?Math.round(totalCorrect()/answered()*100):0;
const percent=(n,d)=>d?Math.round(n/d*100):0;
const qByTopic=(name)=>all.filter(q=>q.topic===name);
const modeLabel=(mode)=>mode==='all'?'完整题库':mode==='random'?'随机练习':mode==='wrong'?'错题强化':mode==='star'?'收藏练习':mode.startsWith('topic:')?mode.slice(6):'练习';
const timeStamp=()=>new Date().toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'});
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
function getSession(mode,rebuild=false){
 if(!state.sessions[mode]||rebuild){
   let arr=mode==='all'?all:mode==='random'?shuffle(all):
     mode==='wrong'?all.filter(q=>state.wrong.includes(q.id)):
     mode==='star'?all.filter(q=>state.starred.includes(q.id)):
     mode.startsWith('topic:')?qByTopic(mode.slice(6)):all;
   state.sessions[mode]={order:arr.map(q=>q.id),index:0,answers:{},drafts:{}};
 }
 const s=state.sessions[mode];
 s.order=s.order.filter(id=>qmap.has(id));
 if(!s.answers)s.answers={};if(!s.drafts)s.drafts={};
 s.index=Math.min(Math.max(0,s.index||0),Math.max(0,s.order.length-1));
 return s;
}
function openQuiz(mode='all',index=null){
 const s=getSession(mode);
 if(!s.order.length){toast(mode==='wrong'?'还没有错题，先去完整刷题吧。':'此练习暂无题目');return}
 if(index!==null)s.index=Math.min(Math.max(index,0),s.order.length-1);
 state.lastMode=mode;expandedKey='';save();go('quiz/'+encodeURIComponent(mode));
}
function recordAnswer(q,selected,session){
 const right=correct(q,selected), a={selected:[...selected],correct:right,at:Date.now()};
 session.answers[q.id]=a;state.attempts[q.id]=a;
 if(!right&&!state.wrong.includes(q.id))state.wrong.push(q.id);
 delete session.drafts[q.id];save();
}
const progressEl=(value,small=false)=>'<div class="progress-track '+(small?'small-track':'')+'"><div class="progress-fill" style="width:'+Math.max(0,Math.min(100,value))+'%"></div></div>';
function cardMetric(iconId,n,label,cls=''){
 return '<div class="metric-card"><div class="metric-icon '+cls+'">'+ico(iconId)+'</div><div class="metric-text"><strong class="number-counter" data-val="'+n+'">'+n+'</strong><span>'+esc(label)+'</span></div></div>';
}
function animateCounters(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 $$('.number-counter').forEach(el=>{const end=+el.dataset.val;if(!Number.isFinite(end)||end>999||end<1)return;let start=0;const began=performance.now();const duration=650;function tick(now){const t=Math.min(1,(now-began)/duration);const v=Math.round(end*(1-Math.pow(1-t,4)));el.textContent=v;if(t<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)});
}
function topicCard(t){
 const qs=qByTopic(t.name), done=qs.filter(q=>isDone(q.id)).length,p=percent(done,qs.length);
 return '<article class="topic-card" role="button" tabindex="0" data-action="open-topic" data-topic="'+esc(t.name)+'"><div class="topic-head"><span class="topic-symbol" style="color:'+t.color+';background:'+t.bg+'">'+t.symbol+'</span><span class="topic-count">'+qs.length+' 题</span></div><h3>'+esc(t.name)+'</h3><p>'+esc(t.desc)+'</p><div class="topic-bottom">'+progressEl(p,true)+'<span class="topic-percent">'+done+'/'+qs.length+'</span></div></article>';
}
const heading=(ey,t,s)=>'<div style="margin-bottom:25px"><div class="eyebrow">'+esc(ey)+'</div><h1 class="page-title">'+esc(t)+'</h1><p class="page-lead">'+esc(s)+'</p></div>';
const gridTopics=()=>'<div class="topic-grid">'+topics.map(topicCard).join('')+'</div>';
function renderHome(){
 const latest=state.sessions[state.lastMode];
 const lastQ=latest?.order?.length?latest.order[Math.min(latest.index||0,latest.order.length-1)]:null;
 const lastText=lastQ&&qmap.has(lastQ)?'继续'+modeLabel(state.lastMode)+' · '+((latest.index||0)+1)+'/'+latest.order.length:'从第一道题开始你的学习旅程';
 const qs=topics.map(t=>({t,n:qByTopic(t.name).length,done:qByTopic(t.name).filter(q=>isDone(q.id)).length}));
 $('#content').innerHTML=
  '<div class="hero"><div class="hero-copy"><div class="eyebrow">YOUR STUDY COMPANION · 2026</div><h1>让每一次学习，<br>都成为看得见的进步。</h1><p>南京警察学院 · 2025级政治理论应知应会<br>把零散知识变成清晰的路径，稳稳掌握全部60道题。</p><div class="hero-buttons"><button class="button" data-action="continue">'+ico('arrow')+' '+(lastQ?'继续上次练习':'开始完整练习')+'</button><button class="button ghost" data-action="route" data-route="learn">'+ico('book-open')+' 知识地图</button><button class="button ghost" data-action="route" data-route="practice">'+ico('search')+' 题库目录</button></div></div><div class="hero-art"><span class="halo"></span><span class="orbit"></span><span class="orb"></span><span class="spark s1">✦</span><span class="spark s2">✦</span></div></div>'+
  '<div class="stats-grid">'+cardMetric('layers',60,'题库总量')+cardMetric('check-circle',answered(),'已练习题目','green')+cardMetric('target',accuracy()+'','当前正确率','orange')+cardMetric('bookmark',state.wrong.length,'累计错题','rose')+'</div>'+
  '<div class="layout-two"><section class="panel"><div class="panel-heading"><div><h2 class="section-heading">你的学习路径</h2><p class="section-sub">STEP BY STEP · 循序渐进</p></div><button class="tiny-link" data-action="route" data-route="learn" style="border:0;background:transparent;cursor:pointer">探索知识地图 →</button></div><div class="study-steps">'+
   '<div class="study-row" data-action="route" data-route="learn"><span class="step-number">01</span><div class="step-copy"><b>掌握知识框架</b><span>7个知识专题 · 重点梳理、知识导图</span></div><span class="step-arrow">'+ico('chevron')+'</span></div>'+
   '<div class="study-row" data-action="start-mode" data-mode="all"><span class="step-number">02</span><div class="step-copy"><b>完整题库刷题</b><span>40道单选 + 20道多选 · 全部60题</span></div><span class="step-arrow">'+ico('chevron')+'</span></div>'+
   '<div class="study-row" data-action="start-mode" data-mode="wrong"><span class="step-number">03</span><div class="step-copy"><b>错题强化训练</b><span>自动记录错题 · 反复查漏补缺</span></div><span class="step-arrow">'+ico('chevron')+'</span></div>'+
   '<div class="study-row" data-action="route" data-route="exam"><span class="step-number">04</span><div class="step-copy"><b>30题模拟考试</b><span>20单选 + 10多选 · 每题0.1分</span></div><span class="step-arrow">'+ico('chevron')+'</span></div>'+
  '</div></section><section class="panel"><div class="panel-heading"><div><h2 class="section-heading">学习快照</h2><p class="section-sub">PROGRESS OVERVIEW</p></div><span class="tag green">自动保存</span></div>'+
  '<div style="display:grid;justify-items:center;padding:1px 0 20px"><div class="result-ring" style="--score:'+percent(answered(),60)+'%;width:151px;height:151px;margin:0 auto;background:conic-gradient(#827bf2 var(--score),#eeeefa 0)"><div class="result-ring-in" style="width:129px;height:129px"><div><strong style="font-size:29px">'+percent(answered(),60)+'%</strong><span>整体学习进度</span></div></div></div></div>'+
  '<div style="display:grid;gap:12px">'+qs.slice().sort((a,b)=>b.done-a.done).slice(0,3).map(x=>'<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:7px"><b>'+esc(x.t.name)+'</b><span class="muted">'+x.done+'/'+x.n+'</span></div>'+progressEl(percent(x.done,x.n))+'</div>').join('')+'</div>'+
  '<div style="margin-top:20px;background:var(--soft);border-radius:14px;padding:13px;font-size:11px;color:var(--sub);line-height:1.7">'+ico('clock')+' <span>'+esc(lastText)+'</span></div></section></div>'+
  '<div style="margin-top:38px" class="stack-head"><div><h2 class="section-heading">从这里继续探索</h2><p class="section-sub">按专题构建你的知识体系</p></div><button class="tiny-link" data-action="route" data-route="learn" style="background:transparent;border:0;cursor:pointer">查看全部 →</button></div>'+
  gridTopics();
 animateCounters();
}
function renderLearn(){
 $('#content').innerHTML=heading('LEARNING MAP','知识地图','将60道试题拆解为7大知识专题。先理解知识，再通过练习巩固记忆。')+
 '<div class="exam-banner" style="margin:0 0 24px"><div><h3>不是机械地背答案，而是建立知识关联。</h3><p>每个专题包含核心提纲、重点串讲、知识导图和对应专题练习。<br>选择任意卡片，即可展开系统学习。</p></div><span style="font-size:46px;color:#9990ed">✧</span></div>'+
 gridTopics();
}
function renderTopic(topicName){
 const t=topics.find(t=>t.name===topicName);
 if(!t){go('learn');return}
 const qs=qByTopic(t.name),n=qs.filter(q=>isDone(q.id)).length,p=percent(n,qs.length);
 const cards=t.guide.map((pair,i)=>'<div class="topic-accordion"><button class="accordion-head" data-action="accordion" aria-expanded="'+(i===0?'true':'false')+'"><span class="step-number">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(pair[0])+'</strong>'+ico('chevron-down')+'</button><div class="accordion-body" style="'+(i===0?'height:auto':'')+'"><div class="accordion-inner"><div class="guide-item" style="--i:'+i+'"><span class="guide-dot"></span><span>'+esc(pair[1])+'</span></div></div></div></div>').join('');
 $('#content').innerHTML='<div style="margin-bottom:17px"><button class="quest-return" data-action="route" data-route="learn">'+ico('back')+' 返回知识地图</button></div>'+
 '<div class="eyebrow">'+esc(t.tag)+'</div><div class="topic-feature"><div class="topic-symbol" style="background:'+t.bg+';color:'+t.color+'">'+t.symbol+'</div><div><h2>'+esc(t.name)+'</h2><p>'+esc(t.tagline)+'</p></div></div>'+
 '<div class="knowledge-layout"><section class="knowledge-card"><div class="panel-heading"><div><h3 style="margin:0">知识提纲 · 核心考点</h3><p class="section-sub">点按每一项展开详情</p></div><span class="tag">'+t.guide.length+' 个考点</span></div>'+cards+'</section>'+
 '<div style="display:grid;gap:17px;align-content:start"><section class="knowledge-card"><h3 style="font-size:16px;margin:0 0 12px">知识关联图</h3><div class="mindmap"><div class="mindmap-center">'+esc(t.name)+'</div><div class="mindmap-line"></div><div class="mindmap-points">'+t.guide.map(p=>'<span>'+esc(p[0])+'</span>').join('')+'</div></div></section>'+
 '<section class="knowledge-card"><div class="summary-kicker">MEMORY NOTE</div><h3 style="font-size:15px;margin:10px 0">记忆建议</h3><div class="study-tip">'+esc(t.tip)+'</div><div style="margin-top:19px;display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="muted" style="font-size:11px">'+n+'/'+qs.length+' 题已做</span><span class="muted" style="font-size:11px">'+p+'%</span></div><div style="margin:10px 0 19px">'+progressEl(p)+'</div>'+
 '<button class="button primary" style="width:100%" data-action="start-topic" data-topic="'+esc(t.name)+'">'+ico('arrow')+' 练习本专题 · '+qs.length+'题</button><button class="button soft" style="width:100%;margin-top:10px" data-action="toggle-learned" data-topic="'+esc(t.name)+'">'+ico('check')+(state.learned[t.name]?' 已标记学过 · 撤销':' 标记本专题已学习')+'</button></section></div></div>';
}
function renderPracticeBank(){
 $('#content').innerHTML=heading('QUESTION BANK','完整题库 · 60题','40道单项选择 + 20道多项选择，原题完整收录，可搜索、筛选或从任意题目接着练习。')+
 '<div class="exam-banner" style="margin:0 0 24px"><div><h3>不用猜考试会抽哪道题，60道全部练到。</h3><p>完整刷题保持独立进度；随机练习另行记忆。所有已答题目会记录答题情况。</p></div><button class="button primary" data-action="start-mode" data-mode="all">'+ico('arrow')+' 进入完整刷题</button></div>'+
 '<div class="panel" style="margin-bottom:16px"><div class="stack-head" style="margin-bottom:15px"><div><h2 class="section-heading">题目目录</h2><p class="section-sub">点击题目直接定位到完整刷题对应位置</p></div><span id="bankCount" class="tag">60题</span></div><div class="search-wrap">'+ico('search')+'<input id="bankSearch" placeholder="搜索题干、选项、知识点…" autocomplete="off" value="'+esc(bankQuery)+'" aria-label="搜索题库"></div><div class="chips" style="margin-top:13px"><button class="chip '+(bankType==='all'?'selected':'')+'" data-action="bank-type" data-type="all">全部题型</button><button class="chip '+(bankType==='single'?'selected':'')+'" data-action="bank-type" data-type="single">单选 · 40</button><button class="chip '+(bankType==='multi'?'selected':'')+'" data-action="bank-type" data-type="multi">多选 · 20</button></div><div class="chips" style="margin-top:10px"><button class="chip '+(bankTopic==='all'?'selected':'')+'" data-action="bank-topic" data-topic="all">全部专题</button>'+topics.map(t=>'<button class="chip '+(bankTopic===t.name?'selected':'')+'" data-action="bank-topic" data-topic="'+esc(t.name)+'">'+esc(t.name)+'</button>').join('')+'</div></div>'+
 '<div class="question-bank" id="bankResults"></div>';
 renderBankRows();
}
function renderBankRows(){
 const term=bankQuery.trim().toLowerCase();
 const qs=all.filter(q=>(bankType==='all'||q.type===bankType)&&(bankTopic==='all'||q.topic===bankTopic)&&(!term||[q.stem,q.topic,...q.options,q.explanation].some(s=>s.toLowerCase().includes(term))));
 $('#bankCount').textContent=qs.length+' 题';
 $('#bankResults').innerHTML=qs.map(q=>'<div class="bank-row" role="button" tabindex="0" data-action="jump-question" data-id="'+q.id+'"><span class="bank-index">'+q.id+'</span><div class="bank-copy"><b>'+esc(q.stem)+'</b><span>'+esc(q.topic)+' · '+(q.type==='single'?'单选':'多选')+(isDone(q.id)?' · '+(state.attempts[q.id].correct?'已答对':'已答错'):' · 未作答')+'</span></div><span class="bank-end">'+ico('chevron')+'</span></div>').join('')||'<div class="empty-state"><h3>没有找到匹配的题目</h3><p>试试其他搜索词或清除筛选。</p></div>';
}
function renderReview(){
 const tab=state.reviewTab==='star'?'star':'wrong';
 const ids=tab==='star'?state.starred:state.wrong;
 const qs=all.filter(q=>ids.includes(q.id));
 $('#content').innerHTML=heading('REVIEW SPACE','回顾与强化','收藏重点题目，反复练习易错知识点，把薄弱处变成得分点。')+
 '<div class="chips" style="margin-bottom:18px"><button class="chip '+(tab==='wrong'?'selected':'')+'" data-action="review-tab" data-tab="wrong">'+ico('alert-circle')+' 错题本 '+state.wrong.length+'</button><button class="chip '+(tab==='star'?'selected':'')+'" data-action="review-tab" data-tab="star">'+ico('bookmark')+' 我的收藏 '+state.starred.length+'</button></div>'+
 (qs.length?'<div class="panel" style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:10px"><div><b style="font-size:14px">'+(tab==='wrong'?'专项攻克错题':'收藏题目回顾')+'</b><p class="section-sub">'+qs.length+' 道题 · 单独记忆进度</p></div><button class="button primary" data-action="start-mode" data-mode="'+(tab==='wrong'?'wrong':'star')+'">'+ico('arrow')+' 开始练习</button></div><div class="question-bank">'+qs.map(q=>'<div class="bank-row" role="button" tabindex="0" data-action="jump-review" data-mode="'+(tab==='wrong'?'wrong':'star')+'" data-id="'+q.id+'"><span class="bank-index">'+q.id+'</span><div class="bank-copy"><b>'+esc(q.stem)+'</b><span>'+esc(q.topic)+' · '+(q.type==='single'?'单选':'多选')+'</span></div><button class="small-action" data-action="remove-review" data-id="'+q.id+'" data-kind="'+tab+'" title="从本列表移除">'+ico('x')+'</button></div>').join('')+'</div>':
 '<div class="empty-state"><span class="empty-icon">'+ico(tab==='wrong'?'check-circle':'bookmark')+'</span><h3>'+(tab==='wrong'?'目前没有错题':'还没有收藏题目')+'</h3><p>'+(tab==='wrong'?'练习时答错的题目会自动收录在这里。':'做题时点击星标即可收藏需要重复记忆的考点。')+'</p><button class="button primary" style="margin:17px auto 0" data-action="start-mode" data-mode="all">前往完整刷题 '+ico('arrow')+'</button></div>');
}
function renderStats(){
 let reports=state.exams||[];
 $('#content').innerHTML=heading('LEARNING INSIGHTS','学习报告','将每一次练习转化为可见的学习反馈。所有记录只保存在当前浏览器。')+
 '<div class="stats-grid">'+cardMetric('check',answered(),'已答题数','green')+cardMetric('target',accuracy(),'正确率 %')+cardMetric('alert-circle',state.wrong.length,'错题累计','rose')+cardMetric('medal',reports.length,'模拟考试次数','orange')+'</div>'+
 '<div class="layout-two"><section class="panel"><div class="panel-heading"><div><h2 class="section-heading">知识点掌握情况</h2><p class="section-sub">按专题查看已覆盖的题目数</p></div></div><div style="display:grid;gap:20px">'+topics.map(t=>{const qs=qByTopic(t.name),n=qs.filter(q=>isDone(q.id)).length;return '<div><div style="display:flex;justify-content:space-between;margin-bottom:9px;font-size:12px"><b>'+esc(t.name)+'</b><span class="muted">'+n+'/'+qs.length+' · '+percent(n,qs.length)+'%</span></div>'+progressEl(percent(n,qs.length))+'</div>'}).join('')+'</div></section>'+
 '<section class="panel"><div class="panel-heading"><div><h2 class="section-heading">模拟考试记录</h2><p class="section-sub">真实题型比例 · 每题0.1分</p></div></div>'+(reports.length?'<div style="display:grid;gap:10px">'+reports.slice().reverse().slice(0,7).map((r,i)=>'<div style="padding:14px 15px;border:1px solid var(--line);border-radius:14px;display:flex;justify-content:space-between"><span style="font-size:12px">第 '+(reports.length-i)+' 次 · '+esc(r.date)+'</span><b style="color:var(--accent)">'+r.score.toFixed(1)+' / 3.0</b></div>').join('')+'</div>':'<div class="empty-state" style="padding:26px 15px;border:0;box-shadow:none"><span class="empty-icon">'+ico('medal')+'</span><p>完成第一次模拟考试后<br>这里会显示你的历史成绩。</p></div>')+'</section></div>'+
 '<div class="panel" style="margin-top:22px"><div class="panel-heading"><div><h2 class="section-heading">数据与隐私</h2><p class="section-sub">GitHub Pages 静态网站，无需账号，进度保存在本机 localStorage</p></div></div><div class="setting-row"><div><b>备份学习记录</b><small>下载包含练习、错题、收藏和考试历史的 JSON 文件</small></div><button class="pill-button" data-action="export">'+ico('download')+' 导出</button></div><div class="setting-row"><div><b>重新开始学习</b><small>清空本网站记录，不影响 GitHub 上的其他学习项目</small></div><button class="pill-button" data-action="clear" style="color:#e47e8c">清空记录</button></div></div>';
 animateCounters();
}
function analysisHTML(q){
 return q.options.map((opt,i)=>{
  const k='ABCD'[i],right=q.answer.includes(k);
  const text=right?'这一项符合本题的正确考点，是材料标定的正确选项。':'这项并非材料给出的正确选项。应结合题干限定词核对事实，尤其留意相近概念、极端措辞或错误数量。';
  return '<div class="option-analysis"><span class="analysis-key '+(right?'right':'')+'">'+k+' '+(right?'✓':'×')+'</span><div><b style="font-size:11px">'+esc(opt)+'</b><div style="font-size:11px;color:var(--sub);line-height:1.7;margin-top:2px">'+text+'</div></div></div>';
 }).join('');
}
function explanationHTML(q,isRight){
 return '<div class="explanation"><div class="explanation-header" style="color:'+(isRight?'#25ad90':'#e3828e')+'">'+ico(isRight?'check-circle':'alert-circle')+(isRight?'回答正确，理解这个考点':'这题需要再巩固一下')+'</div>'+
 '<p class="explanation-body"><b style="color:var(--ink)">正确答案 '+q.answer+'</b> · '+esc(q.explanation)+'</p>'+
 '<button class="small-action" aria-expanded="'+(expandedKey===q.id?'true':'false')+'" style="margin-top:14px;color:var(--accent)" data-action="analysis" data-id="'+q.id+'">'+ico('chevron-down')+' '+(expandedKey===q.id?'收起':'展开')+'逐项判断</button>'+
 '<div class="accordion-body analysis-drawer" style="'+(expandedKey===q.id?'height:auto':'')+'"><div class="accordion-inner" style="padding:9px 0 0">'+analysisHTML(q)+'<div class="explain-disclaimer">逐项提示为学习辅助，原材料仅提供标准答案；请以原题答案为准。</div></div></div></div>';
}
function renderQuiz(mode){
 const s=getSession(mode);
 if(state.lastMode!==mode){state.lastMode=mode;save()}
 if(!s.order.length){go('review');return}
 const id=s.order[s.index],q=qmap.get(id),entry=s.answers[id],draft=s.drafts[id]||[],selected=entry?.selected||draft;
 const n=s.order.length,done=s.order.filter(id=>s.answers[id]).length;
 const title=modeLabel(mode),display=(s.index+1)+' / '+n;
 const opts=q.options.map((opt,i)=>{
  const isSel=selected.includes(i),isCorrect=entry&&q.answer.includes('ABCD'[i]),isWrong=entry&&isSel&&!q.answer.includes('ABCD'[i]);
  const style=isCorrect?' correct':isWrong?' wrong':isSel?' selected':'';
  const icoEnd=entry&&(isCorrect||isWrong)?'<span class="answer-icon">'+ico(isCorrect?'check':'x')+'</span>':'';
  return '<button class="answer'+style+'" data-action="choice" data-index="'+i+'" '+(entry?'disabled':'')+' aria-pressed="'+Boolean(isSel)+'"><span class="answer-key">'+ 'ABCD'[i]+'</span><span>'+esc(opt)+'</span>'+icoEnd+'</button>';
 }).join('');
 const footer='<div class="quiz-bottom"><div class="quiz-bottom-inner"><button class="button soft" data-action="prev" '+(s.index===0?'disabled':'')+'>'+ico('back')+' 上一题</button><span class="step-counter">'+display+'</span><button class="button primary" data-action="next">'+(s.index===n-1?'完成本轮':'下一题')+' '+ico('arrow')+'</button></div></div>';
 $('#content').innerHTML='<div class="quest-layout"><div class="quest-topline"><button class="quest-return" data-action="route" data-route="home">'+ico('back')+' 返回首页</button><div class="quest-meta">'+esc(title)+' · 已做 '+done+'/'+n+'</div></div>'+
 '<div class="quest-progress"><span style="width:'+percent(s.index+1,n)+'%"></span></div>'+
 '<section class="quest-panel"><div class="quest-tags"><span class="tag">'+(q.type==='single'?'单项选择':'多项选择')+'</span><span class="tag grey">'+esc(q.topic)+'</span><span class="tag grey">题库 '+q.id+'</span></div>'+
 '<h2 class="question-title">'+esc(q.stem)+'</h2>'+
 '<div class="answers">'+opts+'</div>'+
 (q.type==='multi'&&!entry?'<button class="button primary multi-submit" data-action="submit-multi" '+(selected.length?'':'disabled')+'>'+ico('check')+' 提交多选答案（'+selected.length+'项）</button>':'')+
 (entry?explanationHTML(q,entry.correct):'<div style="font-size:11px;color:var(--sub);margin-top:16px">'+ico('info')+' '+(q.type==='multi'?'多选题选好后点击提交；多选、少选、错选均不得分。':'单选题点击选项后自动判题，无需额外提交。')+'</div>')+
 '<div class="quest-feedback"><button class="small-action '+(state.starred.includes(q.id)?'on':'')+'" data-action="star" data-id="'+q.id+'">'+ico('star')+' '+(state.starred.includes(q.id)?'已收藏':'收藏本题')+'</button><button class="small-action" data-action="retry" data-id="'+q.id+'">'+ico('reset')+' 重新回答</button></div></section>'+
 '<p style="text-align:center;font-size:10px;color:var(--sub);margin:18px 0">每题都可自由前后切换，答题进度自动保存至本机。</p></div>'+footer;
}
function renderPracticeSummary(mode){
 const s=getSession(mode),done=s.order.filter(id=>s.answers[id]),ok=done.filter(id=>s.answers[id].correct).length;
 $('#content').innerHTML='<div class="exam-result"><div class="eyebrow">PRACTICE COMPLETE</div><h1 class="page-title">这一轮练习，完成了。</h1><p class="page-lead">'+esc(modeLabel(mode))+' · 你的每一道练习记录都已保存</p><div class="result-ring" style="--score:'+percent(ok,Math.max(1,done.length))+'%"><div class="result-ring-in"><div><strong>'+percent(ok,Math.max(1,done.length))+'%</strong><span>本轮正确率</span></div></div></div><div class="result-detail"><div class="result-pill"><b>'+done.length+'</b><span>已答题</span></div><div class="result-pill"><b>'+ok+'</b><span>正确</span></div><div class="result-pill"><b>'+Math.max(0,done.length-ok)+'</b><span>错误</span></div></div><div class="result-actions"><button class="button primary" data-action="start-mode" data-mode="'+esc(mode)+'">'+ico('back')+' 返回刷题</button><button class="button soft" data-action="restart-mode" data-mode="'+esc(mode)+'">'+ico('reset')+' 新一轮练习</button><button class="button soft" data-action="route" data-route="home">返回首页</button></div></div>';
}
function newExam(){
 const single=shuffle(all.filter(q=>q.type==='single')).slice(0,20);
 const multi=shuffle(all.filter(q=>q.type==='multi')).slice(0,10);
 state.exam={ids:[...single,...multi].map(q=>q.id),index:0,answers:{},drafts:{},started:Date.now(),finished:false};
 save();
}
function renderExamIntro(){
 const active=state.exam&&!state.exam.finished;
 $('#content').innerHTML=heading('MOCK EXAM','模拟考试','按照复习材料中的考试规则，从题库抽取30道题，检验真实掌握程度。')+
 '<div class="exam-banner" style="margin:0"><div><div class="eyebrow">EXAM FORMAT</div><h3>30 道题 · 满分 3.0 分</h3><p>单选 20题 / 多选 10题，每题0.1分。答题期间不显示答案，交卷后统一评分。</p></div><span style="font-size:47px;color:#8c85df">'+ico('medal')+'</span></div>'+
 '<div class="stats-grid exam-stats">'+cardMetric('check-circle',20,'单项选择')+cardMetric('layers',10,'多项选择','orange')+cardMetric('medal','3.0','考试总分','green')+'</div>'+
 '<div class="panel" style="max-width:700px;margin:auto"><h2 class="section-heading">考前须知</h2><div class="guide-list" style="margin:20px 0">'+[
 '题目从60道原题中抽取，覆盖单选和多选两种题型。',
 '多选题只有完全选对才得分，多选、少选、错选均不得分。',
 '进入试卷后可以前后切换，途中自动保存进度。',
 '交卷后显示总分、正确数以及每道错题对应的正确答案。'
 ].map((x,i)=>'<div class="guide-item" style="--i:'+i+'"><span class="guide-dot"></span><span>'+x+'</span></div>').join('')+'</div>'+
 '<button class="button primary" style="width:100%" data-action="start-exam">'+ico('arrow')+(active?' 继续上次模拟考试':' 开始模拟考试')+'</button>'+(active?'<button class="button soft" style="margin-top:10px;width:100%" data-action="new-exam">'+ico('shuffle')+' 放弃旧卷，重新抽题</button>':'')+'</div>';
}
function renderExamQuestion(){
 const ex=state.exam;
 if(!ex||ex.finished){go('exam');return}
 const q=qmap.get(ex.ids[ex.index]),entry=ex.answers[q.id],selected=entry?.selected||ex.drafts[q.id]||[],done=Object.keys(ex.answers).length;
 const options=q.options.map((opt,i)=>'<button class="answer'+(selected.includes(i)?' selected':'')+'" data-action="exam-choice" data-index="'+i+'" aria-pressed="'+selected.includes(i)+'"><span class="answer-key">'+ 'ABCD'[i]+'</span><span>'+esc(opt)+'</span></button>').join('');
 $('#content').innerHTML='<div class="quest-layout"><div class="quest-topline"><button class="quest-return" data-action="route" data-route="exam">'+ico('back')+' 返回考前页</button><div class="quest-meta">已完成 '+done+' / 30 题</div></div><div class="quest-progress"><span style="width:'+percent(ex.index+1,30)+'%"></span></div><div class="quest-panel"><div class="quest-tags"><span class="tag">'+(q.type==='single'?'单项选择':'多项选择')+'</span><span class="tag grey">模拟考试</span><span class="tag grey">第 '+(ex.index+1)+' 题 / 30</span></div><h2 class="question-title">'+esc(q.stem)+'</h2><div class="answers">'+options+'</div>'+
 (q.type==='multi'?'<button class="button primary multi-submit" data-action="exam-submit-multi" '+(selected.length?'':'disabled')+'>'+ico('check')+' 确认本题多选答案</button>':
 '<p style="font-size:11px;color:var(--sub);margin-top:16px">单选题选择后即保存；考试结束前不显示正确答案。</p>')+
 '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:21px;font-size:11px;color:var(--sub)"><span>'+ico('clock')+' 答案已在本机自动保存</span><span class="tag '+(entry?'green':'grey')+'">'+(entry?'已作答':'未完成')+'</span></div></div></div>'+
 '<div class="quiz-bottom"><div class="quiz-bottom-inner"><button class="button soft" data-action="exam-prev" '+(ex.index===0?'disabled':'')+'>'+ico('back')+' 上一题</button><span class="step-counter">'+(ex.index+1)+' / 30</span><button class="button primary" data-action="exam-next">'+(ex.index===29?'交卷评分':'下一题')+' '+ico('arrow')+'</button></div></div>';
}
function finishExam(){
 const ex=state.exam;if(!ex)return;
 const answeredN=Object.keys(ex.answers).length;
 if(answeredN<30&&!confirm('还有 '+(30-answeredN)+' 道题未作答，确定现在交卷吗？'))return;
 const correctN=ex.ids.filter(id=>ex.answers[id]&&correct(qmap.get(id),ex.answers[id].selected)).length;
 const history={date:timeStamp(),score:Number((correctN*.1).toFixed(1)),correct:correctN,total:30,ids:ex.ids,answers:JSON.parse(JSON.stringify(ex.answers))};
 state.exams.push(history);ex.finished=true;save();go('exam-result');
}
function renderExamResult(){
 const ex=state.exam; if(!ex?.finished){go('exam');return}
 const hist=state.exams[state.exams.length-1];if(!hist){go('exam');return}
 const wrong=hist.ids.filter(id=>!hist.answers[id]||!correct(qmap.get(id),hist.answers[id].selected));
 $('#content').innerHTML='<div class="exam-result"><div class="eyebrow">EXAM FINISHED</div><h1 class="page-title">试卷已交，成绩出炉。</h1><p class="page-lead">30道题已经完成判分。接下来重点关注尚未掌握的知识。</p><div class="result-ring" style="--score:'+percent(hist.correct,30)+'%"><div class="result-ring-in"><div><strong>'+hist.score.toFixed(1)+'</strong><span>满分 3.0 分</span></div></div></div><div class="result-detail"><div class="result-pill"><b>'+hist.correct+'</b><span>回答正确</span></div><div class="result-pill"><b>'+wrong.length+'</b><span>错误 / 空题</span></div><div class="result-pill"><b>'+percent(hist.correct,30)+'%</b><span>准确率</span></div></div><div class="result-actions"><button class="button primary" data-action="new-exam">'+ico('reset')+' 再考一次</button><button class="button soft" data-action="route" data-route="home">返回首页</button></div></div>'+
 '<div style="max-width:790px;margin:40px auto 0"><div class="stack-head"><div><h2 class="section-heading">需要巩固的题目</h2><p class="section-sub">'+wrong.length+' 道 · 展开查看原题与正确答案</p></div></div>'+
 (wrong.length?wrong.map((id,i)=>{const q=qmap.get(id),got=hist.answers[id]?toLetters(hist.answers[id].selected):'未作答';return '<div class="topic-accordion"><button class="accordion-head" data-action="accordion" aria-expanded="false"><span class="bank-index">'+id+'</span><strong>'+esc(q.stem)+'</strong>'+ico('chevron-down')+'</button><div class="accordion-body"><div class="accordion-inner"><div class="tag red" style="display:inline-block">你的答案：'+got+' · 正确：'+q.answer+'</div><p class="explanation-body" style="margin:12px 0">'+esc(q.explanation)+'</p>'+analysisHTML(q)+'</div></div></div>'}).join(''):'<div class="empty-state"><h3>全部答对，做得很好！</h3><p>你已经掌握了本套试卷的全部30道题。</p></div>')+'</div>';
}
function updateUIState(route){
 const isQuiz=route.startsWith('quiz/')||route==='exam-play';document.body.classList.toggle('is-quiz',isQuiz);
 const active=route==='learn'||route.startsWith('topic/')?'learn':route==='practice'||route.startsWith('quiz/')?'practice':route==='review'?'review':route==='stats'?'stats':'home';
 $('#desktopNav').innerHTML=nav.map(([id,label,icon])=>'<a class="nav-link '+(active===id?'active':'')+'" href="#'+(id==='practice'?'quiz/all':id)+'">'+ico(icon)+label+'</a>').join('');
 $('#mobileNav').innerHTML=nav.map(([id,label,icon])=>'<a class="mobile-link '+(active===id?'active':'')+'" href="#'+(id==='practice'?'quiz/all':id)+'">'+ico(icon)+'<span>'+label+'</span></a>').join('');
 $('#currentCrumb').textContent=route.startsWith('quiz/')?'练习模式':route.startsWith('topic/')?'专题学习':route==='exam-play'?'模拟考试':{home:'学习总览',learn:'知识学习',practice:'完整刷题',review:'错题收藏',stats:'学习报告',exam:'模拟考试','exam-result':'考试成绩'}[route]||'学习空间';
 $('#themeToggle').innerHTML=ico(state.theme==='dark'?'sun':'moon');
}
function render(){
 if(!all.length)return;
 const r=hash();
 updateUIState(r);
 if(r==='home')renderHome();
 else if(r==='learn')renderLearn();
 else if(r.startsWith('topic/'))renderTopic(r.slice(6));
 else if(r==='practice')renderPracticeBank();
 else if(r==='review')renderReview();
 else if(r==='stats')renderStats();
 else if(r.startsWith('quiz/'))renderQuiz(r.slice(5));
 else if(r.startsWith('summary/'))renderPracticeSummary(r.slice(8));
 else if(r==='exam')renderExamIntro();
 else if(r==='exam-play')renderExamQuestion();
 else if(r==='exam-result')renderExamResult();
 else{location.hash='#home';renderHome();}
 if(!r.startsWith('quiz/')&&r!=='exam-play'&&r!=='practice')window.scrollTo({top:0,behavior:'instant'});
}
function moveIndex(delta){
 const mode=hash().slice(5),s=getSession(mode);
 if(s.index===s.order.length-1&&delta>0){go('summary/'+encodeURIComponent(mode));return}
 s.index=Math.max(0,Math.min(s.order.length-1,s.index+delta));expandedKey='';save();
 renderQuiz(mode);window.scrollTo({top:0,behavior:'instant'});
}
function changeChoice(i){
 const mode=hash().slice(5),s=getSession(mode),q=qmap.get(s.order[s.index]);if(s.answers[q.id])return;
 if(q.type==='single')recordAnswer(q,[i],s);
 else{const curr=s.drafts[q.id]||[];s.drafts[q.id]=curr.includes(i)?curr.filter(x=>x!==i):[...curr,i].sort();save();}
 const oldY=window.scrollY;
 renderQuiz(mode);window.scrollTo(0,oldY);
}
function submitMulti(){
 const mode=hash().slice(5),s=getSession(mode),q=qmap.get(s.order[s.index]),sel=s.drafts[q.id]||[];
 if(!sel.length)return;
 recordAnswer(q,sel,s);const y=window.scrollY;renderQuiz(mode);window.scrollTo(0,y);
}
function flipAccordion(button){
 const shell=button.nextElementSibling;if(!shell)return;
 const was=button.getAttribute('aria-expanded')==='true',expanding=!was;
 const current=Math.max(0,shell.getBoundingClientRect().height);
 shell.style.transition='none';shell.style.height=current+'px';void shell.offsetHeight;
 const target=expanding?shell.scrollHeight:0;
 button.setAttribute('aria-expanded',String(expanding));
 shell.style.transition='height '+(expanding?430:335)+'ms cubic-bezier(.18,.82,.22,1)';
 requestAnimationFrame(()=>{shell.style.height=target+'px'});
 const seq=(shell.__seq||0)+1;shell.__seq=seq;
 const onEnd=(ev)=>{if(ev.propertyName!=='height'||shell.__seq!==seq)return;if(expanding)shell.style.height='auto';shell.removeEventListener('transitionend',onEnd)};
 shell.addEventListener('transitionend',onEnd);
 if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){shell.style.height=expanding?'auto':'0px';return}
 if(expanding&&shell.animate){
  const rows=$$('.guide-item,.option-analysis',shell),step=rows.length>1?Math.min(42,180/(rows.length-1)):0;
  rows.forEach((row,i)=>row.animate([{opacity:0,transform:'translateY(-9px) scaleY(.82)'},{opacity:1,transform:'translateY(0) scaleY(1)'}],{duration:245,delay:58+i*step,easing:'cubic-bezier(.18,.86,.25,1)'}));
 }
}
function getButton(event){
 return event.target.closest('[data-action]');
}
document.addEventListener('click',ev=>{
 const b=getButton(ev);if(!b||!all.length)return;
 const action=b.dataset.action,mode=b.dataset.mode,topic=b.dataset.topic,id=b.dataset.id;
 switch(action){
 case 'route':go(b.dataset.route);break;
 case 'continue':openQuiz(state.lastMode||'all');break;
 case 'start-mode':openQuiz(mode||'all');break;
 case 'start-topic':openQuiz('topic:'+topic);break;
 case 'open-topic':go('topic/'+encodeURIComponent(topic));break;
 case 'jump-question':{const s=getSession('all');openQuiz('all',s.order.indexOf(id));break;}
 case 'jump-review':{const s=getSession(mode,true);openQuiz(mode,s.order.indexOf(id));break;}
 case 'bank-type':bankType=b.dataset.type;renderPracticeBank();break;
 case 'bank-topic':bankTopic=topic;renderPracticeBank();break;
 case 'review-tab':state.reviewTab=b.dataset.tab;save();renderReview();break;
 case 'remove-review':{const name=b.dataset.kind==='star'?'starred':'wrong';state[name]=state[name].filter(x=>x!==id);delete state.sessions[name==='wrong'?'wrong':'star'];save();renderReview();break;}
 case 'choice':changeChoice(Number(b.dataset.index));break;
 case 'submit-multi':submitMulti();break;
 case 'prev':moveIndex(-1);break;
 case 'next':moveIndex(1);break;
 case 'star':state.starred=state.starred.includes(id)?state.starred.filter(x=>x!==id):[...state.starred,id];save();renderQuiz(hash().slice(5));toast(state.starred.includes(id)?'已加入收藏':'已取消收藏');break;
 case 'retry':{const m=hash().slice(5),s=getSession(m);delete s.answers[id];delete s.drafts[id];save();renderQuiz(m);toast('可以重新作答');break;}
 case 'analysis':{expandedKey=expandedKey===id?'':id;const btn=b;btn.innerHTML=ico('chevron-down')+' '+(expandedKey===id?'收起':'展开')+'逐项判断';const shell=btn.nextElementSibling;if(shell){btn.setAttribute('aria-expanded',expandedKey===id?'true':'false');flipRaw(shell,expandedKey===id)}break;}
 case 'accordion':flipAccordion(b);break;
 case 'toggle-learned':state.learned[topic]=!state.learned[topic];save();renderTopic(topic);toast(state.learned[topic]?'已标记为学过':'标记已撤销');break;
 case 'restart-mode':if(confirm('重新开启这一模式的新一轮练习？此前的全局错题与学习记录仍会保留。')){getSession(mode,true);save();openQuiz(mode);}break;
 case 'start-exam':if(!state.exam||state.exam.finished)newExam();go('exam-play');break;
 case 'new-exam':if(!state.exam||state.exam.finished||confirm('重新抽题会放弃当前未提交的试卷，确定继续吗？')){newExam();go('exam-play');}break;
 case 'exam-choice':{const ex=state.exam,q=qmap.get(ex.ids[ex.index]),i=Number(b.dataset.index);if(q.type==='single'){ex.answers[q.id]={selected:[i]};delete ex.drafts[q.id];}else{const old=ex.drafts[q.id]||ex.answers[q.id]?.selected||[];ex.drafts[q.id]=old.includes(i)?old.filter(x=>x!==i):[...old,i].sort();delete ex.answers[q.id];}save();const y=window.scrollY;renderExamQuestion();window.scrollTo(0,y);break;}
 case 'exam-submit-multi':{const ex=state.exam,q=qmap.get(ex.ids[ex.index]),sel=ex.drafts[q.id]||ex.answers[q.id]?.selected||[];if(sel.length){ex.answers[q.id]={selected:sel};delete ex.drafts[q.id];save();renderExamQuestion();toast('本题答案已保存');}break;}
 case 'exam-prev':state.exam.index=Math.max(0,state.exam.index-1);save();renderExamQuestion();window.scrollTo(0,0);break;
 case 'exam-next':if(state.exam.index===29)finishExam();else{state.exam.index++;save();renderExamQuestion();window.scrollTo(0,0);}break;
 case 'export':{const data=new Blob([JSON.stringify({app:'知序政治理论应知应会',version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download='知序-政治理论学习备份.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('学习记录已导出');break;}
 case 'clear':if(confirm('确定清空本网站的全部学习进度、错题和模拟考试记录吗？此操作不可撤销。')){state=empty();save();go('home');toast('学习记录已清空');}break;
 }
});
function flipRaw(shell,expanded){
 const curr=Math.max(0,shell.getBoundingClientRect().height);
 shell.style.transition='none';shell.style.height=curr+'px';void shell.offsetHeight;
 shell.style.transition='height 380ms cubic-bezier(.18,.82,.22,1)';
 requestAnimationFrame(()=>shell.style.height=(expanded?shell.scrollHeight:0)+'px');
 if(expanded){const onEnd=e=>{if(e.propertyName==='height'){shell.style.height='auto';shell.removeEventListener('transitionend',onEnd)}};shell.addEventListener('transitionend',onEnd)}
}
document.addEventListener('keydown',ev=>{
 const t=ev.target.closest('[data-action][role=button]');if(t&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();t.click()}
});
document.addEventListener('input',ev=>{
 if(ev.target.id==='bankSearch'){bankQuery=ev.target.value;renderBankRows();}
});
$('#themeToggle').addEventListener('click',()=>{
 state.theme=state.theme==='dark'?'light':'dark';document.documentElement.classList.toggle('dark',state.theme==='dark');save();$('#themeToggle').innerHTML=ico(state.theme==='dark'?'sun':'moon');
});
window.addEventListener('hashchange',render);
document.documentElement.classList.toggle('dark',state.theme==='dark');
fetch('questions.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('题库请求失败');return r.json()}).then(data=>{
 all=data.questions.map(q=>({...q,options:q.options.map(String)}));qmap=new Map(all.map(q=>[q.id,q]));
 if(all.length!==60||all.filter(q=>q.type==='single').length!==40||all.filter(q=>q.type==='multi').length!==20||all.some(q=>q.options.length!==4||!q.answer||!q.topic)){throw new Error('题库数据校验未通过')}
 if(!location.hash)history.replaceState(null,'','#home');
 render();
}).catch(err=>{
 $('#content').innerHTML='<div class="empty-state" style="margin:50px auto;max-width:600px"><span class="empty-icon">'+ico('alert-circle')+'</span><h3>题库载入失败</h3><p>'+esc(err.message)+'。请确认通过 GitHub Pages 或本地 HTTP 服务访问网站（直接双击HTML可能无法读取 JSON）。</p><button class="button primary" onclick="location.reload()">重新加载</button></div>';
});
})();