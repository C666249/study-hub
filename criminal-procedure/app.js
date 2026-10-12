(function(L){
"use strict";
L.render=function(){
 const p=L.UI.page;
 const view=L.views[p]||L.views.home;
 document.getElementById("app").innerHTML='<div class="site'+(p==="quiz"?' quiz-mode':'')+'">'+(p==="quiz"?'':L.header())+'<main class="layout">'+view()+(p==="quiz"?'':L.footer())+'</main>'+(p==="quiz"?'':L.bottom())+(L.modalHTML?.()||"")+'</div>';
 document.title=({home:"首页",study:"章节学习",map:"思维导图",quiz:"专项刷题",review:"错题复习"}[p]||"诉研")+" · 诉研";
 if(L.UI.unitToOpen&&p==="study"){
  let id=L.UI.unitToOpen;L.UI.unitToOpen="";
  requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}));
 }
};
function redraw(){let y=window.scrollY;L.render();window.scrollTo(0,y)}
function doSubmit(){
 let q=L.current();if(!q||L.P.answers[q.id])return;
 let choices=L.UI.choices[q.id]||[];if(!choices.length)return;
 let correct=choices.slice().sort().join("")===q.answer.slice().sort().join("");
 L.P.answers[q.id]={choices:choices.slice(),correct,date:L.day(),at:Date.now()};
 if(!correct)L.P.mistakes[q.id]=true;
 L.save();redraw();
}
function exportProgress(){
 let file=new Blob([JSON.stringify({kind:"lexflow-progress",version:1,created:new Date().toISOString(),progress:L.P},null,2)],{type:"application/json"});
 let a=document.createElement("a"),link=URL.createObjectURL(file);a.href=link;a.download="诉研-学习进度-"+L.day()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(link),2000);L.toast("学习进度已导出");
}
function restoreProgress(file){
 if(!file)return;let reader=new FileReader();
 reader.onload=()=>{try{
  let x=JSON.parse(String(reader.result));
  if(x.kind!=="lexflow-progress"||!x.progress?.sessions||!x.progress?.answers)throw Error("invalid progress file");
  if(!confirm("导入会覆盖当前设备的学习记录。确定继续吗？"))return;
  L.P=Object.assign(L.fresh(),x.progress);L.save();L.UI.modal="";L.render();L.toast("学习进度导入成功");
 }catch(e){L.toast("导入失败，请选择诉研导出的JSON备份文件")}};
 reader.readAsText(file);
}
document.addEventListener("click",function(e){
 let b=e.target.closest("[data-action]");if(!b)return;
 let a=b.dataset.action,id=b.dataset.id;
 if(a==="close"&&b.classList.contains("modal-screen")&&e.target!==b)return;
 if(a==="page"){L.go(b.dataset.page);return}
 if(a==="settings"||a==="grid"||a==="quizfilters"){L.UI.modal=a;L.render();return}
 if(a==="close"){L.UI.modal="";L.render();return}
 if(a==="section"){L.UI.section=id;L.render();return}
 if(a==="openunit"){L.openUnit(b.dataset.unit);return}
 if(a==="learn"){L.P.views[b.dataset.unit]=!L.P.views[b.dataset.unit];L.UI.unitToOpen=b.dataset.unit;L.save();redraw();return}
 if(a==="start"){L.start(b.dataset.mode||"all",b.dataset.unit||"all");return}
 if(a==="resume"){L.go("quiz");return}
 if(a==="move"){let s=L.session();s.index=Math.max(0,Math.min(s.ids.length-1,s.index+Number(b.dataset.offset)));L.save();L.render();window.scrollTo(0,0);return}
 if(a==="jump"){L.session().index=Number(b.dataset.index);L.UI.modal="";L.save();L.render();window.scrollTo(0,0);return}
 if(a==="reviewtab"){L.UI.reviewTab=id;L.render();return}
 if(a==="goquestion"){let key="all:all";if(!L.P.sessions[key])L.P.sessions[key]={ids:L.pool("all","all"),index:0};L.P.lastSession=key;L.P.sessions[key].index=Math.max(0,L.P.sessions[key].ids.indexOf(id));L.save();L.go("quiz");return}
 if(a==="pick"){let q=L.D.questions.find(x=>x.id===id);if(!q||L.P.answers[id])return;
 let v=L.UI.choices[id]||[],letter=b.dataset.letter;
 L.UI.choices[id]=q.type==="multi"?(v.includes(letter)?v.filter(x=>x!==letter):[...v,letter]):[letter];
 if(q.type==="single"){doSubmit();return}
 redraw();return}
 if(a==="submit"){doSubmit();return}
 if(a==="bookmark"){L.P.bookmarks[id]=!L.P.bookmarks[id];if(!L.P.bookmarks[id])delete L.P.bookmarks[id];L.save();redraw();L.toast(L.P.bookmarks[id]?"已加入收藏":"已取消收藏");return}
 if(a==="redo"){delete L.P.answers[id];L.UI.choices[id]=[];L.save();redraw();return}
 if(a==="mastered"){delete L.P.mistakes[id];L.save();redraw();L.toast("已从错题本标记为掌握");return}
 if(a==="export"){exportProgress();return}
 if(a==="import"){document.getElementById("importFile").click();return}
 if(a==="reset"){if(confirm("确定清空所有题目答案、学习进度与收藏吗？此操作不可恢复。")){L.P=L.fresh();L.save();L.UI.modal="";L.render();L.toast("本机进度已清空")}return}
});
document.addEventListener("input",e=>{
 if(e.target.id==="unitSearch"){L.UI.search=e.target.value;let box=document.getElementById("unitContainer");if(box)box.innerHTML=L.filtered().map(L.studyUnit).join("")||'<div class="card empty">没有匹配的知识点</div>'}
});
document.addEventListener("change",e=>{
 if(e.target.id==="importFile"){restoreProgress(e.target.files?.[0]);e.target.value=""}
});
window.addEventListener("hashchange",()=>{
 const p=(location.hash||"#home").slice(1);
 if(["home","study","map","quiz","review"].includes(p)&&L.UI.page!==p){L.UI.page=p;L.UI.modal="";L.render()}
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&L.UI.modal){L.UI.modal="";L.render()}
});
document.addEventListener("DOMContentLoaded",()=>{
 document.body.insertAdjacentHTML("beforeend",'<input type="file" id="importFile" accept=".json,application/json" hidden>');
 if(!L.P.sessions["all:all"])L.P.sessions["all:all"]={ids:L.pool("all","all"),index:0};
 if(!["home","study","map","quiz","review"].includes(L.UI.page))L.UI.page="home";
 L.render();
});
})(window.L);