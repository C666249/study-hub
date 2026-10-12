(function(L){
L.views.review=function(){
const wrong=L.wrongs(),saved=L.saved(),mode=L.UI.reviewTab,arr=mode==="wrong"?wrong:saved;
return `<div class="view"><div class="guide-header"><span class="eyebrow">REVIEW & RETENTION</span><h1>复习中心 · 攻克薄弱知识点</h1><p>错题和收藏会保留在当前浏览器。可选择专项练习，也可点开具体题目查看逐项解析。</p></div>
<div class="stat-row" style="margin-bottom:23px">
<div class="card stat"><span class="tag red">错题本</span><div class="num" style="margin-top:10px">${wrong.length}</div><p>待攻克</p></div>
<div class="card stat"><span class="tag blue">收藏题</span><div class="num" style="margin-top:10px">${saved.length}</div><p>重点题</p></div>
<div class="card stat"><span class="tag green">正确题</span><div class="num" style="margin-top:10px">${L.correct()}</div><p>当前记录</p></div>
<div class="card stat"><span class="tag amber">今日刷题</span><div class="num" style="margin-top:10px">${L.today()}</div><p>今天完成</p></div></div>
<div class="chiprow" style="margin-bottom:17px"><button class="chip ${mode==="wrong"?"active":""}" data-action="reviewtab" data-id="wrong">错题本 · ${wrong.length}</button><button class="chip ${mode==="saved"?"active":""}" data-action="reviewtab" data-id="saved">收藏夹 · ${saved.length}</button></div>
${arr.length?`<div class="unit-list">${arr.map((q,i)=>`<button class="card click" data-action="goquestion" data-id="${q.id}" style="text-align:left"><div class="welcome-inline"><div style="flex:1">
<div class="wrap"><span class="tag ${mode==="wrong"?"red":"blue"}">${mode==="wrong"?"错题":"收藏"} ${i+1}</span><span class="tag">${L.h(L.unit(q.unit).title)}</span></div>
<h3 style="font-size:14px;line-height:1.75">${L.h(q.stem)}</h3></div><span class="card-arrow">${L.icon("arrow")}</span></div></button>`).join("")}</div>
<div class="card-foot"><span class="small muted">共 ${arr.length} 道</span><button class="btn primary" data-action="start" data-mode="${mode}" data-unit="all">复习这一组</button></div>`:
`<div class="card empty"><div class="glyph">☆</div><h3>这里暂时没有题目</h3><p>做错的题会加入错题本；刷题时点击星形按钮可收藏。</p><button class="btn primary" data-action="start" data-mode="all" data-unit="all">开始刷题</button></div>`}
</div>`;
};
L.modalHTML=function(){
if(!L.UI.modal)return "";
let body="";
if(L.UI.modal==="grid"){let s=L.session();body=`<h2>题号速览</h2><p>蓝色表示当前题，绿色代表答对，红色代表答错。点击对应题号即可跳转。</p><div class="answer-grid">${s.ids.map((id,i)=>{let a=L.P.answers[id];return `<button data-action="jump" data-index="${i}" class="${i===s.index?"current":a?(a.correct?"answered":"incorrect"):""}">${i+1}</button>`}).join("")}</div>`;}
else{body=`<h2>学习进度与设置</h2><p>学习记录默认保存在浏览器本地，不会自动跨设备同步。清理站点数据可能导致丢失，请定期导出备份。</p>
<div class="setting-row"><div><b>自动保存</b><br><small>${L.attempted()} 道已答 · ${L.learned()} 个模块已学</small></div><span class="tag green">运行中</span></div>
<div class="setting-row"><div><b>导出进度</b><br><small>保存为 JSON 文件</small></div><button class="btn soft" data-action="export">${L.icon("download")} 导出</button></div>
<div class="setting-row"><div><b>导入进度</b><br><small>从本网站导出的备份恢复</small></div><button class="btn outline" data-action="import">${L.icon("upload")} 导入</button></div>
<div class="setting-row"><div><b>清空进度</b><br><small>请先备份，操作不可恢复</small></div><button class="btn danger" data-action="reset">清空</button></div>`;}
return `<div class="modal-screen" data-action="close"><div class="modal" role="dialog" aria-modal="true"><div class="welcome-inline" style="margin-bottom:14px"><span class="eyebrow">${L.UI.modal==="grid"?"QUESTION INDEX":"SETTINGS"}</span><button class="icon-btn" data-action="close" aria-label="关闭">${L.icon("close")}</button></div>${body}</div></div>`;
};
})(window.L);