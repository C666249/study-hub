/* FMV REAL SCENES: explicit asset-ID keyed demos. No family-wide placeholder pretending to be original motion. */
(function(){
'use strict';
const D=document, PI=Math.PI;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const E=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ico=(d)=>'<svg viewBox="0 0 24 24" style="width:17px;height:17px;margin:0 auto;stroke:currentColor;fill:none;stroke-width:1.8" aria-hidden="true"><path d="'+d+'"/></svg>';
const sceneType={
'FMV-TAB-GLASS-GEL-001':'gel',
'FMV-NAV-LEDGER-TAB-001':'ledger',
'FMV-SELECT-JELLY-001':'jelly',
'FMV-SEG-RUBBER-001':'rubber',
'FMV-NAV-GOOEY-001':'gooey',
'FMV-WK8-GLASS-008':'arc',
'FMV-DISCLOSURE-CASCADE-001':'cascade',
'FMV-SEARCH-GROW-CASCADE-001':'search',
'FMV-CARD-FLIP-001':'flip',
'FMV-CARD-SWAP-001':'deck',
'FMV-STUDY-DECK-360-001':'deck360',
'FMV-MASK-SLIDE-001':'mask',
'FMV-GAUGE-SLOSH-001':'slosh',
'FMV-WK8-GLASS-003':'glassmenu',
'FMV-WK8-GLASS-005':'sheet',
'FMV-CARD-LEDGER-FLIGHT-001':'flight',
'FMV-LIST-LEDGER-REFLOW-001':'reflow',
'FMV-DRAG-REORDER-001':'reorder',
'FMV-WK8-COVER-001':'cover',
'FMV-NUM-COUNTER-001':'counter',
'FMV-MODE-RIPPLE-MASK-001':'ripple',
'FMV-LOAD-LATTICE-001':'loader',
'FMV-WK8-MOTION-005':'skeleton',
'FMV-WK8-READER-002':'reader',
'FMV-BG-PARTICLES-001':'particles',
'FMV-WK8-NAV-004':'retained',
'FMV-WK8-GLASS-007':'switch',
'FMV-WK8-SEARCH-001':'expandsearch',
'FMV-WK8-MOTION-001':'reveal',
'FMV-GESTURE-LEDGER-SWIPE-001':'swipe',
'FMV-WK8-NAV-001':'glassdock',
'FMV-WK8-COVER-005':'shelf',
'FMV-WK8-MOTION-002':'batch',
'FMV-WK8-NAV-002':'trail',
'FMV-WK8-MOTION-006':'toast'
};
const keyOf=x=>sceneType[typeof x==='string'?x:x.id];
function tabHTML(labels,mode){
let icons=[ico('M5 12l7-7 7 7M12 5v14'),ico('M4 6h16M4 12h16M4 18h16'),ico('M12 3l3 7 7 2-7 3-3 7-3-7-7-3 7-2Z')];
return '<div class="fx '+(mode==='ledger'?'fx-flow':'')+'"><div class="fx-head">'+(mode==='ledger'?'FLOWLEDGER · 420 MS':'GLASSMATCH · 510 MS')+'</div><div class="fx-dock '+(mode==='gel'?'gel':'')+'"><div class="fx-thumb"></div>'+labels.map((n,i)=>'<button type="button" data-slot="'+i+'" class="'+(!i?'active':'')+'">'+icons[i%3]+E(n)+'</button>').join('')+'</div><div class="fx-page-sentence">同一枚高亮片 · 移动中保持身份</div></div>'
}
function html(x){
const type=keyOf(x);if(!type)return '';
switch(type){
case'gel':return tabHTML(['题库','错题','我的'],'gel');
case'ledger':return tabHTML(['账单','统计','设置'],'ledger');
case'jelly':return '<div class="fx"><div class="fx-head">JELLY RADIO · NEIGHBOR YIELD</div><div class="fx-chipset">'+['柔和','标准','强劲','极致'].map((n,i)=>'<button class="'+(i===1?'sel':'')+'" data-slot="'+i+'">'+n+'</button>').join('')+'</div><div class="fx-note">选中项膨胀 · 邻项依距离让位</div></div>';
case'rubber':return '<div class="fx"><div class="fx-head">RUBBER SEGMENT · DRAG & FLICK</div><div class="fx-rubber"><div class="rubber-thumb"></div>'+['低','标准','高'].map((n,i)=>'<button data-slot="'+i+'" class="'+(!i?'sel':'')+'">'+n+'</button>').join('')+'</div><div class="fx-note">按住滑块拖动 · 越界橡皮筋阻力</div></div>';
case'gooey':return '<div class="fx"><div class="fx-head">GOOEY NAV · 15 PARTICLES</div><svg width="0" height="0" style="position:absolute"><defs><filter id="fmv-goo-effect"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 17 -8"/></filter></defs></svg><div class="fx-goo"><div class="goo-ink"><span class="goo-blob"></span></div>'+['作品','收藏','设置'].map((n,i)=>'<button data-slot="'+i+'" class="'+(!i?'active':'')+'">'+n+'</button>').join('')+'</div><div class="fx-note">粒子向新选中项凝聚 · ≈600ms</div></div>';
case'arc':return '<div class="fx"><div class="fx-head">ARC READER · FOUR SEARCH MODES</div><div class="fx-arc"><div class="fx-arc-tabs"><i class="fx-arc-thumb"></i>'+['书名','作者','标签','ID'].map((n,i)=>'<button data-slot="'+i+'" class="'+(!i?'active':'')+'">'+n+'</button>').join('')+'</div><div class="fx-arc-search">搜索书名</div><div class="fx-arc-result">切换筛选后，结果状态独立更新</div></div></div>';
case'cascade':return '<div class="fx"><div class="fx-head">NEXA · MEASURED CASCADE</div><div class="fx-accord"><div class="fx-accord-top" role="button" tabindex="0"><span>今天的待办事项</span><i class="fx-chevron"></i></div><div class="fx-accord-body">'+['复习本周词汇','完善交互布局','回顾设计笔记','整理组件文档'].map(n=>'<div class="fx-acc-row">'+n+'</div>').join('')+'</div></div><div class="fx-note">容器真实长高 · 逐项入场 / 倒序收回</div></div>';
case'search':return '<div class="fx"><div class="fx-head">LEXI · SEARCH PLANE & CASCADE</div><div class="fx-overlay-base"><h3>lexi</h3><p>轻触「查词」体验搜索幕布与历史层级</p></div><div class="fx-search-scrim"></div><button class="fx-search-open" type="button">查词</button><div class="fx-search-plane"><div class="search-row">'+ico('M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m6 14 5 5')+'<span>输入单词...</span></div><div class="fx-search-history">'+['exclusive','contemplate','retrieve','aesthetic'].map(n=>'<div>'+n+'</div>').join('')+'</div></div></div>';
case'flip':return '<div class="fx"><div class="fx-head">LUNAXY · DUAL FACE ALIVE</div><div class="fx-cardflip" role="button" tabindex="0"><div class="fx-cardflip-inner"><div class="fx-cardface">NIGHT<br/>WAVES</div><div class="fx-cardface back"><div>♪<br/>让音乐缓缓落下<br/>一行行歌词仍在原位</div></div></div></div><div class="fx-note">旋转 180° · 正反面保持存活</div></div>';
case'deck':return '<div class="fx"><div class="fx-head">CARD STACK · EXIT & REFLOW</div><div class="fx-cardstack"><div class="fx-stackcard">STUDY / 01<strong>Focus.</strong></div><div class="fx-stackcard">STUDY / 02<strong>Flow.</strong></div><div class="fx-stackcard">STUDY / 03<strong>Ease.</strong></div></div><div class="fx-note">向左或右拖动前卡松手</div></div>';
case'deck360':return '<div class="fx"><div class="fx-head">LEXI · 360° ELASTIC DECK</div><div class="fx-cardstack fx-360"><div class="fx-stackcard">WORD / 01<strong>vivid</strong></div><div class="fx-stackcard">WORD / 02<strong>fluid</strong></div><div class="fx-stackcard">WORD / 03<strong>mellow</strong></div></div><div class="fx-note">上下左右甩动 · 反向返回</div></div>';
case'mask':return '<div class="fx"><div class="fx-head">LEXI · REVERSIBLE MASK</div><div class="fx-mask"><strong>serendipity</strong><div class="mask-row"><div class="mask-answer">n. 意外发现美好事物的机缘</div><div class="mask-cover"></div></div></div><div class="fx-note">点击细遮蔽条 · 同一条纸片侧滑</div></div>';
case'slosh':return '<div class="fx"><div class="fx-head">FLUID GAUGE · DAMPED OSCILLATION</div><div class="fx-fluid"><div class="water"></div></div><div class="fx-note">点击液面上涨 / 回落 · 有惯性晃动</div></div>';
case'glassmenu':return '<div class="fx"><div class="fx-head">WENKU8 · MENU FROM ANCHOR</div><button class="fx-glass-trigger" type="button">打开选项</button><div class="fx-glass-menu">'+['最近阅读','按名称排序','阅读偏好'].map(n=>'<div class="fx-menu-item">'+n+'</div>').join('')+'</div><div class="fx-note">以触发按钮为几何起点生长</div></div>';
case'sheet':return '<div class="fx"><div class="fx-head">WENKU8 · GLASS SHEET</div><button class="fx-glass-trigger" type="button">阅读选项</button><div class="fx-sheet-scrim"></div><div class="fx-sheet-panel"><h4>阅读设置</h4><p>字体大小　·　行距　·　背景</p><div style="display:flex;gap:9px;margin-top:16px"><span style="background:#ffffffb3;padding:7px 12px;border-radius:8px;font-size:11px">A−</span><span style="background:#ffffffb3;padding:7px 12px;border-radius:8px;font-size:11px">A+</span></div></div></div>';
case'flight':return '<div class="fx"><div class="fx-head">FLOWLEDGER · 640 MS DELETION FLIGHT</div><div class="fx-flight-list">'+['咖啡 · ¥38.00','地铁 · ¥6.00','书店 · ¥49.90'].map(n=>'<div class="fl-row">'+n+'</div>').join('')+'</div><div class="fx-note">点击第一条 · 右上飞出，后续平稳补位</div></div>';
case'reflow':return '<div class="fx"><div class="fx-head">STABLE ID · 360 MS FLIP REFLOW</div><div class="fx-flight-list">'+['序列 A · 保留','序列 B · 删除','序列 C · 补位'].map(n=>'<div class="fl-row">'+n+'</div>').join('')+'</div><div class="fx-note">点击第二条 · 后续卡片保持身份补位</div></div>';
case'reorder':return '<div class="fx"><div class="fx-head">LUNAXY · DRAG / YIELD / DROP</div><div class="fx-reorder-list">'+['私人电台','夜晚播放','舒缓精选'].map((n,i)=>'<div class="r-row" data-key="'+i+'"><span>'+n+'</span><span class="grip"></span></div>').join('')+'</div><div class="fx-note">按住列表项拖动 · 松手提交次序</div></div>';
case'cover':return '<div class="fx"><div class="fx-head">WENKU8 · COVER SHARED ELEMENT</div><div class="fx-cover"><div class="fx-cover-thumb"></div><div class="fx-cover-txt"><strong>月光档案</strong><p>轻触封面，观察同一个对象走向详情，而非淡出再创建。</p></div></div><div class="fx-note">封面保持对象身份</div></div>';
case'counter':return '<div class="fx"><div class="fx-head">SPRING COUNT · CANCELABLE</div><div class="fx-count">1,280</div><div class="fx-note">点击数字 · 真实连续数值插值</div></div>';
case'ripple':return '<div class="fx"><div class="fx-head">MODE ORIGIN · RIPPLED TRANSITION</div><div class="fx-ripple"></div><button class="fx-ripple-trigger">切换学习模式</button><div class="fx-note">以触点为圆心覆盖区域</div></div>';
case'loader':return '<div class="fx"><div class="fx-head">ASYNC · LATTICE STATUS</div><div class="fx-loader">'+Array.from({length:9},(_,i)=>'<span style="--i:'+i+'"></span>').join('')+'</div><div class="fx-note">点击标记任务完成 / 再次重新加载</div></div>';
case'skeleton':return '<div class="fx"><div class="fx-head">WENKU8 · SKELETON HANDOFF</div><div class="fx-skeleton loading"><div class="fx-sk-row"><i class="fx-sk-avatar"></i><div class="fx-sk-lines"><span></span><span></span></div></div><div class="fx-sk-text"><strong>风与光的记录</strong><p>正文内容加载完成后，骨架与结果状态连续交接。</p></div></div><div class="fx-note">点击模拟数据加载完成</div></div>';
case'reader':return '<div class="fx"><div class="fx-head">WENKU8 · CONTINUOUS PAGE TURN</div><div class="fx-reader"><div class="page bottom"><span></span><span></span><span></span><span></span><span></span></div><div class="page top"><span></span><span></span><span></span><span></span><span></span></div></div><div class="fx-note">点击翻动 · 书页围绕书脊旋转</div></div>';
case'particles':return '<div class="fx"><div class="fx-head">LUNAXY · POINTER PARTICLE FIELD</div><canvas class="fx-canvas" style="position:absolute;inset:0;width:100%;height:100%"></canvas><div class="fx-note">触摸并移动，星点随手势聚拢</div></div>';
case'retained':return '<div class="fx"><div class="fx-head">WENKU8 · RETAINED PAGE PANES</div><div class="fx-retained" style="width:220px;height:140px;position:relative;perspective:500px"><div class="pane a" style="position:absolute;inset:0;border-radius:15px;padding:20px;background:#e7e9f6;color:#3b4660;transition:transform .55s,opacity .5s">发现<hr/>图书推荐　·　最近更新</div><div class="pane b" style="position:absolute;inset:0;border-radius:15px;padding:20px;background:#b0bfe9;color:#333e61;transform:translate(-24px,12px);opacity:0;transition:transform .55s,opacity .5s">书架<hr/>已保存的 12 本图书</div></div><div class="fx-note">点击页面，保留原 Pane 的内部状态</div></div>';
case'switch':return '<div class="fx"><div class="fx-head">WENKU8 · LIQUID GLASS CONTROLS</div><div class="fx-switchbox" style="width:80%;max-width:250px;background:#cbd8efab;border:1px solid #fff8;backdrop-filter:blur(17px);padding:17px;border-radius:20px;color:#293850"><div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:720">柔和滚动 <button class="fx-switch" role="switch" aria-checked="true" style="width:53px;height:31px;border:0;border-radius:99px;background:#667bc6;padding:4px;display:flex;justify-content:flex-end"><i style="display:block;width:23px;height:23px;border-radius:50%;background:#fff;box-shadow:0 2px 7px #0003;transition:transform .3s"></i></button></div><div style="margin-top:16px"><input type="range" min="0" max="100" value="64" style="width:100%;accent-color:#667bc6" aria-label="玻璃滑块"></div></div></div>';
case'expandsearch':return '<div class="fx"><div class="fx-head">WENKU8 · SEARCH WIDTH GROWTH</div><div class="fx-expandsearch" style="height:50px;width:60px;background:#e8effbea;border:1px solid #fff8;border-radius:17px;display:flex;align-items:center;gap:10px;padding:0 17px;box-shadow:0 15px 31px #0003;color:#526382;transition:width .5s cubic-bezier(.2,1.15,.33,1);overflow:hidden;white-space:nowrap">'+ico('M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16m6 14 5 5')+'<span>搜索书籍、作者或标签</span></div><div class="fx-note">搜索按钮在原位横向生长</div></div>';
case'reveal':return '<div class="fx"><div class="fx-head">WENKU8 · LAYERED ENTRY</div><div class="fx-revealbox" style="width:77%;max-width:240px"><div class="tit" style="font-size:25px;letter-spacing:-.06em">Discover.</div><div class="rule" style="height:1px;width:100%;background:#bdb9f7;margin:12px 0"></div><div class="body" style="font-size:11px;color:#b4bbd4;line-height:1.8">从标题开始，细线延展，然后内容逐层入场。</div></div><div class="fx-note">点击重播 · 标题 / 细线 / 内容</div></div>';
case'swipe':return '<div class="fx"><div class="fx-head">FLOWLEDGER · TWO-DETENT RUBBER SWIPE</div><div class="fx-swipebox" style="width:84%;max-width:260px;height:69px;position:relative;touch-action:none"><div class="under" style="position:absolute;inset:0;border-radius:14px;background:#354668;display:flex;align-items:center;justify-content:flex-end;padding-right:14px;font-size:10px">向左滑动</div><div class="surface" style="position:absolute;inset:0;border-radius:14px;background:#ecedf8;color:#3b4260;display:flex;align-items:center;padding:0 17px;box-shadow:0 13px 29px #0003;touch-action:none;will-change:transform"><span>奶茶　 ¥19.90</span></div></div><div class="fx-note">第一档编辑 · 第二档删除 · 松手回弹</div></div>';
case'glassdock':return '<div class="fx"><div class="fx-head">WENKU8 · ELASTIC GLASS DOCK</div><div class="fx-wk-dock" style="display:flex;gap:7px;align-items:center;position:relative;padding:7px;border-radius:25px;background:#ffffff25;border:1px solid #fff6;backdrop-filter:blur(15px);box-shadow:0 15px 33px #0004"><div class="lens" style="position:absolute;top:7px;bottom:7px;left:7px;width:54px;border-radius:17px;background:linear-gradient(135deg,#ffffffd8,#a9c9f1ca);border:1px solid #fff9;box-shadow:0 5px 15px #0004;transition:left .54s cubic-bezier(.17,1.2,.3,1),width .54s,transform .54s"></div>'+['首页','发现','收藏','设置'].map((n,i)=>'<button data-slot="'+i+'" style="min-width:52px;height:47px;border:0;background:none;position:relative;z-index:2;color:'+(i?'#f3f6ff':'#3b4464')+';font-size:11px">'+n+'</button>').join('')+'</div><div class="fx-note">一枚透镜沿玻璃轨道连续迁移</div></div>';
case'shelf':return '<div class="fx"><div class="fx-head">WENKU8 · SPATIAL BOOKSHELF</div><div class="fx-shelf" style="height:158px;display:flex;gap:4px;align-items:center;perspective:550px">'+['#b29fb9','#9eb8c6','#e0b9a0','#98a3d6','#c4b8b4'].map((c,i)=>'<div class="vol" style="width:39px;height:'+(113-Math.abs(i-2)*14)+'px;transform:rotateY('+(i-2)*14+'deg) translateY('+(Math.abs(i-2)*5)+'px);background:linear-gradient(130deg,'+c+',#3b4b6c);border:1px solid #fff6;border-radius:5px;box-shadow:4px 9px 14px #0004;transition:transform .53s"></div>').join('')+'</div><div class="fx-note">点触封面 · 立体视角依次让位</div></div>';
case'batch':return '<div class="fx"><div class="fx-head">WENKU8 · ASYNC BATCH CASCADE</div><div class="fx-batch" style="width:83%;max-width:235px;display:grid;gap:8px">'+['搜索结果 01','搜索结果 02','搜索结果 03'].map(n=>'<div style="padding:12px;border-radius:10px;background:#e5eaf5;color:#425574;font-size:11px;opacity:0;transform:translateY(13px)">'+n+'</div>').join('')+'</div><div class="fx-note">点击 · 每条结果独立入场</div></div>';
case'trail':return '<div class="fx"><div class="fx-head">WENKU8 · VELOCITY LIQUID TRAIL</div><div class="fx-trail" style="display:flex;position:relative;gap:8px;background:#ffffff17;border:1px solid #fff6;padding:8px;border-radius:22px"><div class="blob" style="width:46px;height:45px;position:absolute;left:8px;top:8px;background:#cdd9f3a3;border:1px solid #fff8;border-radius:16px;transition:transform .6s cubic-bezier(.18,1.25,.36,1),width .35s"></div>'+['1','2','3','4'].map((n,i)=>'<button data-slot="'+i+'" style="position:relative;z-index:2;width:46px;height:45px;border:0;background:none">'+n+'</button>').join('')+'</div><div class="fx-note">长距离切换产生速度尾流</div></div>';
case'toast':return '<div class="fx"><div class="fx-head">WENKU8 · FLOATING STATUS CUE</div><button class="fx-glass-trigger">完成保存</button><div class="fx-popup" style="position:absolute;top:45px;left:50%;transform:translate(-50%,-15px) scale(.84);opacity:0;background:#ecf7fbef;color:#344b5d;padding:11px 20px;border-radius:13px;font-size:11px;box-shadow:0 12px 25px #0004;transition:opacity .25s,transform .36s">已成功保存</div></div>';
default:return '';
}}
function init(stage,x){
stage.dataset.scene=keyOf(x);
if(stage.dataset.scene==='particles')setupParticles(stage);
if(stage.dataset.scene==='rubber')setupRubber(stage);
if(stage.dataset.scene==='swipe')setupSwipe(stage);
if(stage.dataset.scene==='deck'||stage.dataset.scene==='deck360')setupDeck(stage);
if(stage.dataset.scene==='reorder')setupReorder(stage);
if(stage.dataset.scene==='cascade')stage.querySelector('.fx-accord-top').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();trigger(stage,e)}});
}
function trigger(stage,e){
if(!stage||!stage.isConnected)return;
const type=stage.dataset.scene;const q=s=>stage.querySelector(s);
switch(type){
case'gel':case'ledger':{
const dock=q('.fx-dock'),buttons=[...dock.querySelectorAll('button')],i=e?.target?.closest('[data-slot]')?Number(e.target.closest('[data-slot]').dataset.slot):(Number(stage.dataset.index||0)+1)%buttons.length;
const thumb=q('.fx-thumb');if(type==='gel'){
const target=buttons[i],currentRect=thumb.getBoundingClientRect(),navRect=dock.getBoundingClientRect();
thumb.style.width=target.offsetWidth+'px';thumb.style.transform='translateX('+(target.offsetLeft-6)+'px)';
thumb.classList.remove('jiggle');void thumb.offsetWidth;thumb.classList.add('jiggle');
buttons.forEach((b,j)=>b.classList.toggle('active',j===i));
}else{
if(stage._ledgerRAF)cancelAnimationFrame(stage._ledgerRAF);
const nav=dock.getBoundingClientRect(),thumbRect=thumb.getBoundingClientRect(),startLeft=thumbRect.left-nav.left,fromWidth=thumbRect.width,endLeft=buttons[i].offsetLeft,endWidth=buttons[i].offsetWidth;
const travel=(endLeft+endWidth/2)-(startLeft+fromWidth/2),stretch=Math.min(28,Math.abs(travel)*.24),start=performance.now();
const frame=now=>{if(!stage.isConnected)return;const p=Math.min(1,(now-start)/(reduced()?1:420)),ease=1-Math.pow(1-p,3),recoil=Math.sin(2*PI*p)*(1-p)*travel*.045;
const center=startLeft+fromWidth/2+travel*ease+recoil,w=fromWidth+(endWidth-fromWidth)*ease+Math.sin(PI*p)*stretch;
thumb.style.left=(center-w/2)+'px';thumb.style.width=w+'px';thumb.style.transform='scaleY('+(1-.045*Math.sin(PI*p))+')';
if(p>=.6)buttons.forEach((b,j)=>b.classList.toggle('active',j===i));
if(p<1)stage._ledgerRAF=requestAnimationFrame(frame);else{thumb.style.left=endLeft+'px';thumb.style.width=endWidth+'px';thumb.style.transform='scaleY(1)';buttons.forEach((b,j)=>b.classList.toggle('active',j===i))}};
stage._ledgerRAF=requestAnimationFrame(frame);
}
stage.dataset.index=String(i);
const sentence=q('.fx-page-sentence');sentence.textContent=(type==='gel'?['题库：每一道题都轻盈落位','错题：高亮片像凝胶一样回弹','我的：页面和导航有不同的时钟'][i]:['账单：共享 Thumb 保留身份','统计：中段拉长 28px 上限','设置：420ms 结束后精确归槽'][i]);sentence.classList.remove('enter');void sentence.offsetWidth;sentence.classList.add('enter');
break}
case'jelly':{
const buttons=[...stage.querySelectorAll('.fx-chipset button')];const i=e?.target?.closest('button')?buttons.indexOf(e.target.closest('button')):(Number(stage.dataset.index||1)+1)%buttons.length;
if(i<0)return;stage.dataset.index=String(i);
buttons.forEach((b,j)=>{const d=j-i,falloff=Math.max(.25,1-Math.abs(d)*.29);const tx=d===0?0:(Math.sign(d)*(b.offsetWidth*.2/2+6)*falloff);
b.style.transitionDelay=(Math.abs(d)*22)+'ms';b.style.transform='translateX('+tx+'px) scale('+(j===i?1.19:.95)+','+(j===i?1.08:.98)+')';b.classList.toggle('sel',i===j)});
break}
case'gooey':{
const root=q('.fx-goo'),buttons=[...root.querySelectorAll('button')],i=e?.target?.closest('button')?buttons.indexOf(e.target.closest('button')):(Number(stage.dataset.index||0)+1)%3;
if(i<0)return;stage.dataset.index=String(i);const selected=buttons[i],blob=q('.goo-blob'),ink=q('.goo-ink');const pos=selected.getBoundingClientRect(),r=root.getBoundingClientRect();
blob.animate([{transform:getComputedStyle(blob).transform==='none'?'translateX(0px)':getComputedStyle(blob).transform,opacity:1},{transform:'translateX('+(pos.left-r.left-10)+'px)',opacity:1}],{duration:reduced()?0:380,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
blob.style.transform='translateX('+(pos.left-r.left-10)+'px)';buttons.forEach((b,j)=>b.classList.toggle('active',j===i));
ink.querySelectorAll('.goo-drop').forEach(x=>x.remove());
if(!reduced())for(let j=0;j<15;j++){const a=j*2*PI/15,drop=D.createElement('i');drop.className='goo-drop';const cx=pos.left-r.left+pos.width/2,cy=pos.top-r.top+pos.height/2;
drop.style.left=(cx-5)+'px';drop.style.top=(cy-5)+'px';ink.append(drop);
const radius=45+(j%4)*10,dx=Math.cos(a)*radius,dy=Math.sin(a)*radius;
drop.animate([{transform:'translate('+dx+'px,'+dy+'px) scale(.3)',opacity:0},{transform:'translate('+(dx*.38)+'px,'+(dy*.38)+'px) scale(1.25)',opacity:1,offset:.52},{transform:'translate(0,0) scale(.25)',opacity:0}],{duration:530+(j%5)*35,easing:'cubic-bezier(.2,.75,.3,1)'}).onfinish=()=>drop.remove();}
break}
case'arc':{
const buttons=[...q('.fx-arc-tabs').querySelectorAll('button')],i=e?.target?.closest('button')?buttons.indexOf(e.target.closest('button')):(Number(stage.dataset.index||0)+1)%4;if(i<0)return;
stage.dataset.index=i;q('.fx-arc-thumb').style.transform='translateX('+(i*100)+'%)';buttons.forEach((b,j)=>b.classList.toggle('active',i===j));
q('.fx-arc-search').textContent=['搜索书名','搜索作者','按标签筛选','请输入完整书籍 ID'][i];const output=q('.fx-arc-result');output.classList.add('waiting');output.textContent='';clearTimeout(stage._arcTimer);stage._arcTimer=setTimeout(()=>{if(stage.isConnected){output.classList.remove('waiting');output.textContent=['正在展示书名搜索结果','正在展示作者作品','标签匹配结果','书籍 ID 精确匹配'][i]}},380);break}
case'cascade':{
const panel=q('.fx-accord'),body=q('.fx-accord-body'),rows=[...q('.fx-accord-body').children];const open=!panel.classList.contains('expanded'),duration=open?Math.min(535,350+rows.length*24):Math.min(420,270+rows.length*18);const current=body.getBoundingClientRect().height,target=open?body.scrollHeight:0;
panel.classList.toggle('expanded',open);body.getAnimations().forEach(a=>a.cancel());body.style.height=current+'px';
const a=body.animate([{height:current+'px'},{height:target+'px'}],{duration:reduced()?0:duration,easing:open?'cubic-bezier(.18,.82,.22,1)':'cubic-bezier(.28,.62,.30,1)',fill:'forwards'});a.onfinish=()=>{if(a.playState!=='idle')body.style.height=(open?'auto':'0px');a.cancel()};
rows.forEach((r,j)=>{r.getAnimations().forEach(a=>a.cancel());const pos=open?j:(rows.length-1-j);r.animate(open?[{opacity:0,transform:'translateY(-9px) scaleY(.82)'},{opacity:1,transform:'none'}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-9px) scaleY(.84)'}],{delay:reduced()?0:(open?58:0)+pos*(open?42:32),duration:reduced()?0:open?245:175,easing:open?'cubic-bezier(.18,.86,.25,1)':'cubic-bezier(.36,0,.70,.34)'})});break}
case'search':{
const scrim=q('.fx-search-scrim'),plane=q('.fx-search-plane'),hist=q('.fx-search-history');if(stage._searchBusy)return;stage._searchBusy=true;
const opening=stage.dataset.searchOpen!=='true';stage.dataset.searchOpen=String(opening);scrim.style.opacity=opening?'1':'0';const rows=[...hist.children];
if(opening){plane.style.opacity='1';plane.animate([{transform:'translateX(125%)'},{transform:'translateX(0)'}],{duration:reduced()?1:420,easing:'cubic-bezier(.2,1.13,.3,1)',fill:'forwards'}).onfinish=()=>{plane.style.transform='translateX(0)'};setTimeout(()=>{if(!stage.isConnected||stage.dataset.searchOpen!=='true')return;const h=hist.scrollHeight;hist.animate([{height:'0px'},{height:h+'px'}],{duration:reduced()?1:597,easing:'cubic-bezier(.2,1,.3,1)',fill:'forwards'}).onfinish=()=>{hist.style.height=h+'px'};rows.forEach((row,i)=>row.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'none'}],{delay:80+i*60,duration:290,fill:'forwards',easing:'cubic-bezier(.18,.86,.25,1)'}))},265);setTimeout(()=>{stage._searchBusy=false},900)}
else{rows.slice().reverse().forEach((row,i)=>row.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-8px)'}],{delay:i*37,duration:190,fill:'both'}));const from=hist.getBoundingClientRect().height;hist.animate([{height:from+'px'},{height:'0px'}],{duration:reduced()?1:415,fill:'forwards',easing:'cubic-bezier(.28,.62,.3,1)'}).onfinish=()=>{hist.style.height='0px'};setTimeout(()=>{plane.animate([{transform:'translateX(0)'},{transform:'translateX(125%)'}],{duration:reduced()?1:320,fill:'forwards',easing:'ease-in'}).onfinish=()=>{plane.style.transform='translateX(125%)';plane.style.opacity='0';stage._searchBusy=false}},330)}
break}
case'flip':q('.fx-cardflip').classList.toggle('rotated');break;
case'mask':q('.fx-mask').classList.toggle('revealed');break;
case'slosh':{
const water=q('.water'),up=stage.dataset.high!=='true';stage.dataset.high=String(up);
const from=Number(stage.dataset.level||.49),to=up?.18:.51,t0=performance.now();const duration=reduced()?1:1300;
const frame=now=>{if(!stage.isConnected)return;let t=Math.min(1,(now-t0)/duration),base=from+(to-from)*(1-Math.exp(-7*t)),ring=.045*Math.exp(-4*t)*Math.sin(17*t),y=base+ring;
water.style.top=(100*y)+'%';water.style.setProperty('--tilt',Math.sin(t*17)*12*Math.exp(-3*t)+'deg');
if(t<1)stage._slosh=requestAnimationFrame(frame);else{stage.dataset.level=String(to);water.style.top=(100*to)+'%'}};
cancelAnimationFrame(stage._slosh);stage._slosh=requestAnimationFrame(frame);break}
case'glassmenu':q('.fx-glass-menu').classList.toggle('open');break;
case'sheet':q('.fx-sheet-panel').classList.toggle('open');q('.fx-sheet-scrim').classList.toggle('open');break;
case'flight':case'reflow':{
const list=q('.fx-flight-list');if(stage._flightBusy)return;stage._flightBusy=true;
if(list.children.length<2){list.innerHTML=(type==='flight'?['咖啡 · ¥38.00','地铁 · ¥6.00','书店 · ¥49.90']:['序列 A · 保留','序列 B · 删除','序列 C · 补位']).map(n=>'<div class="fl-row">'+n+'</div>').join('');stage._flightBusy=false;return}
const row=list.children[type==='reflow'?1:0];const pre=[...list.children].map(x=>({x,r:x.getBoundingClientRect()}));let ghost=null;
if(type==='flight'){ghost=row.cloneNode(true);ghost.style.cssText='position:absolute;z-index:22;margin:0;left:'+row.offsetLeft+'px;top:'+row.offsetTop+'px;width:'+row.offsetWidth+'px;height:'+row.offsetHeight+'px';list.style.position='relative';list.append(ghost);ghost.animate([{transform:'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:'translate(80px,-150px) rotate(-12deg) scale(.8)',opacity:0}],{duration:reduced()?1:640,easing:'cubic-bezier(.19,.47,.25,1)',fill:'forwards'});}
const delay=type==='flight'?620:40;setTimeout(()=>{if(!stage.isConnected)return;row.remove();ghost?.remove();[...list.children].forEach(x=>{const old=pre.find(y=>y.x===x);if(old){const dy=old.r.top-x.getBoundingClientRect().top;x.animate([{transform:'translateY('+dy+'px)'},{transform:'translateY(0px)'}],{duration:reduced()?1:360,easing:'cubic-bezier(.18,.8,.24,1)'})}});stage._flightBusy=false},delay);break}
case'cover':q('.fx-cover').classList.toggle('open');break;
case'counter':{let node=q('.fx-count'),from=Number((node.textContent||'').replace(/,/g,'')),to=from>3000?1280:6438;const start=performance.now();cancelAnimationFrame(stage._countRAF);
const tick=now=>{if(!stage.isConnected)return;let p=Math.min(1,(now-start)/(reduced()?1:740)),v=Math.round(from+(to-from)*(1-Math.pow(1-p,4))+Math.sin(p*10)*25*Math.exp(-6*p));node.textContent=v.toLocaleString('en-US');if(p<1)stage._countRAF=requestAnimationFrame(tick)};stage._countRAF=requestAnimationFrame(tick);break}
case'ripple':{let r=q('.fx-ripple'),rect=stage.getBoundingClientRect(),pX=((e?.clientX||rect.left+rect.width/2)-rect.left)/rect.width*100,pY=((e?.clientY||rect.top+rect.height/2)-rect.top)/rect.height*100;r.style.setProperty('--px',pX+'%');r.style.setProperty('--py',pY+'%');r.classList.toggle('open');q('.fx-ripple-trigger').textContent=r.classList.contains('open')?'恢复原始模式':'切换学习模式';break}
case'loader':q('.fx-loader').classList.toggle('done');break;
case'skeleton':q('.fx-skeleton').classList.toggle('loaded');q('.fx-skeleton').classList.toggle('loading');break;
case'reader':q('.fx-reader').classList.toggle('open');break;
case'retained':{const a=q('.pane.a'),b=q('.pane.b'),next=stage.dataset.toB!=='true';stage.dataset.toB=String(next);a.style.transform=next?'translate(24px,-12px)':'none';a.style.opacity=next?'0':'1';b.style.transform=next?'none':'translate(-24px,12px)';b.style.opacity=next?'1':'0';break}
case'switch':{if(e?.target?.closest('input'))return;const b=q('.fx-switch'),on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(on));b.style.background=on?'#667bc6':'#bac3da';b.style.justifyContent=on?'flex-end':'flex-start';break}
case'expandsearch':q('.fx-expandsearch').style.width=stage.dataset.expanded==='true'?'60px':'min(88%,285px)';stage.dataset.expanded=stage.dataset.expanded==='true'?'false':'true';break;
case'reveal':{const box=q('.fx-revealbox');const parts=[box.querySelector('.tit'),box.querySelector('.rule'),box.querySelector('.body')];parts.forEach((x,i)=>{x.getAnimations().forEach(a=>a.cancel());x.animate([{opacity:0,transform:i===1?'scaleX(0)':'translateY(13px)',transformOrigin:'left center'},{opacity:1,transform:'none'}],{duration:reduced()?1:360+i*120,delay:i*125,easing:'cubic-bezier(.2,1,.3,1)'})});break}
case'glassdock':{const root=q('.fx-wk-dock'),btns=[...root.querySelectorAll('button')],i=e?.target?.closest('button')?btns.indexOf(e.target.closest('button')):(Number(stage.dataset.index||0)+1)%btns.length;if(i<0)return;stage.dataset.index=i;const lens=q('.lens');const btn=btns[i];lens.style.left=btn.offsetLeft+'px';lens.style.width=btn.offsetWidth+'px';btns.forEach((b,j)=>b.style.color=i===j?'#3b4464':'#f3f6ff');break}
case'shelf':{const vols=[...q('.fx-shelf').children],i=e?.target?.closest('.vol')?vols.indexOf(e.target.closest('.vol')):(Number(stage.dataset.index||2)+1)%vols.length;stage.dataset.index=i;vols.forEach((v,j)=>v.style.transform='rotateY('+((j-i)*15)+'deg) translateY('+(Math.abs(j-i)*7)+'px) scale('+(i===j?1.17:1)+')');break}
case'batch':{[...q('.fx-batch').children].forEach((row,i)=>{row.getAnimations().forEach(a=>a.cancel());row.animate([{opacity:0,transform:'translateY(13px)'},{opacity:1,transform:'none'}],{duration:reduced()?1:320,delay:i*95,easing:'cubic-bezier(.2,1,.36,1)',fill:'both'})});break}
case'trail':{const b=[...q('.fx-trail').querySelectorAll('button')],i=e?.target?.closest('button')?b.indexOf(e.target.closest('button')):(Number(stage.dataset.index||0)+1)%b.length;if(i<0)return;stage.dataset.index=i;const blob=q('.fx-trail .blob');const dx=(b[i].offsetLeft-b[0].offsetLeft);blob.style.width='65px';blob.style.transform='translateX('+dx+'px) scaleY(.92)';setTimeout(()=>{blob.style.width='46px';blob.style.transform='translateX('+dx+'px)'},260);break}
case'toast':{const p=q('.fx-popup');p.style.opacity='1';p.style.transform='translate(-50%,0) scale(1)';clearTimeout(stage._toast);stage._toast=setTimeout(()=>{p.style.opacity='0';p.style.transform='translate(-50%,-12px) scale(.92)'},1250);break}
case'deck':case'deck360':case'rubber':case'swipe':case'reorder':case'particles':break;
}
}
function setupRubber(stage){
const root=stage.querySelector('.fx-rubber'),thumb=root.querySelector('.rubber-thumb'),buttons=[...root.querySelectorAll('button')];
let dragging=false,start=0,last=0,lastTime=0,velocity=0,id=null,index=0,currentX=0;
const slot=()=>((root.clientWidth-10)/3);
function settle(idx,v=0){index=Math.max(0,Math.min(2,idx));let end=index*slot();const from=currentX;thumb.animate([{left:(5+from)+'px',transform:'scaleX(1.23)'},{left:(5+end+(v>0?3:-3))+'px',transform:'scaleX(.88)',offset:.77},{left:(5+end)+'px',transform:'scaleX(1)'}],{duration:reduced()?1:370,easing:'cubic-bezier(.19,1,.33,1)'});currentX=end;thumb.style.left=(5+end)+'px';buttons.forEach((b,i)=>b.classList.toggle('sel',i===index))}
root.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b){settle(Number(b.dataset.slot));return}dragging=true;id=e.pointerId;start=e.clientX;last=e.clientX;lastTime=performance.now();velocity=0;root.setPointerCapture(id)});
root.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==id)return;e.preventDefault();let dx=e.clientX-start,raw=index*slot()+dx;let limit=slot()*2,elastic=raw<0?-Math.sqrt(Math.abs(raw))*5:raw>limit?limit+Math.sqrt(raw-limit)*5:raw;currentX=elastic;thumb.style.left=(5+elastic)+'px';thumb.style.transform='scaleX('+(1+Math.min(.28,Math.abs(dx)/500))+')';const t=performance.now(),dt=Math.max(1,t-lastTime);velocity=(e.clientX-last)/dt*1000;last=e.clientX;lastTime=t});
root.addEventListener('pointerup',e=>{if(!dragging||e.pointerId!==id)return;dragging=false;try{root.releasePointerCapture(id)}catch{}thumb.style.transform='';const projected=currentX+Math.max(-100,Math.min(100,velocity*.065));settle(Math.round(projected/slot()),velocity)});
root.addEventListener('pointercancel',()=>{dragging=false;settle(index)});
}
function setupDeck(stage){const stack=stage.querySelector('.fx-cardstack');let x0=0,y0=0,card=null,pid=null;
stack.addEventListener('pointerdown',e=>{card=stack.querySelector('.fx-stackcard');if(!card)return;pid=e.pointerId;x0=e.clientX;y0=e.clientY;stack.setPointerCapture(pid);card.style.transition='none'});
stack.addEventListener('pointermove',e=>{if(pid!==e.pointerId||!card)return;const dx=e.clientX-x0,dy=e.clientY-y0;card.style.transform='translate('+dx+'px,'+dy+'px) rotate('+(dx*.12)+'deg)'});
stack.addEventListener('pointerup',e=>{if(pid!==e.pointerId||!card)return;const dx=e.clientX-x0,dy=e.clientY-y0;pid=null;const dir=Math.abs(dx)>Math.abs(dy)?dx:dy;if(Math.hypot(dx,dy)>27){card.style.transition='transform .42s cubic-bezier(.22,1,.36,1),opacity .3s';card.style.transform='translate('+(dx*3)+'px,'+(dy*3)+'px) rotate('+(dx*.25)+'deg)';card.style.opacity='0';const target=card;setTimeout(()=>{if(!stack.isConnected)return;target.style.transition='none';target.style.opacity='1';target.style.transform='';stack.append(target);updateStack()},350)}else{card.style.transition='transform .4s cubic-bezier(.18,1.4,.35,1)';card.style.transform='';}card=null});
function updateStack(){const a=[...stack.children];a.forEach((c,i)=>{c.style.zIndex=String(3-i);c.style.transition='transform .35s cubic-bezier(.2,1,.3,1)';c.style.transform=i===0?'none':i===1?'translateY(12px) scale(.94) rotate(4deg)':'translateY(22px) scale(.88) rotate(-5deg)'});}updateStack();
}
function setupSwipe(stage){const root=stage.querySelector('.fx-swipebox'),surface=root.querySelector('.surface'),under=root.querySelector('.under');let p=null,startX=0,startY=0;
const rubber=(t,w)=>{let knee=w*.17,cap=w*.34,base=knee*.81;return Math.min(cap,t<=knee?t*.81:base+(cap-base)*(1-Math.exp(-(t-knee)*.72/Math.max(1,cap-base))))};
root.addEventListener('pointerdown',e=>{p=e.pointerId;startX=e.clientX;startY=e.clientY;root.setPointerCapture(p);surface.style.transition='none'});
root.addEventListener('pointermove',e=>{if(p!==e.pointerId)return;let dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;const travel=Math.max(0,-dx),w=root.clientWidth,stageLevel=travel>=Math.max(116,w*.37)?2:travel>=Math.max(52,w*.16)?1:0;surface.style.transform='translateX('+(-rubber(travel,w))+'px)';under.textContent=stageLevel===2?'松手删除':stageLevel===1?'松手编辑':'向左滑动';under.style.background=stageLevel===2?'#875164':'#354668'});
root.addEventListener('pointerup',e=>{if(p!==e.pointerId)return;p=null;surface.style.transition='transform .39s cubic-bezier(.18,1.25,.3,1)';surface.style.transform='translateX(0)'});
root.addEventListener('pointercancel',()=>{p=null;surface.style.transform='translateX(0)'});
}
function setupReorder(stage){
const list=stage.querySelector('.fx-reorder-list');let row=null,p=null,startY=0,startRect=null;
list.addEventListener('pointerdown',e=>{row=e.target.closest('.r-row');if(!row)return;p=e.pointerId;startY=e.clientY;startRect=row.getBoundingClientRect();list.setPointerCapture(p);row.classList.add('dragging')});
list.addEventListener('pointermove',e=>{if(p!==e.pointerId||!row)return;e.preventDefault();row.style.transform='translateY('+(e.clientY-startY)+'px) scale(1.035)'});
list.addEventListener('pointerup',e=>{if(p!==e.pointerId||!row)return;p=null;const rows=[...list.children],old=new Map(rows.map(x=>[x,x.getBoundingClientRect().top])),dy=e.clientY-startY,target=Math.max(0,Math.min(rows.length-1,rows.indexOf(row)+Math.round(dy/53)));
row.style.transform='';row.classList.remove('dragging');const rest=rows.filter(x=>x!==row);rest.splice(target,0,row);rest.forEach(x=>list.appendChild(x));rows.forEach(x=>{const delta=old.get(x)-x.getBoundingClientRect().top;x.animate([{transform:'translateY('+delta+'px)'},{transform:'translateY(0)'}],{duration:reduced()?1:360,easing:'cubic-bezier(.2,1,.36,1)'})});row=null});
list.addEventListener('pointercancel',()=>{p=null;if(row){row.style.transform='';row.classList.remove('dragging')}row=null});
}
function setupParticles(stage){
const c=stage.querySelector('canvas'),ctx=c.getContext('2d');if(!ctx)return;
let width=0,height=0,target={x:.5,y:.5},points=Array.from({length:75},(_,i)=>({x:((i*37+17)%101)/101,y:((i*71+19)%97)/97,z:.2+((i*13)%80)/100,phase:i}));
function size(){const rect=stage.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);c.width=Math.round(width*Math.min(2,devicePixelRatio||1));c.height=Math.round(height*Math.min(2,devicePixelRatio||1));ctx.setTransform(c.width/width,0,0,c.height/height,0,0)}
const obs=new ResizeObserver(size);obs.observe(stage);size();
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();target.x=(e.clientX-r.left)/r.width;target.y=(e.clientY-r.top)/r.height});
stage.addEventListener('pointerleave',()=>{target={x:.5,y:.5}});
let t=0;function draw(){if(!stage.isConnected){obs.disconnect();return}ctx.clearRect(0,0,width,height);t+=.009;
points.forEach(a=>{let driftX=Math.sin(t+a.phase)*.025,driftY=Math.cos(t*1.2+a.phase)*.018,dx=target.x-a.x,dy=target.y-a.y,attract=.14*Math.exp(-Math.hypot(dx,dy)*5),x=(a.x+driftX+dx*attract)*width,y=(a.y+driftY+dy*attract)*height,rad=(.6+a.z*2.1),alpha=.3+.6*a.z;ctx.beginPath();ctx.fillStyle='rgba(210,225,255,'+alpha+')';ctx.shadowBlur=9*a.z;ctx.shadowColor='#a9c6ff';ctx.arc(x,y,rad,0,2*PI);ctx.fill()});ctx.shadowBlur=0;stage._particle=requestAnimationFrame(draw)}
stage._particle=requestAnimationFrame(draw);
}
window.FMVScenes={has:x=>!!keyOf(x),html,init,trigger,count:()=>Object.keys(sceneType).length,keys:()=>Object.keys(sceneType)};
})();
