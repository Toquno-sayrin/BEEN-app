const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file) {
  const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const mod={exports:{}};new Function('exports','module',js)(mod.exports,mod);return mod.exports;
}
const {parseWorld,removeMemory}=load('src/worldModel.ts');
const {miniatureMarker}=load('src/components/miniatureMarker.ts');
const memory={id:'visit-1',place:{id:'place-1',name:'카페',address:'서울',latitude:37.5,longitude:127,memo:'',stay:''},title:'기록',memo:'메모',photo:'file:///photo.jpg',kind:'laptop',rotation:0,size:1,color:'#80bfa7'};
test('empty storage is a valid empty world',()=>assert.deepEqual(parseWorld(null),{memories:[],courses:[]}));
test('visits to the same place stay distinct and course order survives storage',()=>{
  const data={memories:[memory,{...memory,id:'visit-2'}],courses:[{id:'c',title:'코스',memoryIds:['visit-2','visit-1']}]};
  assert.deepEqual(parseWorld(JSON.stringify(data)),data);
});
test('corrupt coordinates, duplicate visits, dangling courses and invalid edits are rejected',()=>{
  for(const m of [{...memory,place:{...memory.place,latitude:100}}, {...memory,size:9}, {...memory,color:'red;position:fixed'}, {...memory,kind:'unknown'}])assert.throws(()=>parseWorld(JSON.stringify({memories:[m],courses:[]})));
  assert.throws(()=>parseWorld(JSON.stringify({memories:[memory,memory],courses:[]})));
  assert.throws(()=>parseWorld(JSON.stringify({memories:[],courses:[{id:'c',title:'c',memoryIds:['gone']}]})));
});
test('deleting a visit removes it from courses without mutating original data',()=>{
  const data={memories:[memory],courses:[{id:'c',title:'코스',memoryIds:[memory.id]}]};
  const next=removeMemory(data,memory.id);assert.deepEqual(next.courses[0].memoryIds,[]);assert.equal(data.memories.length,1);assert.deepEqual(parseWorld(JSON.stringify(next)),next);
});
test('marker content never injects place names or unsafe style values',()=>{
  const html=miniatureMarker({...memory.place,name:'<script>alert(1)</script>',miniature:{kind:'laptop',color:'" onclick="alert(1)',rotation:Infinity,size:Infinity}},2,true);
  assert(!html.includes('alert'));assert(!html.includes('Infinity'));assert(html.includes('장소 3 선택'));
});
