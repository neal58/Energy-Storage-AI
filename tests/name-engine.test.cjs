const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../src/name-engine.cjs');
const base={fatherSurname:'陈',motherSurname:'林',surnameMode:'father',maternalMode:'symbolic',gender:'neutral',birthDate:'2026-07-14',birthTime:'19:20',traditionalReference:true,style:'温润清雅',meaning:'智慧',requiredChar:'',avoidChars:'',customTaboos:'',avoidTrend:true};

test('corpus is large, unique and quality-gated',()=>{
 assert.ok(engine.CORPUS.length>=90,engine.CORPUS.length);
 assert.equal(new Set(engine.CORPUS.map(x=>x.name)).size,engine.CORPUS.length);
 assert.ok(engine.CORPUS.every(x=>x.quality>=90));
});

test('default recommendations are stable and high quality',()=>{
 const a=engine.recommend(base,0,6);const b=engine.recommend(base,0,6);
 assert.deepEqual(a.map(x=>x.fullName),b.map(x=>x.fullName));
 assert.equal(a.length,6);
 assert.ok(a.every(x=>x.quality>=92));
 assert.ok(a.every(x=>!['思善','景成','宁澄','怀真','书然','承和'].includes(x.name)));
});

test('male steady route prioritizes established natural names',()=>{
 const result=engine.recommend({...base,gender:'boy',style:'大气稳重',meaning:'志向',maternalMode:'none'},0,6).map(x=>x.name);
 const expected=new Set(['修远','弘毅','守正','明远','知远','承远','思远','景行','怀谦','明哲','嘉树','允文','安礼','谨言']);
 assert.ok(result.filter(x=>expected.has(x)).length>=5,result.join(','));
});

test('female gentle route prioritizes natural names',()=>{
 const result=engine.recommend({...base,fatherSurname:'林',gender:'girl',style:'温润清雅',meaning:'平安',maternalMode:'none'},0,6).map(x=>x.name);
 const expected=new Set(['若宁','舒宁','静宜','攸宁','清妍','婉清','予宁','令仪','静姝','安歌','清扬','嘉卉','望舒','柔嘉','宜修']);
 assert.ok(result.filter(x=>expected.has(x)).length>=5,result.join(','));
});

test('surname changes phonology and ranking',()=>{
 const a=engine.recommend({...base,fatherSurname:'陈',maternalMode:'none'},0,6).map(x=>x.name);
 const b=engine.recommend({...base,fatherSurname:'张',maternalMode:'none'},0,6).map(x=>x.name);
 assert.notDeepEqual(a,b);
});

test('birth period changes evidence without overpowering quality',()=>{
 const morning=engine.recommend({...base,birthTime:'06:30'},0,6);
 const night=engine.recommend({...base,birthTime:'22:30'},0,6);
 assert.notDeepEqual(morning.map(x=>x.birthHit),night.map(x=>x.birthHit));
 assert.ok([...morning,...night].every(x=>x.quality>=92));
});

test('specified and avoided characters are hard constraints',()=>{
 const result=engine.recommend({...base,requiredChar:'宁',avoidChars:'安'},0,12);
 assert.ok(result.length>0);
 assert.ok(result.every(x=>x.name.includes('宁')&&!x.name.includes('安')));
});

test('next batch changes results but preserves quality floor',()=>{
 const a=engine.recommend(base,0,6),b=engine.recommend(base,1,6);
 assert.notDeepEqual(a.map(x=>x.name),b.map(x=>x.name));
 assert.ok(b.every(x=>x.quality>=90));
});

test('local dislike feedback excludes names immediately',()=>{
 const first=engine.recommend(base,0,6);
 const next=engine.recommend({...base,excludedNames:[first[0].name]},0,6);
 assert.ok(next.every(x=>x.name!==first[0].name));
});
