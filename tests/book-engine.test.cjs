const test=require('node:test');
const assert=require('node:assert/strict');
require('../src/name-engine.cjs');
const book=require('../src/book-engine.cjs');

const base={
 fatherSurname:'陈',motherSurname:'林',surnameMode:'father',maternalMode:'symbolic',gender:'neutral',
 birthDate:'2026-07-14',birthTime:'19:20',traditionalReference:true,style:'耐看自然',meaning:'品格',
 namingMethod:'yi',familyWish:'希望孩子明理、自持、待人有分寸',generationChar:'',generationPosition:'either',
 elderTabooChars:'',requiredChar:'',avoidChars:'',customTaboos:'',avoidTrend:true,excludedNames:[]
};

test('builds a clear naming brief before recommending names',()=>{
 const brief=book.buildNamingBrief(base);
 assert.ok(brief.includes('义｜德行志向'));
 assert.ok(brief.includes('明理'));
 assert.ok(brief.includes('林'));
});

test('five naming methods are available and documented',()=>{
 assert.deepEqual(Object.keys(book.METHODS),['xin','yi','xiang','jia','lei']);
 assert.equal(book.METHODS.xin.classical,'信');
 assert.equal(book.METHODS.lei.classical,'类');
});

test('changing naming method materially changes recommendations',()=>{
 const virtue=book.recommend({...base,namingMethod:'yi',maternalMode:'none'},0,6);
 const imagery=book.recommend({...base,namingMethod:'jia',maternalMode:'none',style:'自然舒展',meaning:'成长'},0,6);
 assert.equal(virtue.length,6);
 assert.equal(imagery.length,6);
 const overlap=virtue.filter(a=>imagery.some(b=>b.name===a.name)).length;
 assert.ok(overlap<=3,`overlap=${overlap}: ${virtue.map(x=>x.name)} / ${imagery.map(x=>x.name)}`);
 assert.ok(virtue.every(x=>x.route&&x.routeReason));
 assert.ok(imagery.every(x=>x.route&&x.routeReason));
});

test('generation character and elder taboo are hard constraints',()=>{
 const results=book.recommend({...base,namingMethod:'lei',generationChar:'明',generationPosition:'first',elderTabooChars:'远'},0,12);
 assert.ok(results.length>0);
 assert.ok(results.every(x=>x.name[0]==='明'));
 assert.ok(results.every(x=>!x.name.includes('远')));
});

test('birth evidence has limited effect outside xin route',()=>{
 const morning=book.recommend({...base,namingMethod:'yi',birthTime:'06:30',maternalMode:'none'},0,6);
 const night=book.recommend({...base,namingMethod:'yi',birthTime:'22:30',maternalMode:'none'},0,6);
 assert.ok([...morning,...night].every(x=>x.quality>=90));
 const overlap=morning.filter(a=>night.some(b=>b.name===a.name)).length;
 assert.ok(overlap>=3,`birth time overpowered quality: overlap=${overlap}`);
});

test('xin route explains birth facts instead of fortune claims',()=>{
 const results=book.recommend({...base,namingMethod:'xin',birthTime:'06:30'},0,6);
 assert.ok(results.length>0);
 assert.ok(results.every(x=>x.route==='信'));
 assert.ok(results.some(x=>x.routeReason.includes('出生')));
 assert.ok(results.every(x=>!x.routeReason.includes('命运')&&!x.routeReason.includes('补')));
});

test('source type is explicit and never fabricated',()=>{
 const results=book.recommend({...base,namingMethod:'yi'},0,12);
 assert.ok(results.every(x=>['direct','modern'].includes(x.sourceType)));
 assert.ok(results.every(x=>x.sourceType==='direct'?Boolean(x.source):x.source===''));
});

test('feedback can exclude names and reshape preference',()=>{
 const first=book.recommend(base,0,6);
 const next=book.recommend({...base,excludedNames:[first[0].name],feedback:{tooAncient:true}},0,6);
 assert.ok(next.every(x=>x.name!==first[0].name));
 assert.ok(next.every(x=>!x.styles.includes('古典雅致')||x.quality>=97));
});
