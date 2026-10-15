import { ICONS, getId, money, formatCents, periodKey, received, totalCents, weeklyCents, nextWindow, loadState, saveState, replaceState, validateState } from './store.js';
import { flyReward, rollAmount, animateNavigation, pageTransition } from './motion.js';

const $=s=>document.querySelector(s);
const screen=$('#screen'), sheetRoot=$('#sheet-root'), headerBalance=$('#header-balance');
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eDate=value=>new Date(value).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
const weekday=['周日','周一','周二','周三','周四','周五','周六'];
const dateTitle=()=>{const d=new Date();return `${d.getMonth()+1}月${d.getDate()}日 · ${weekday[d.getDay()]}`};
const shortCents=v=>money(v).replace('¥','');
let state,view='home',filter='all',busy=false,justClaimed=null,previousTotal=null;
const scrollMemory={home:0,wallet:0,settings:0};
let toastHandle=null;

function flash(message,kind='success'){
 const root=$('#toast-root');root.innerHTML=`<div class="toast ${kind}">${esc(message)}</div>`;
 clearTimeout(toastHandle);toastHandle=setTimeout(()=>root.replaceChildren(),2900);
}
function updateTop(){ $('#header-amount').textContent=money(totalCents(state.entries)); }
function homeHTML(){
 const earned=totalCents(state.entries),wEarned=weeklyCents(state.entries);
 const total=state.tasks.length,done=state.tasks.filter(t=>received(t,state.entries)).length;
 const chosen=state.tasks.filter(t=>filter==='all'||t.cadence===filter);
 const first=chosen.map((task,i)=>{
  const taken=received(task,state.entries);
  return `<article class="task-card" style="--n:${Math.min(i,9)}" data-task-id="${esc(task.id)}">
    <div class="task-icon" aria-hidden="true">${esc(task.icon)}</div>
    <div class="task-content"><div class="task-name">${esc(task.title)}</div>
       <div class="task-desc">${icon('clock')} <span>${task.cadence==='daily'?'每天一次':'每周一次'}${taken?' · 下次 '+nextWindow(task):' · 待完成'}</span></div></div>
    <div class="task-right"><span class="task-reward">+${money(task.amountCents)}</span>
      <button type="button" class="claim-btn ${taken?'claimed':''}" data-claim="${esc(task.id)}" ${taken||busy?'disabled':''} aria-label="${esc(task.title)}：${taken?'本周期已领取':'领取奖励 '+money(task.amountCents)}">${taken?icon('check'):icon('spark')}${taken?'已领取':'奖励我'}</button></div>
    <button type="button" class="task-more" data-edit="${esc(task.id)}" aria-label="编辑 ${esc(task.title)}">···</button>
  </article>`;
 }).join('');
 return `<div class="headline"><p class="page-hello">${dateTitle()}，给自己的小小肯定</p>
     <h1 class="page-title">认真生活，<span class="soft">值得被奖励。</span></h1>
     <p class="page-sub">不必等到终点，每次完成都是一次闪闪发光。</p></div>
   <section class="home-hero" aria-label="累计奖励总额"><div class="hero-overlay"></div><div class="hero-sparkle">✧</div>
     <div class="hero-content"><div class="hero-kicker">${icon('spark')} 我的闪光储蓄</div>
       <div class="hero-balance"><span>¥</span>${shortCents(earned)}</div>
       <div class="hero-foot">每一步努力，都有回响</div>
     </div><div class="hero-token" aria-hidden="true"></div></section>
   <section class="quick-stats" aria-label="奖励概览"><div class="stat-tile"><div class="stat-label">本周奖励</div><div class="stat-value">${money(wEarned)}<span class="stat-trend">↗</span></div></div>
    <div class="stat-tile"><div class="stat-label">本周期已完成</div><div class="stat-value">${done}<span class="stat-trend">/ ${total} 项</span></div></div></section>
   <section class="task-section" aria-label="目标任务列表"><div class="section-top"><div><h2 class="section-name">我的小目标 <span style="font-size:15px;color:#afa4c4">${total}</span></h2><p class="section-meta">完成一项，就给自己一点甜头</p></div>
      <button type="button" class="text-action" id="add-task">${icon('plus')} 新目标</button></div>
      <div class="filter-track" role="group" aria-label="按周期筛选任务"><span class="filter-thumb" style="--i:${['all','daily','weekly'].indexOf(filter)}"></span>
        <button class="filter-btn ${filter==='all'?'active':''}" data-filter="all" aria-pressed="${filter==='all'}">全部</button>
        <button class="filter-btn ${filter==='daily'?'active':''}" data-filter="daily" aria-pressed="${filter==='daily'}">每日目标</button>
        <button class="filter-btn ${filter==='weekly'?'active':''}" data-filter="weekly" aria-pressed="${filter==='weekly'}">每周目标</button></div>
      <div class="task-list">${first || `<div class="empty-card"><span class="empty-emoji">🪴</span><strong>${filter==='all'?'还没有小目标':'这里暂时没有目标'}</strong><p>从一件很小的事情开始，让坚持慢慢发芽。</p><button class="primary-btn" id="empty-add" type="button">${icon('plus')} 创建目标</button></div>`}</div>
      <p class="hint-footer">${icon('lock')} 数据只保存在你的设备上，可在设置里备份</p>
   </section>`;
}
function walletHTML(){
 const total=totalCents(state.entries),week=weeklyCents(state.entries);
 const items=[...state.entries].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 return `<div class="wallet-top"><p class="eyebrow">THE LITTLE TREASURY</p><h1 class="page-title" style="margin-top:9px">每一份坚持，<span class="soft">都有回响。</span></h1><p class="page-sub">属于你的努力，正在一点一点闪光。</p></div>
   <section class="wallet-hero" aria-label="累计奖励"><div class="wallet-top-label">${icon('spark')} 累计奖励金库</div>
    <div class="wallet-amount"><span class="currency">¥</span><span class="odometer" id="wallet-odometer" aria-live="polite"></span></div>
    <div class="wallet-note">不是别人给的奖赏，是对自己的兑现。</div>
    <span class="wallet-token" aria-hidden="true">✳</span>
    <div class="wallet-foot"><div><small>本周入账</small><b>+ ${money(week)}</b></div><div><small>累计领取</small><b>${state.entries.length} 次</b></div></div>
   </section>
   <section class="wallet-section"><div class="wallet-section-head"><h2>闪光记录</h2><span>${items.length} 笔奖励</span></div>
    <div class="ledger-list">${items.length?items.map(entry=>`<article class="ledger-row ${entry.id===justClaimed?'fresh':''}">
      <span class="ledger-icon" aria-hidden="true">${esc(entry.icon)}</span><div class="ledger-details"><b>${esc(entry.title)}</b><small>${eDate(entry.createdAt)} · ${entry.cadence==='daily'?'每日':'每周'}奖励</small></div>
      <div class="ledger-right"><span class="ledger-amount">+${money(entry.amountCents)}</span><button class="ledger-undo" type="button" data-undo="${esc(entry.id)}" aria-label="撤销奖励 ${esc(entry.title)}">撤销</button></div>
     </article>`).join(''):`<div class="wallet-empty"><span class="empty-emoji">🪙</span><strong>第一枚金币，还在等你</strong><p>回到目标页，完成一项任务领取奖励吧。</p><button class="primary-btn" type="button" data-jump="home" style="margin-top:11px">去奖励自己 ${icon('arrow')}</button></div>`}</div>
   </section>`;
}
function settingsHTML(){
 return `<div class="settings-top"><p class="eyebrow">PERSONAL SPACE</p><h1 class="page-title" style="margin-top:9px">让奖励，<span class="soft">一直陪着你。</span></h1><p class="page-sub">设置好自己的节奏，也照顾好每一份记录。</p></div>
  <div class="settings-group"><h2>我的数据</h2><div class="setting-panel">
   <button class="setting-item" type="button" id="export-btn"><span class="setting-icon">${icon('download')}</span><span class="setting-text"><b>备份我的数据</b><small>导出所有目标和奖励记录为 JSON 文件</small></span>${icon('down')}</button>
   <button class="setting-item" type="button" id="import-btn"><span class="setting-icon peach">${icon('upload')}</span><span class="setting-text"><b>从备份恢复</b><small>从网页版迁移到未来 APK 时也能使用</small></span>${icon('down')}</button>
   <button class="setting-item" type="button" id="reset-btn"><span class="setting-icon danger">${icon('trash')}</span><span class="setting-text"><b>清空全部数据</b><small>移除任务和奖励记录，不可撤销</small></span>${icon('down')}</button>
  </div><p class="setting-note">${icon('info')} 目前使用浏览器本地存储，不需要注册账号，也不会把奖励信息上传到服务器。清理浏览器数据或换设备可能造成丢失，请定期备份。</p></div>
  <div class="settings-group"><h2>关于拾光</h2><div class="setting-panel"><div class="setting-item"><span class="setting-icon">${icon('lock')}</span><span class="setting-text"><b>离线优先 · 独立保存</b><small>无后端、无订阅、无广告。未来可封装 Android 应用。</small></span></div></div></div>
  <p class="settings-version">拾光奖励 · V1.0 Web Preview<br>Made for all your little wins ✳</p>`;
}
function render({rewardFrom=null}={}){
 const html=view==='home'?homeHTML():view==='wallet'?walletHTML():settingsHTML();
 screen.innerHTML=html;
 updateTop();
 const idx=['home','wallet','settings'].indexOf(view);
 document.querySelectorAll('.nav-btn').forEach((btn,i)=>{
  const selected=i===idx;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
 });
 animateNavigation(idx);
 if(view==='wallet'){
  const od=$('#wallet-odometer');
  if(rewardFrom!==null)od.dataset.amount=(rewardFrom/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  rollAmount(od,totalCents(state.entries),{animated:rewardFrom!==null});
 }
}
function navigate(to,{fromClaim=false,fromTotal=null,history=true}={}){
 if(!['home','wallet','settings'].includes(to))to='home';
 if(to===view&&!fromClaim)return;
 scrollMemory[view]=window.scrollY;
 view=to;
 if(history&&location.hash!==`#${to}`)window.history.pushState(null,'',`#${to}`);
 pageTransition(()=>{render({rewardFrom:fromTotal});window.scrollTo({top:fromClaim?0:(scrollMemory[to]??0),behavior:'instant'})});
 if(fromClaim)setTimeout(()=>{justClaimed=null},1300);
}
function closeSheet(){
 const root=sheetRoot;if(!root.hasChildNodes())return;
 root.replaceChildren();document.body.style.overflow='';
 const prev=document.querySelector('[data-sheet-return]');if(prev){prev.focus();prev.removeAttribute('data-sheet-return')}
}
function openSheet(body){
 const previous=document.activeElement;if(previous?.setAttribute)previous.setAttribute('data-sheet-return','true');
 sheetRoot.innerHTML=`<div class="sheet-backdrop" data-close-sheet></div><div class="sheet" role="dialog" aria-modal="true" aria-label="编辑目标"><div class="sheet-grabber" aria-hidden="true"></div>${body}</div>`;
 document.body.style.overflow='hidden';
 sheetRoot.querySelector('[autofocus],.sheet-close,.primary-btn')?.focus({preventScroll:true});
}
function taskSheet(id=null){
 const task=id?state.tasks.find(t=>t.id===id):null;if(id&&!task)return;
 openSheet(`<div class="sheet-heading"><div><h2>${task?'编辑小目标':'创建新的小目标'}</h2><p>每一点进步，都值得认真对待。</p></div><button class="sheet-close" type="button" data-close-sheet aria-label="关闭">${icon('close')}</button></div>
 <form id="task-form" novalidate><input type="hidden" name="id" value="${esc(task?.id||'')}" />
  <label class="form-label" for="task-title">给目标起个名字</label><input class="text-field" id="task-title" name="title" maxlength="50" placeholder="比如：专注学习 45 分钟" required value="${esc(task?.title||'')}" />
  <label class="form-label" for="task-amount">每次完成，奖励多少钱？</label><div class="amount-wrap"><span>¥</span><input class="text-field" id="task-amount" name="amount" type="text" inputmode="decimal" autocomplete="off" placeholder="5.00" required value="${task?(task.amountCents/100).toFixed(2):'5.00'}" /></div>
  <span class="form-label">希望多久完成一次？</span><div class="cadence-select" role="group" aria-label="完成周期">
   <label class="cadence-option"><input type="radio" name="cadence" value="daily" ${!task||task.cadence==='daily'?'checked':''}/><span>每天一次</span></label>
   <label class="cadence-option"><input type="radio" name="cadence" value="weekly" ${task?.cadence==='weekly'?'checked':''}/><span>每周一次</span></label></div>
  <span class="form-label">选个专属标记</span><div class="emoji-row" role="group" aria-label="目标标记">${ICONS.map(emoji=>`<label class="emoji-option"><input type="radio" name="icon" value="${emoji}" ${emoji===(task?.icon||'🌱')?'checked':''}/><span>${emoji}</span></label>`).join('')}</div>
  <div class="form-error" id="form-error" role="alert"></div>
  <div class="sheet-actions">${task?'<button type="button" class="secondary-btn" data-delete-task="'+esc(task.id)+'">删除</button>':''}<button class="primary-btn" type="submit">${icon('check')} ${task?'保存修改':'创建目标'}</button></div>
  <p class="sheet-help">同一任务每个自然日 / 自然周可领取一次。修改金额不会追溯已领取的奖励。</p>
 </form>`);
 $('#task-form').addEventListener('submit',submitTask);
}
function confirmSheet({title,description,label='确认',danger=false,onAccept}){
 openSheet(`<div class="sheet-heading"><div><h2>${esc(title)}</h2><p>请确认这一步操作</p></div><button class="sheet-close" type="button" data-close-sheet aria-label="关闭">${icon('close')}</button></div>
  <p class="confirm-copy">${esc(description)}</p><div class="sheet-actions"><button type="button" class="secondary-btn" data-close-sheet>取消</button>
  <button type="button" class="primary-btn ${danger?'danger-btn':''}" id="confirm-accept">${esc(label)}</button></div>`);
 $('#confirm-accept').addEventListener('click',async()=>{const btn=$('#confirm-accept');btn.disabled=true;try{await onAccept();closeSheet()}catch(error){btn.disabled=false;flash('操作失败：'+error.message,'error')}},{once:true});
}
async function submitTask(event){
 event.preventDefault();if(busy)return;
 const form=event.currentTarget,fd=new FormData(form);
 const title=String(fd.get('title')??'').trim(),amountCents=formatCents(fd.get('amount'));
 const error=$('#form-error');
 if(!title){error.textContent='请输入目标名称';$('#task-title').focus();return}
 if(!amountCents){error.textContent='请输入大于 0 且最多两位小数的金额（最高 100 万元）';$('#task-amount').focus();return}
 const id=String(fd.get('id')||''),cadence=String(fd.get('cadence'));
 const chosen=String(fd.get('icon')||'🌱');
 const old=state.tasks.find(t=>t.id===id);
 const task={id:old?.id||getId(),title,amountCents,cadence:cadence==='weekly'?'weekly':'daily',icon:ICONS.includes(chosen)?chosen:'🌱',createdAt:old?.createdAt||new Date().toISOString()};
 const next={...state,tasks:old?state.tasks.map(t=>t.id===id?task:t):[...state.tasks,task]};
 try{await saveState(next);state=next;closeSheet();render();flash(old?'目标已更新':'新目标已经种下 🌱')}catch(err){$('#form-error').textContent=err.message;flash('保存失败：'+err.message,'error')}
}
async function claim(taskId,button){
 if(busy)return;const task=state.tasks.find(t=>t.id===taskId);if(!task||received(task,state.entries))return;
 busy=true;button.disabled=true;button.style.transform='scale(.87)';
 const start=totalCents(state.entries);
 const entry={id:getId(),taskId:task.id,title:task.title,amountCents:task.amountCents,icon:task.icon,cadence:task.cadence,periodKey:periodKey(task),createdAt:new Date().toISOString()};
 const next={...state,entries:[...state.entries,entry]};
 try{
  await saveState(next);state=next;
  await flyReward(button,headerBalance,entry.amountCents);
  updateTop();headerBalance.animate?.([{transform:'scale(1)'},{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});
  justClaimed=entry.id;
  navigate('wallet',{fromClaim:true,fromTotal:start});
  flash(`已存入 ${money(entry.amountCents)}，继续闪闪发光 ✨`);
 } catch(error){flash('奖励保存失败，请重试：'+error.message,'error');render()}
 finally{busy=false;button.style.transform=''}
}
function undo(entryId){
 const ent=state.entries.find(e=>e.id===entryId);if(!ent)return;
 confirmSheet({title:'撤销这笔奖励？',description:`将从累计奖励中扣除 ${money(ent.amountCents)}。对应任务如果仍在当前周期内，可以重新领取。`,label:'撤销奖励',onAccept:async()=>{
  const next={...state,entries:state.entries.filter(e=>e.id!==entryId)};
  await saveState(next);state=next;justClaimed=null;render();flash('这笔奖励已经撤销');
 }});
}
function deleteTask(id){
 const task=state.tasks.find(t=>t.id===id);if(!task)return;
 confirmSheet({title:'删除这个目标？',description:`“${task.title}”将从目标列表移除，过往已经领取的奖励仍会保留在金库里。`,label:'删除目标',danger:true,onAccept:async()=>{
  const next={...state,tasks:state.tasks.filter(t=>t.id!==id)};await saveState(next);state=next;render();flash('目标已删除，历史奖励已保留');
 }});
}
function exportData(){
 const json=JSON.stringify({...state,exportedAt:new Date().toISOString(),app:'shiguang-rewarder'},null,2);
 const blob=new Blob([json],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=`拾光奖励-备份-${new Date().toLocaleDateString('sv-SE')}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),6000);flash('备份已生成，请妥善保存');
}
async function importFile(file){
 if(!file)return;
 try{
  if(file.size>12*1024*1024)throw Error('文件太大');
  const parsed=JSON.parse(await file.text());const imported=validateState(parsed);
  confirmSheet({title:'用备份替换本机数据？',description:`即将导入 ${imported.tasks.length} 项目标、${imported.entries.length} 笔奖励。当前本机数据会被覆盖，建议先导出备份。`,label:'确认恢复',onAccept:async()=>{
   await replaceState(imported);state=imported;filter='all';scrollMemory.home=0;scrollMemory.wallet=0;render();flash('备份恢复成功');
  }});
 }catch(error){flash('导入失败：'+error.message,'error')}
 finally{$('#import-file').value=''}
}
function resetAll(){
 confirmSheet({title:'清空所有数据？',description:'所有目标和累计奖励记录都将被永久清空，此操作无法撤销。建议先导出备份。',label:'确认清空',danger:true,onAccept:async()=>{
  const next={version:1,createdAt:new Date().toISOString(),tasks:[],entries:[]};await replaceState(next);state=next;filter='all';render();flash('数据已清空');
 }});
}
function handleClick(event){
 const btn=event.target.closest('button');if(!btn)return;
 if(btn.matches('[data-close-sheet]')){closeSheet();return}
 if(btn.closest('.sheet')){const id=btn.dataset.deleteTask;if(id)deleteTask(id);return}
 if(btn.dataset.view){navigate(btn.dataset.view);return}
 if(btn.id==='header-balance'){navigate('wallet');return}
 if(btn.dataset.filter){filter=btn.dataset.filter;render();return}
 if(btn.dataset.claim){void claim(btn.dataset.claim,btn);return}
 if(btn.dataset.edit){taskSheet(btn.dataset.edit);return}
 if(btn.id==='add-task'||btn.id==='empty-add'){taskSheet();return}
 if(btn.dataset.jump){navigate(btn.dataset.jump);return}
 if(btn.dataset.undo){undo(btn.dataset.undo);return}
 if(btn.id==='export-btn'){exportData();return}
 if(btn.id==='import-btn'){$('#import-file').click();return}
 if(btn.id==='reset-btn'){resetAll();return}
}
function handleKeyboard(event){
 if(event.key==='Escape'&&sheetRoot.hasChildNodes())closeSheet();
 if(event.key==='Tab'&&sheetRoot.hasChildNodes()){
  const candidates=[...sheetRoot.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(el=>el.getClientRects().length);
  if(!candidates.length)return;const first=candidates[0],last=candidates[candidates.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
}
async function init(){
 try{
  state=await loadState();view=['home','wallet','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
  render();document.body.addEventListener('click',handleClick);

  document.addEventListener('keydown',handleKeyboard);
  $('#import-file').addEventListener('change',event=>void importFile(event.target.files?.[0]));
  window.addEventListener('hashchange',()=>{const selected=location.hash.slice(1);if(['home','wallet','settings'].includes(selected)&&selected!==view)navigate(selected,{history:false})});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy&&!sheetRoot.hasChildNodes())render()});
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 }catch(error){screen.innerHTML=`<div class="empty-card"><span class="empty-emoji">⚠️</span><strong>无法打开本地奖励数据</strong><p>${esc(error.message)}。请尝试重新打开页面，原数据不会被自动清空。</p></div>`}
}
init();
