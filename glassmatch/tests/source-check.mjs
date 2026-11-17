/**
 * GlassMatch static smoke gate. No build tool and no GitHub Actions required.
 * Run locally: node glassmatch/tests/source-check.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.equal(scripts.length,4,'expected data, app, SW, and external Lexi script tags');
for(const src of scripts) new Function(src);
const main=scripts[1];
assert(!/(?<!\$)\$\(['"][^'"]+['"]\)\.(?:forEach|filter|map|find|reduce|some|every)/.test(main),'querySelector used as a collection');
const markup=html.slice(0,html.indexOf('<script id="papersData"'));
const ids=new Set([...markup.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]));
for(const id of ['reader','paper','question','letters','prevBtn','nextBtn','markBtn','collapseBtn','hideBtn','reviveBtn','dictionary','dictClose','dictGo','dictInput','historyShell','dictHistory','dictResult','histToggle','dock','home','wrong'])assert(ids.has(id),id+' missing');
const data=JSON.parse(scripts[0]),ready=data.filter(x=>x.status==='ready');
assert(ready.length>=5,'need verified original matching sets');
for(const set of ready)assert(set.questions.length===10&&set.answers.length===10,set.id+' matching content incomplete');
for(const set of data.filter(x=>x.readingExtra)){
 const text=set.readingExtra.C;const hits=[...text.matchAll(/^\s*(4[6-9]|5[0-5])\s*[.．]\s+/gm)];
 assert.equal(hits.length,10,set.id+' careful reading count');
 for(let j=0;j<hits.length;j++){
   const m=hits[j];let end=j+1<hits.length?hits[j+1].index:text.length;
   if(+m[1]===50){const p=text.indexOf('Passage Two',m.index);if(p>=0&&p<end)end=p;}
   const raw=text.slice(m.index+m[0].length,end);
   for(const k of 'ABCD')assert(new RegExp('\\b'+k+'\\s*\\)').test(raw),set.id+' Q'+m[1]+' option '+k+' missing');
 }
}
const lexi=readFileSync(new URL('../search-lexi-v4.js',import.meta.url),'utf8');
const lexiStyle=readFileSync(new URL('../search-lexi-v4.css',import.meta.url),'utf8');
new Function(lexi);
assert(html.includes('search-lexi-v4.js')&&html.includes('search-lexi-v4.css'),'Lexi assets not mounted');
assert(lexi.includes('content.scrollHeight')&&lexi.includes('rows.slice().reverse()'),'measured drawer/cascade missing');
assert(lexi.includes('lexi-word-ghost')&&lexi.includes('getComputedStyle(title).fontSize'),'word hero/baseline source missing');
assert(lexi.includes('window.addEventListener(\'popstate\''),'Android browser Back handling missing');
assert(lexiStyle.includes('max-height:calc(77dvh')&&!lexiStyle.includes('height:100%;padding:calc(24px'),'compact Lexi search curtain not found');
assert(lexi.includes("const ZH_CACHE_KEY=")&&lexi.includes("langpair:'en|zh-CN'"),'Chinese translation or cache missing');
assert(lexi.includes('function chinesePartLabel(')&&lexi.includes('lexi-pos-abbr'),'POS-specific bilingual labels missing');
assert(lexi.includes('lexi-example-en')&&lexi.includes('lexi-example-zh'),'paired bilingual example rendering missing');
assert(lexi.includes('function translateAllParts(')&&lexi.includes('definitionRenderId'),'progressive translation/stale result guard missing');
assert(lexiStyle.includes('#lexi-v4-root #lexi-search-input:focus-visible')&&lexiStyle.includes('outline:none!important'),'sharp input focus outline not removed');
const desktop=readFileSync(new URL('../responsive-desktop.css',import.meta.url),'utf8');
assert(html.includes('<style id="glassmatch-responsive-desktop">\n'+desktop+'\n</style>'),'responsive file not synchronized with inline CSS');
assert(/@media\s*\(min-width:\s*980px\)\s*and\s*\(min-height:\s*580px\)/.test(desktop),'responsive breakpoint missing');
assert(desktop.includes('clamp(350px, 32vw, 540px)')&&desktop.includes('100dvh'),'browser-size calculations missing');
assert(desktop.includes('#reader .paper')&&desktop.includes('#reader .reader-bottom'),'desktop reader split missing');
assert(desktop.includes('#reader .reader-bottom .question.collapsed'),'desktop collapse layout missing');
assert(desktop.includes('#lexi-word-view .lexi-detail-content'),'desktop dictionary layout missing');
assert(desktop.includes('repeat(2,minmax(0,1fr))')&&desktop.includes('repeat(3,minmax(0,1fr))'),'responsive library columns missing');
assert(html.includes('height:clamp(235px,32dvh,330px)!important'),'original mobile answer-card rule missing');
assert(main.includes('function renderExtraQuestion'),'reading cards missing');
console.log('GlassMatch source-check PASS: bilingual dictionary, phone layout, desktop split reader, scripts, data.');
