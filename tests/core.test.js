import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBirthProfile,createNamingTask,generateRecommendations,reviewPhonology} from '../src/dynamic-core.js';

const base={fatherSurname:'陈',motherSurname:'林',surnameMode:'father',maternalMode:'symbolic',gender:'neutral',nameLength:2,birthDate:'2026-07-14',birthTime:'19:20',timezone:'+09:00',traditionalReference:true,style:'清朗',meaning:'成长',requiredChar:'',avoidChars:'',customTaboos:'',avoidTrend:true};

test('morning and night create different birth tags',()=>{
  const morning=buildBirthProfile({date:'2026-07-14',time:'06:30',timezone:'+09:00',enabled:true});
  const night=buildBirthProfile({date:'2026-07-14',time:'22:30',timezone:'+09:00',enabled:true});
  assert.notDeepEqual(morning.timeTags,night.timeTags);
});

test('surname mode and maternal symbolic mode are modeled',()=>{
  const task=createNamingTask({...base,gender:'boy',birthTime:'06:30',style:'温润',meaning:'品格'});
  assert.equal(task.surname,'陈');
  assert.ok(task.maternalTags.includes('生长'));
});

test('required and avoided characters are enforced',()=>{
  const task=createNamingTask({...base,maternalMode:'none',gender:'boy',style:'稳重',meaning:'志向',requiredChar:'远',avoidChars:'轩梓'});
  const results=generateRecommendations(task,{seed:1,limit:8});
  assert.ok(results.length>0);
  assert.ok(results.every(item=>item.givenName.includes('远')));
  assert.ok(results.every(item=>![...'轩梓'].some(char=>item.givenName.includes(char))));
});

test('birth time changes at least part of recommendations',()=>{
  const morning=generateRecommendations(createNamingTask({...base,birthTime:'06:30'}),{seed:2,limit:8});
  const night=generateRecommendations(createNamingTask({...base,birthTime:'22:30'}),{seed:2,limit:8});
  assert.notDeepEqual(morning.map(x=>x.fullName),night.map(x=>x.fullName));
});

test('surname change alters phonology and final list',()=>{
  const a=generateRecommendations(createNamingTask({...base,maternalMode:'none',gender:'boy',traditionalReference:false,style:'稳重',meaning:'智慧',surnameMode:'father'}),{seed:3,limit:8});
  const b=generateRecommendations(createNamingTask({...base,maternalMode:'none',gender:'boy',traditionalReference:false,style:'稳重',meaning:'智慧',surnameMode:'mother'}),{seed:3,limit:8});
  assert.notDeepEqual(a.map(x=>x.fullName),b.map(x=>x.fullName));
});

test('same syllable surname and first character creates a hard risk',()=>{
  const review=reviewPhonology('林',{pinyin:'lín',tone:2,initial:'l',final:'in'},{chars:[{char:'霖',pinyin:'lín',tone:2,initial:'l',final:'in'},{char:'远',pinyin:'yuǎn',tone:3,initial:'y',final:'uan'}]});
  assert.equal(review.passed,false);
});

test('direct maternal mode can generate natural names for supported maternal surnames',()=>{
  const task=createNamingTask({...base,maternalMode:'direct',traditionalReference:false,style:'温润',meaning:'平安'});
  const results=generateRecommendations(task,{seed:0,limit:8});
  assert.ok(results.length>0);
  assert.ok(results.every(item=>item.givenName.startsWith('林')));
});

test('maternal symbolic mode changes at least part of the ranked set',()=>{
  const input={...base,birthDate:'2026-04-14',birthTime:'10:20',traditionalReference:false,style:'自然',meaning:'成长'};
  const off=generateRecommendations(createNamingTask({...input,maternalMode:'none'}),{seed:0,limit:8});
  const symbolic=generateRecommendations(createNamingTask({...input,maternalMode:'symbolic'}),{seed:0,limit:8});
  assert.notDeepEqual(off.map(item=>item.fullName),symbolic.map(item=>item.fullName));
});

test('same input and seed are reproducible',()=>{
  const task=createNamingTask(base);
  const a=generateRecommendations(task,{seed:7,limit:8}).map(item=>item.fullName);
  const b=generateRecommendations(task,{seed:7,limit:8}).map(item=>item.fullName);
  assert.deepEqual(a,b);
});
