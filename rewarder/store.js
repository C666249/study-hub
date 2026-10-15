/** Rewarder domain data. Independent of browser DOM; suitable for later Capacitor APK. */
const DB_NAME = 'shiguang-rewarder';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const KEY = 'state';
const FALLBACK_KEY = 'shiguang-rewarder-fallback-v1';

export const ICONS = ['🌱','📖','🏃','✨','🎨','💻','🎧','🧘','💧','☀️','📝','💪'];
export const getId = () => globalThis.crypto?.randomUUID?.() ?? `r_${Date.now()}_${Math.random().toString(36).slice(2)}`;
export const money = cents => `¥${(cents / 100).toLocaleString('zh-CN', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const formatCents = raw => {
  const input = String(raw).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(input)) return null;
  const [y, dec=''] = input.split('.');
  const value = Number(y) * 100 + Number(dec.padEnd(2,'0'));
  return Number.isSafeInteger(value) && value > 0 && value <= 100000000 ? value : null;
};
export const dayString = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function mondayFor(date) {
  const d = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  d.setDate(d.getDate()-((d.getDay()+6)%7));
  return d;
}
export const periodKey = (task, date=new Date()) => task.cadence === 'weekly' ? dayString(mondayFor(date)) : dayString(date);
export const received = (task, entries, date=new Date()) => entries.some(e=>e.taskId===task.id && e.periodKey===periodKey(task,date) && e.cadence===task.cadence);
export const totalCents = entries => entries.reduce((sum,e)=>sum+e.amountCents,0);
export const weeklyCents = (entries, date=new Date()) => {
 const start=mondayFor(date).getTime();
 return entries.filter(e=>new Date(e.createdAt).getTime()>=start).reduce((sum,e)=>sum+e.amountCents,0);
};
export function nextWindow(task,date=new Date()) {
 const next=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 next.setDate(next.getDate()+(task.cadence==='weekly'?7-((next.getDay()+6)%7):1));
 return `${next.getMonth()+1}月${next.getDate()}日`;
}
export function initialState() {
 const now=new Date().toISOString();
 return {version:1,tasks:[
  {id:getId(),title:'阅读 30 分钟',icon:'📖',cadence:'daily',amountCents:500,createdAt:now},
  {id:getId(),title:'运动打卡',icon:'🏃',cadence:'daily',amountCents:800,createdAt:now},
  {id:getId(),title:'完成本周学习计划',icon:'✨',cadence:'weekly',amountCents:3000,createdAt:now}
 ],entries:[],createdAt:now};
}
function openDB() {
 return new Promise((resolve,reject)=>{
  if (typeof indexedDB==='undefined') return reject(Error('IndexedDB 不可用'));
  const request=indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error ?? Error('无法打开本地数据库'));
 });
}
async function fromDB() {
 const db=await openDB();
 try {return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE_NAME,'readonly'); const req=tx.objectStore(STORE_NAME).get(KEY);
  req.onsuccess=()=>resolve(req.result ?? null);req.onerror=()=>reject(req.error);
 });} finally{db.close()}
}
async function toDB(state) {
 const db=await openDB();
 try {await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put(state,KEY);
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error ?? Error('写入失败'));tx.onabort=()=>reject(tx.error ?? Error('写入已取消'));
 });} finally{db.close()}
}
export function validateState(input) {
 if(!input||typeof input!=='object'||!Array.isArray(input.tasks)||!Array.isArray(input.entries))throw Error('文件不是有效的奖励器备份');
 if(input.tasks.length>2000||input.entries.length>100000)throw Error('备份数据超出容量限制');
 const ids=new Set();
 const tasks=input.tasks.map(t=>{
  if(!t||typeof t.id!=='string'||!t.id||typeof t.title!=='string'||!t.title.trim()||t.title.length>100||!['daily','weekly'].includes(t.cadence)||!Number.isSafeInteger(t.amountCents)||t.amountCents<=0||t.amountCents>100000000||ids.has(t.id))throw Error('任务数据无效');
  ids.add(t.id);
  return {id:t.id,title:t.title.trim(),icon:ICONS.includes(t.icon)?t.icon:'✨',cadence:t.cadence,amountCents:t.amountCents,createdAt:typeof t.createdAt==='string'?t.createdAt:new Date().toISOString()};
 });
 const entryIds=new Set();
 const entries=input.entries.map(e=>{
  if(!e||typeof e.id!=='string'||!e.id||entryIds.has(e.id)||typeof e.taskId!=='string'||typeof e.title!=='string'||e.title.length>100||!['daily','weekly'].includes(e.cadence)||!/^\d{4}-\d{2}-\d{2}$/.test(e.periodKey)||!Number.isSafeInteger(e.amountCents)||e.amountCents<=0||e.amountCents>100000000||typeof e.createdAt!=='string'||!Number.isFinite(Date.parse(e.createdAt)))throw Error('奖励记录数据无效');
  entryIds.add(e.id);
  return {id:e.id,taskId:e.taskId,title:e.title,icon:ICONS.includes(e.icon)?e.icon:'✨',cadence:e.cadence,periodKey:e.periodKey,amountCents:e.amountCents,createdAt:e.createdAt};
 });
 return {version:1,tasks,entries,createdAt:input.createdAt||new Date().toISOString()};
}
export async function loadState(){
 let snapshot=null;
 try {snapshot=await fromDB()} catch {}
 if(!snapshot)try{snapshot=JSON.parse(localStorage.getItem(FALLBACK_KEY)||'null')}catch{}
 if(!snapshot){const fresh=initialState();await saveState(fresh);return fresh}
 return validateState(snapshot);
}
export async function saveState(state){
 const clean=validateState(state);
 try {await toDB(clean)} catch(error) {
  try {localStorage.setItem(FALLBACK_KEY,JSON.stringify(clean))} catch {throw error}
 }
 return clean;
}
export async function replaceState(state){return saveState(state)}
