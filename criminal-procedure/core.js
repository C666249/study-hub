window.L=(function(){
"use strict";
const D=window.LEXFLOW_DATA,KEY="lexflow-criminal-procedure-v1";
const fresh=()=>({views:{},answers:{},mistakes:{},bookmarks:{},sessions:{},lastSession:"all:all"});
let saved;
try{saved=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||"{}"));if(!saved.sessions||!saved.answers)saved=fresh()}catch(e){saved=fresh()}
const L={D,P:saved,UI:{page:(location.hash||"#home").slice(1),section:"all",search:"",modal:"",unitToOpen:"",reviewTab:"wrong",choices:{}},fresh};
const paths={
home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 21v-8h6v8"/>',
book:'<path d="M4 19V5a2 2 0 0 1 2-2h16v17H6a2 2 0 0 0 0 4h16"/><path d="M4 19a2 2 0 0 1 2-2h16"/>',
quiz:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
map:'<circle cx="12" cy="12" r="3"/><path d="m4 3 5 6m11-6-5 6M4 21l5-6m11 6-5-6"/>',
star:'<path d="m12 2 3.2 6.5 7.2 1-5.2 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.2-5.1 7.2-1z"/>',
arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
back:'<path d="M20 12H4m7 7-7-7 7-7"/>',
down:'<path d="m5 9 7 7 7-7"/>',
check:'<path d="m5 12 4 4L19 6"/>',
close:'<path d="M5 5 19 19M19 5 5 19"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
refresh:'<path d="M20 7V3h-4M4 17v4h4M20 7A9 9 0 0 0 5 6M4 17a9 9 0 0 0 15 1"/>',
download:'<path d="M12 3v12m-5-5 5 5 5-5M3 17v4h18v-4"/>',
upload:'<path d="M12 21V9m-5 5 5-5 5 5M3 7V3h18v4"/>'
};
L.icon=n=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[n]||paths.arrow)+'</svg>';
L.h=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
L.pct=(x,y)=>y?Math.round(x/y*100):0;
L.day=()=>new Date().toLocaleDateString("sv-SE");
L.attempted=()=>D.questions.filter(q=>L.P.answers[q.id]).length;
L.correct=()=>D.questions.filter(q=>L.P.answers[q.id]?.correct).length;
L.learned=()=>D.units.filter(u=>L.P.views[u.id]).length;
L.today=()=>D.questions.filter(q=>L.P.answers[q.id]?.date===L.day()).length;
L.wrongs=()=>D.questions.filter(q=>L.P.mistakes[q.id]);
L.saved=()=>D.questions.filter(q=>L.P.bookmarks[q.id]);
L.unit=id=>D.units.find(u=>u.id===id);
L.forUnit=id=>D.questions.filter(q=>q.unit===id);
L.save=()=>{try{localStorage.setItem(KEY,JSON.stringify(L.P))}catch(e){L.toast("本机存储不可用，建议允许浏览器保存站点数据")}};
L.toast=msg=>{document.querySelector(".toast")?.remove();let t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)};
L.pool=(mode,unit)=>D.questions.filter(q=>(unit==="all"||q.unit===unit)&&(mode!=="new"||!L.P.answers[q.id])&&(mode!=="wrong"||L.P.mistakes[q.id])&&(mode!=="saved"||L.P.bookmarks[q.id])).map(q=>q.id);
L.session=()=>{const p=L.P;if(!p.sessions[p.lastSession])p.sessions[p.lastSession]={ids:L.pool("all","all"),index:0};let s=p.sessions[p.lastSession];s.ids=s.ids.filter(id=>D.questions.some(q=>q.id===id));s.index=Math.max(0,Math.min(s.index||0,Math.max(0,s.ids.length-1)));return s};
L.current=()=>{let s=L.session();return D.questions.find(q=>q.id===s.ids[s.index])};
L.start=(mode="all",unit="all",restart=false)=>{let key=mode+":"+unit,ids=L.pool(mode,unit),old=L.P.sessions[key];if(!old||restart||!old.ids?.length){L.P.sessions[key]={ids,index:0}}else if(mode==="all"&&old.ids.length!==ids.length){L.P.sessions[key]={ids,index:Math.min(old.index,Math.max(0,ids.length-1))}}if(L.UI.page!=="quiz")L.UI.quizReturn=L.UI.page;L.P.lastSession=key;L.save();L.go("quiz")};
L.go=page=>{L.UI.page=page;L.UI.modal="";location.hash=page;L.render();window.scrollTo(0,0)};
L.openUnit=id=>{L.UI.search="";L.UI.section="all";L.UI.unitToOpen=id;L.go("study")};
return L;
})();