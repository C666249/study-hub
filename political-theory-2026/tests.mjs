import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';

const dir = new URL('.', import.meta.url);
const data = JSON.parse(readFileSync(new URL('./questions.json',dir),'utf8'));
const q = data.questions;

test('exactly 60 source questions with 40 singles and 20 multis', () => {
  assert.equal(q.length,60);
  assert.equal(q.filter(x=>x.type==='single').length,40);
  assert.equal(q.filter(x=>x.type==='multi').length,20);
});
test('unique IDs and complete original option/answer data', () => {
  assert.equal(new Set(q.map(x=>x.id)).size,60);
  for(const item of q){
    assert.match(item.id,/^[SM]\d{2}$/);
    assert.equal(item.options.length,4,item.id);
    assert.ok(item.stem.length>5,item.id);
    assert.ok(item.explanation.length>10,item.id);
    assert.match(item.answer,/^[A-D]{1,4}$/,item.id);
    assert.equal(new Set(item.answer).size,item.answer.length,item.id);
    if(item.type==='single')assert.equal(item.answer.length,1,item.id);
    else assert.ok(item.answer.length>=2,item.id);
  }
});
test('40/20 question ordering matches source numbering',()=>{
  for(const [type,prefix,max] of [['single','S',40],['multi','M',20]])
    assert.deepEqual(q.filter(x=>x.type===type).map(x=>x.id),Array.from({length:max},(_,i)=>prefix+String(i+1).padStart(2,'0')));
});
test('topic categorization covers all 7 chapters',()=>{
 const topics=[...new Set(q.map(x=>x.topic))];
 assert.equal(topics.length,7);
 for(const topic of topics)assert.ok(q.some(x=>x.topic===topic&&x.type==='multi'));
});
test('source-specific expected answers preserved',()=>{
 const expected={S01:'B',S02:'D',S08:'C',S12:'D',S16:'C',S30:'C',S40:'A',M01:'ACD',M04:'ACD',M11:'AC',M18:'ABCD',M20:'BCD'};
 for(const [id,answer] of Object.entries(expected))assert.equal(q.find(x=>x.id===id)?.answer,answer,id);
});
test('page references local app resources',()=>{
 const html=readFileSync(new URL('./index.html',dir),'utf8');
 for(const path of ['app.js','styles.css','favicon.svg'])assert.ok(html.includes(path));
 assert.ok(readFileSync(new URL('./app.js',dir),'utf8').includes("fetch('questions.json'"));
});
