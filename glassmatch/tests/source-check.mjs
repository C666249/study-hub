/**
 * GlassMatch static smoke gate. No build tool and no GitHub Actions required.
 * Run locally: node glassmatch/tests/source-check.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.equal(scripts.length,3,'expected data, app, and SW scripts');
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
assert(main.includes('function openSearchOverlay'),'search route missing');
assert(main.includes('animateHistoryDrawer'),'measured history drawer missing');
assert(main.includes('function renderExtraQuestion'),'reading cards missing');
console.log('GlassMatch source-check PASS: scripts, selectors, DOM, 2025 reading data, search flow.');
