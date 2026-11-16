/* GlassMatch V4 · Lexi Search Curtain / measured cascade / word-text hero */
(()=>{
'use strict';
const app=document.querySelector('#app');if(!app||document.querySelector('#lexi-v4-root'))return;
const searchSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10.7" cy="10.7" r="6.6"/><path d="m16 16 5 5"/></svg>';
const backSvg='<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>';
const audioSvg='<svg viewBox="0 0 24 24"><path d="M5 9h4l5-4v14l-5-4H5V9zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>';
const root=document.createElement('div');root.id='lexi-v4-root';
root.innerHTML=[
'<section id="lexi-word-view" class="lexi-layer" aria-label="单词详情"><div class="lexi-detail-top">',
'<button class="lexi-ctrl" id="lexi-word-back" aria-label="返回之前的页面">'+backSvg+'</button><h2>词汇详情</h2>',
'<button class="lexi-ctrl" id="lexi-word-search" aria-label="再次搜索">'+searchSvg+'</button></div>',
'<div class="lexi-detail-content"><div class="lexi-detail-code">LEXICON / WORD ENTRY</div>',
'<section class="lexi-word-card" aria-live="polite"><div class="lexi-word-head"><h1 id="lexi-word-title"></h1></div>',
'<div class="lexi-pronounce"><span id="lexi-word-ipa"></span>',
'<button id="lexi-word-audio" aria-label="播放单词读音" hidden>'+audioSvg+'</button></div>',
'<div id="lexi-word-definitions"></div></section><p id="lexi-word-credit" class="lexi-word-credit"></p></div></section>',
'<div id="lexi-search-scrim" class="lexi-layer" aria-hidden="true"></div>',
'<div id="lexi-search-sheet" class="lexi-layer" role="dialog" aria-modal="true" aria-label="查词" aria-hidden="true">',
'<div class="lexi-search-row"><svg class="lexi-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
'<input id="lexi-search-input" type="search" placeholder="英文单词" autocomplete="off" enterkeyhint="search" spellcheck="false" aria-label="输入要查询的英文单词">',
'<button type="button" id="lexi-search-submit">查询</button></div>',
'<div id="lexi-history-shell"><div id="lexi-history-content">',
'<div id="lexi-history-heading"><span>历史</span><button id="lexi-history-toggle" type="button" aria-expanded="false" aria-label="展开或收起历史"><i class="lexi-chevron"></i></button></div>',
'<div id="lexi-history-list"></div></div></div><div id="lexi-search-error" role="status" aria-live="polite"></div></div>'
].join('');
app.append(root);
const $=s=>root.querySelector(s),view=$('#lexi-word-view'),title=$('#lexi-word-title');
const sheet=$('#lexi-search-sheet'),scrim=$('#lexi-search-scrim'),input=$('#lexi-search-input'),submit=$('#lexi-search-submit');
const shell=$('#lexi-history-shell'),content=$('#lexi-history-content'),list=$('#lexi-history-list'),toggle=$('#lexi-history-toggle'),error=$('#lexi-search-error');
const definitions=$('#lexi-word-definitions'),ipa=$('#lexi-word-ipa'),play=$('#lexi-word-audio');
const H='glassmatch_dict_history_v3',C='glassmatch_dict_v3';
const reduce=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const safe=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const later=(fn,ms)=>setTimeout(fn,reduce()?0:ms);
let terms=[],cache={};try{const t=JSON.parse(localStorage.getItem(H)||'[]');terms=Array.isArray(t)?t.filter(x=>typeof x==='string').slice(0,24):[]}catch{}
try{const x=JSON.parse(localStorage.getItem(C)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))cache=x}catch{}
let isOpen=false,expanded=false,busy=false,historyEntry=false,drawerSeq=0,enterSeq=0,querySeq=0,morphSeq=0;
let drawerAnims=[],drawerTimer=0,enterTimer=0,exitTimer=0,morphNode=null,morphSource=null,focusBefore=null,activeWord='',soundUrl='';
function stopMorph(){morphSeq++;morphNode?.remove();morphNode=null;if(morphSource){const {node,v,c}=morphSource;if(node.isConnected){node.style.visibility=v;node.style.color=c;}morphSource=null;}title.classList.remove('lexi-hidden-word');}
function stopDrawer(){drawerSeq++;clearTimeout(drawerTimer);for(const a of drawerAnims){try{a.cancel()}catch{}}drawerAnims=[];}
function drawHistory(){
 list.replaceChildren();
 for(const word of terms.slice(0,5)){
  const row=document.createElement('button');row.type='button';row.className='lexi-history-row';
  row.innerHTML='<span class="lexi-history-text">'+safe(word)+'</span>'+searchSvg;
  row.setAttribute('aria-label','查询 '+word);row.onclick=()=>lookup(word,row.querySelector('.lexi-history-text'));list.append(row);
 }
 shell.style.height='0px';toggle.setAttribute('aria-expanded','false');
}
function drawer(toOpen,done){
 stopDrawer();const seq=drawerSeq,rows=[...list.children],current=Math.max(0,shell.getBoundingClientRect().height);
 expanded=!!(toOpen&&rows.length);toggle.setAttribute('aria-expanded',String(expanded));
 const target=expanded?Math.min(content.scrollHeight,Math.max(210,window.innerHeight*.43)):0;
 const duration=reduce()?0:(expanded?525+Math.min(140,rows.length*18):415);
 shell.style.transition='none';shell.style.height=current+'px';void shell.offsetHeight;
 shell.style.transition='height '+duration+'ms '+(expanded?'cubic-bezier(.18,.81,.21,1)':'cubic-bezier(.28,.63,.29,1)');
 requestAnimationFrame(()=>{if(seq===drawerSeq)shell.style.height=target+'px'});
 if(!reduce()){
  const sorted=expanded?rows:rows.slice().reverse(),step=expanded?Math.min(73,rows.length>1?300/(rows.length-1):0):37;
  sorted.forEach((row,i)=>{
   if(!row.animate)return;
   drawerAnims.push(row.animate(expanded?[{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}]:[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{
    duration:expanded?290:190,delay:(expanded?80:0)+i*step,fill:'both',easing:'cubic-bezier(.18,.83,.22,1)'}));
  });
 }
 drawerTimer=setTimeout(()=>{if(seq!==drawerSeq)return;shell.style.transition='none';shell.style.height=expanded?target+'px':'0px';
 for(const a of drawerAnims){try{a.cancel()}catch{}}drawerAnims=[];done?.();},duration+25);
}
function newSearch(prefill=''){
 if(isOpen)return;clearTimeout(exitTimer);clearTimeout(enterTimer);stopMorph();
 isOpen=true;busy=false;expanded=false;querySeq++;const seq=++enterSeq;
 focusBefore=document.activeElement;input.value=prefill||'';error.textContent='';submit.disabled=false;drawHistory();
 sheet.classList.remove('is-exiting');sheet.classList.add('is-visible');
 scrim.classList.add('is-visible');sheet.setAttribute('aria-hidden','false');
 try{history.pushState({glassmatchLexiSearch:true},'',location.pathname+location.search+'#lexi-search');historyEntry=true}catch{historyEntry=false}
 if(terms.length)enterTimer=later(()=>{if(seq===enterSeq&&isOpen&&!busy)drawer(true)},265);
 later(()=>{if(isOpen&&!busy){input.focus({preventScroll:true});if(prefill)input.setSelectionRange(input.value.length,input.value.length)}},330);
}
function closeSheet(fromPop=false){
 if(!isOpen)return;isOpen=false;expanded=false;busy=false;querySeq++;enterSeq++;clearTimeout(enterTimer);stopDrawer();
 input.blur();sheet.classList.add('is-exiting');scrim.classList.remove('is-visible');sheet.setAttribute('aria-hidden','true');
 const seq=enterSeq;clearTimeout(exitTimer);exitTimer=later(()=>{if(seq!==enterSeq)return;sheet.classList.remove('is-visible','is-exiting');shell.style.height='0px'},340);
 if(!fromPop&&historyEntry){historyEntry=false;try{history.back()}catch{}}else historyEntry=false;
 if(focusBefore?.isConnected)later(()=>{if(!isOpen)focusBefore.focus?.({preventScroll:true})},380);
}
function dismiss(){if(!isOpen)return;if(expanded)drawer(false);else closeSheet()}
function hideDetail(){view.classList.remove('is-visible');activeWord='';stopMorph()}
function backDetail(){if(isOpen){dismiss();return}if(history.state?.glassmatchLexiDetail)history.back();else hideDetail()}
window.addEventListener('popstate',()=>{
 if(isOpen){
  if(expanded){drawer(false);try{history.pushState({glassmatchLexiSearch:true},'',location.pathname+location.search+'#lexi-search');historyEntry=true}catch{historyEntry=false}}
  else closeSheet(true);return;
 }
 if(view.classList.contains('is-visible'))hideDetail();
});
scrim.onclick=dismiss;toggle.onclick=()=>drawer(!expanded);
$('#lexi-word-back').onclick=backDetail;$('#lexi-word-search').onclick=()=>newSearch();
function displayData(word,items){
 activeWord=word;const obj=items[0]||{};title.textContent=obj.word||word;title.classList.add('lexi-hidden-word');
 ipa.textContent=(obj.phonetics||[]).find(p=>p.text)?.text||obj.phonetic||'暂无音标';
 soundUrl=(obj.phonetics||[]).find(p=>p.audio&&/^(https?:)?\/\//.test(p.audio))?.audio||'';
 if(soundUrl.startsWith('//'))soundUrl='https:'+soundUrl;play.hidden=!soundUrl;
 definitions.innerHTML=(obj.meanings||[]).slice(0,8).map(m=>'<h3 class="lexi-word-part">'+safe(m.partOfSpeech||'definition')+'</h3>'+
 (m.definitions||[]).slice(0,5).map((d,i)=>'<div class="lexi-def-item">'+(i+1)+'. '+safe(d.definition||'暂无释义')+(d.example?'<small>'+safe(d.example)+'</small>':'')+'</div>').join('')).join('')||'<div class="lexi-def-item">没有可显示的释义</div>';
 $('#lexi-word-credit').textContent='英英释义 · Free Dictionary API / Wiktionary · 查询结果保存在本机';
 view.classList.add('is-visible');view.scrollTop=0;
}
play.onclick=()=>{if(soundUrl)new Audio(soundUrl).play().catch(()=>{})};
function flyText(word,source){
 stopMorph();
 if(reduce()||!source||!source.getBoundingClientRect().width){title.classList.remove('lexi-hidden-word');return}
 const sr=source.getBoundingClientRect(),sf=parseFloat(getComputedStyle(source).fontSize)||15;
 const ox=sr.left+(source===input?2:0),oy=sr.top+Math.min(sr.height*.78,sf*1.03);
 const ghost=document.createElement('span');ghost.id='lexi-word-ghost';ghost.textContent=word;root.append(ghost);morphNode=ghost;
 morphSource={node:source,v:source.style.visibility,c:source.style.color};
 if(source===input)source.style.color='transparent';else source.style.visibility='hidden';
 title.classList.add('lexi-hidden-word');
 const seq=++morphSeq,start=performance.now();
 function frame(now){
  if(seq!==morphSeq||!morphNode)return;
  const t=Math.max(0,Math.min(1,(now-start)/850)),u=1-(1-t)**3;
  const rect=title.getBoundingClientRect(),font=parseFloat(getComputedStyle(title).fontSize)||31;
  const size=sf+(font-sf)*u,base=oy+(rect.top+font*1.01-oy)*u,x=ox+(rect.left-ox)*u;
  ghost.style.fontSize=size+'px';ghost.style.transform='translate3d('+x+'px,'+(base-size*.90)+'px,0)';
  if(t<1)requestAnimationFrame(frame);else {title.classList.remove('lexi-hidden-word');stopMorph()}
 }
 requestAnimationFrame(frame);
}
async function fetchWord(word){
 if(Array.isArray(cache[word])&&cache[word].length)return cache[word];
 const load=async url=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{return await fetch(url,{signal:controller.signal})}finally{clearTimeout(timer)}};
 let result;
 try{const r=await load('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word));
  if(!r.ok)throw Error('not found');result=await r.json();if(!Array.isArray(result)||!result.length)throw Error('empty');
 }catch{
  const r=await load('https://en.wiktionary.org/api/rest_v1/page/definition/'+encodeURIComponent(word));
  if(!r.ok)throw Error('免费词典未收录该单词或当前网络无法访问');
  const x=await r.json(),en=x.en||x.English||[];if(!en.length)throw Error('暂无可用词典释义');
  const strip=t=>String(t||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
  result=[{word,meanings:en.map(k=>({partOfSpeech:k.partOfSpeech,definitions:(k.definitions||[]).map(z=>({definition:strip(z.definition)}))}))}];
 }
 cache[word]=result;try{localStorage.setItem(C,JSON.stringify(cache))}catch{}return result;
}
async function lookup(raw,source){
 const word=String(raw||'').trim().toLowerCase();if(!/^[a-z][a-z'-]{1,39}$/.test(word)){error.textContent='请输入有效的英文单词';return}
 if(!isOpen)newSearch(word);
 const seq=++querySeq;submit.disabled=true;error.textContent='正在查询 '+word+' …';
 let entries;try{entries=await fetchWord(word)}catch(e){if(seq!==querySeq)return;submit.disabled=false;error.textContent=e.message||'查询失败，请检查网络';return}
 if(seq!==querySeq||!isOpen)return;
 submit.disabled=false;error.textContent='';input.blur();displayData(word,entries);
 terms=[word,...terms.filter(w=>w!==word)].slice(0,24);try{localStorage.setItem(H,JSON.stringify(terms))}catch{}
 flyText(word,source||input);busy=true;enterSeq++;clearTimeout(enterTimer);
 try{if(history.state?.glassmatchLexiSearch)history.replaceState({glassmatchLexiDetail:true},'',location.pathname+location.search+'#lexi-word')}catch{}historyEntry=false;
 const finish=()=>{if(!busy)return;isOpen=false;expanded=false;busy=false;sheet.classList.add('is-exiting');scrim.classList.remove('is-visible');sheet.setAttribute('aria-hidden','true');
  const t=++enterSeq;clearTimeout(exitTimer);exitTimer=later(()=>{if(t===enterSeq)sheet.classList.remove('is-visible','is-exiting')},340);};
 if(expanded)drawer(false,finish);else later(finish,70);
}
submit.onclick=()=>lookup(input.value,input);
input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookup(input.value,input)}else if(e.key==='Escape'){e.preventDefault();dismiss()}});
const nav=document.querySelector('#dock [data-tab="dictionary"]'),reader=document.querySelector('#readerSearchBtn');
if(nav)nav.onclick=e=>{e?.preventDefault?.();newSearch()};
if(reader)reader.onclick=e=>{e?.preventDefault?.();newSearch()};
document.querySelector('#dock')?.addEventListener('click',e=>{if(e.target.closest('[data-tab]:not([data-tab="dictionary"])'))hideDetail()},true);
document.querySelector('#paper')?.addEventListener('pointerup',e=>{
 const word=String(window.getSelection()?.toString()||'').trim();
 if(/^[a-zA-Z][a-zA-Z'-]{1,29}$/.test(word)){e.stopImmediatePropagation();if(confirm('查询单词 “'+word+'”？')){newSearch(word);later(()=>lookup(word,input),240)}}
},true);
window.GlassMatchLexiV4={openSearch:newSearch,lookupWord:word=>{newSearch(word);later(()=>lookup(word,input),240)},getState:()=>({open:isOpen,expanded,detail:view.classList.contains('is-visible'),word:activeWord,historyCount:terms.length})};
})();
