import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const dir=new URL(".",import.meta.url);
const files=["data.js","core.js","pages-home.js","pages-study.js","pages-quiz.js","pages-review.js","app.js"];
const read=name=>fs.readFileSync(new URL(name,dir),"utf8");
for(const file of files){new vm.Script(read(file),{filename:file});console.log("syntax ok:",file)}
const context={window:{}};vm.runInNewContext(read("data.js"),context,{filename:"data.js"});
const data=context.window.LEXFLOW_DATA;
assert.ok(data&&Array.isArray(data.units)&&Array.isArray(data.questions));
assert.equal(data.units.length,10);
assert.equal(data.questions.length,54);
assert.equal(new Set(data.questions.map(x=>x.id)).size,data.questions.length);
const unitIds=new Set(data.units.map(x=>x.id));
for(const q of data.questions){
  assert.ok(unitIds.has(q.unit),"unknown unit: "+q.id);
  assert.ok(["single","multi"].includes(q.type),q.id);
  const keys=Object.keys(q.options),reasons=Object.keys(q.reasons);
  assert.deepEqual(keys,["A","B","C","D"],"four options: "+q.id);
  assert.deepEqual(reasons,keys,"explanation for each option: "+q.id);
  assert.ok(q.answer.length>=1&&q.answer.every(x=>keys.includes(x)),"answer keys: "+q.id);
  if(q.type==="single")assert.equal(q.answer.length,1,"single answer: "+q.id);
  for(const k of keys)assert.ok(q.reasons[k].trim().length>=8,"reason too short: "+q.id+" "+k);
  assert.ok(q.analysis&&q.analysis.length>=15,"detailed analysis: "+q.id);
  assert.ok(q.source&&q.stem,"source & stem: "+q.id);
}
const index=read("index.html");
for(const file of files)assert.ok(index.includes('src="./'+file+'?v='),"script not imported: "+file);
assert.ok(index.includes("styles.css"));
console.log("PASS 54 questions, 10 units, unique ids, all options explained, app scripts and CSS imported");