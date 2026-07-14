import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCandidates} from '../src/engine/filter.js';
import {detectFullNameRisks} from '../src/engine/risk.js';
import {scoreCandidate,scorePronunciation} from '../src/engine/score.js';
import {recommendNames} from '../src/engine/recommend.js';

const base={name:'知远',chars:['知','远'],pinyin:['zhī','yuǎn'],tones:[1,3],gender:'boy',styles:['温润'],meanings:['智慧'],meaningText:'',natural:98,semantic:98,adult:99,writing:94,popularity:4,source:'',sourceVerified:false,polyphonic:false,risks:[]};

test('same syllable and surname-specific patterns are rejected',()=>{
  const rule={pinyin:'wáng',tone:2,avoidFirstChars:['望'],avoidFullNamePatterns:[]};
  assert.ok(detectFullNameRisks('王',{...base,name:'望舒',pinyin:['wàng','shū']},rule).length>0);
});

test('filters gender, required and avoided characters',()=>{
  const all=[base,{...base,name:'安礼',chars:['安','礼']}];
  const result=filterCandidates(all,{gender:'boy',requiredChar:'安',avoidChars:['远'],surname:'林',surnameRule:{}});
  assert.deepEqual(result.map(item=>item.name),['安礼']);
});

test('distinct tones get a healthy pronunciation score',()=>{
  assert.ok(scorePronunciation(base,{surnameTone:2}).score>=90);
});

test('niche preference raises low-popularity options',()=>{
  const niche={...base,name:'书衡',popularity:1,styles:['现代']};
  const common=scoreCandidate(base,{surnameTone:2,style:'现代',meaning:'智慧',trend:'niche',avoidTrend:true});
  const rare=scoreCandidate(niche,{surnameTone:2,style:'现代',meaning:'智慧',trend:'niche',avoidTrend:true});
  assert.ok(rare.total>=common.total-5);
});

test('recommendations are unique and categorized',()=>{
  const all=Array.from({length:10},(_,index)=>({...base,name:`名${String.fromCharCode(65+index)}`,popularity:(index%5)+1,sourceVerified:index%3===0,styles:index%2?['现代']:['古典'],score:{total:95-index}}));
  const result=recommendNames(all,{},8);
  assert.equal(new Set(result.map(item=>item.name)).size,result.length);
  assert.ok(result.length>=6);
  assert.equal(result[0].slot,'best');
});
