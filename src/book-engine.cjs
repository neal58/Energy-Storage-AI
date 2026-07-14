(function(root,factory){
  const api=factory(typeof module!=='undefined'&&module.exports?require('./name-engine.cjs'):root.HaoMingEngine);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.HaoMingBookEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
'use strict';
if(!Base)throw new Error('基础姓名引擎未加载');

const METHODS={
  xin:{classical:'信',label:'信｜出生纪念',description:'依据可确认的出生时间、季节、地点或家庭经历命名。'},
  yi:{classical:'义',label:'义｜德行志向',description:'依据德行、价值观和人生期许命名。'},
  xiang:{classical:'象',label:'象｜气质人格',description:'依据希望呈现的气质、人格和整体形象命名。'},
  jia:{classical:'假',label:'假｜自然意象',description:'借草木、山川、天象和典籍意象表达祝愿。'},
  lei:{classical:'类',label:'类｜家族呼应',description:'通过辈分字、父母姓氏或家族共同意象形成联系。'}
};

const METHOD_NAMES={
  xin:new Set('念初 初宁 初安 有初 斯年 嘉月 昭宁 昭华 清晏 晏如 安宁 安然 景明'.split(' ')),
  yi:new Set('思齐 明哲 知远 见微 书衡 允文 修远 弘毅 守正 明远 思远 承安 承远 承宁 明谦 怀谦 谨言 安礼 景远 松远 怀信 怀瑾 若谷 嘉言 敬安 敬和 允和 允宁'.split(' ')),
  xiang:new Set('清和 安和 嘉宁 清越 清扬 明澈 景澄 明澄 云朗 清朗 朗然 清妍 婉清 静宜 书仪 昭仪 嘉仪 柔嘉 婉如 若安 清宜 温言 温宁 恬宁 悠然 可心 舒然 若清'.split(' ')),
  jia:new Set('南乔 嘉禾 嘉树 云舒 云起 清川 景川 云川 禾宁 禾安 乔安 川宁 松宁 竹宁 竹清 星野 闻溪 望舒 嘉月 沐阳 芷晴'.split(' ')),
  lei:new Set('承安 承远 承宁 允文 维桢 斯年 有初 嘉宁 安宁 予安 予宁 亦安 亦宁 书宁 清宁'.split(' '))
};

const NATURE_CHARS=new Set([...'云川禾乔竹松溪月星山树澄晏景南芷桐沐阳']);
const POLYPHONIC=new Set([...'行乐重长柏单解区查曾']);
const HARD_RISK_FULL=new Set(['吴能','吴用','朱逸群','史珍香','杜子腾','苏宁']);
const DIRECT_FAMILY={
  林:['林安','林宁','林清','林和','林远','林溪'],
  江:['江宁','江远','江清','江禾','江月'],
  沈:['沈宁','沈安','沈清','沈远'],
  苏:['苏安','苏和','苏清','苏宜'],
  叶:['叶安','叶宁','叶清','叶禾']
};

const EXPLANATIONS={
  清和:'清正而温和，重在有原则也有分寸。',嘉言:'重视真诚、美好的表达，也寓意言行值得信赖。',思齐:'见贤思齐，强调自省、学习和不断向善。',明哲:'明达而有智慧，强调判断力与清醒自持。',知远:'由求知走向远见，寓意眼界与判断能够共同成长。',
  修远:'以修身为起点，以长远志向为方向。',弘毅:'胸襟开阔而意志坚定，强调担当和韧性。',守正:'在变化中守住原则与底线。',怀谦:'有胸怀而不自满，温厚且有分寸。',谨言:'表达审慎、言而有信，成熟但不沉闷。',
  南乔:'借南方高木的意象，表达舒展、独立和向上生长。',嘉禾:'借美好禾苗与收获意象，表达踏实成长。',嘉树:'借挺立生长的树木意象，表达根基与品格。',云舒:'借云卷云舒的状态，表达从容与开阔。',清川:'借清澈流动的水川意象，表达通透与生命力。',
  静姝:'沉静而美好，重在内在修养与端庄气质。',令仪:'仪度端方、举止得体，强调长期社会使用中的稳重感。',攸宁:'安适从容，寓意内心有定、生活有序。',清妍:'清正明净而不失美好，气质清爽克制。',婉清:'温婉而清正，柔和但不软弱。',
  念初:'记得出发时的初心，也可作为出生纪念路线的表达。',有初:'万事有始，强调珍视开始并善始善终。',斯年:'以岁月为纪，表达对出生年份与成长时光的珍重。',昭宁:'明朗与安宁并存，适合晨光或希望感的出生纪念。',清晏:'清明安定，强调平和有序的生活状态。'
};

function fullSurname(input){return Base.fullSurname(input);}
function birthTags(input){return Base.profile(input);}
function maternalTags(input){return input.maternalMode==='symbolic'?(Base.MATERNAL[input.motherSurname]||[]):[];}
function intersects(a=[],b=[]){return a.filter(item=>b.includes(item));}
function uniq(items){return[...new Set(items.filter(Boolean))];}
function charPinyin(ch){
  if(Base.PINYIN[ch])return Base.PINYIN[ch];
  if(Base.SURNAME[ch])return Base.SURNAME[ch];
  return[ch,0];
}
function sourceType(record){return record.source?'direct':'modern';}

function methodsFor(record,input){
  const methods=[];
  for(const key of Object.keys(METHOD_NAMES))if(METHOD_NAMES[key].has(record.name))methods.push(key);
  if(record.meanings?.some(x=>['智慧','品格','志向','责任'].includes(x)))methods.push('yi');
  if(record.styles?.some(x=>['温润清雅','清朗明亮','耐看自然','大气稳重'].includes(x)))methods.push('xiang');
  if([...record.name].some(ch=>NATURE_CHARS.has(ch))||record.styles?.includes('自然舒展'))methods.push('jia');
  if((input.generationChar&&record.name.includes(input.generationChar))||record.familyDirect||maternalHit(record,input).length)methods.push('lei');
  if(record.birth?.length)methods.push('xin');
  return uniq(methods);
}
function maternalHit(record,input){
  const tags=maternalTags(input);
  return uniq([...intersects(record.styles||[],tags),...intersects(record.meanings||[],tags),...intersects(record.birth||[],tags)]);
}
function birthHit(record,input){return intersects(record.birth||[],birthTags(input));}

function makeDirectFamilyRecords(input){
  if(input.maternalMode!=='direct')return[];
  const names=DIRECT_FAMILY[input.motherSurname]||[];
  return names.map(name=>({
    name,gender:'neutral',styles:['父母纪念','耐看自然'],meanings:['品格','平安'],birth:['安宁','清润'],quality:91,popularity:2,source:'',familyDirect:true
  }));
}

function normalizeInput(input={}){
  return{
    namingMethod:'yi',familyWish:'',generationChar:'',generationPosition:'either',elderTabooChars:'',feedback:{},excludedNames:[],
    fatherSurname:'陈',motherSurname:'林',surnameMode:'father',maternalMode:'none',gender:'neutral',birthDate:'',birthTime:'',traditionalReference:false,
    style:'耐看自然',meaning:'品格',requiredChar:'',avoidChars:'',customTaboos:'',avoidTrend:true,...input
  };
}

function passesGeneration(name,input){
  if(!input.generationChar)return true;
  if(input.generationPosition==='first')return name[0]===input.generationChar;
  if(input.generationPosition==='second')return name[1]===input.generationChar;
  return name.includes(input.generationChar);
}

function hardFilter(record,input){
  const surname=fullSurname(input);const full=surname+record.name;
  if(record.quality<90)return false;
  if(HARD_RISK_FULL.has(full))return false;
  if((input.excludedNames||[]).includes(record.name))return false;
  if([...record.name].some(ch=>POLYPHONIC.has(ch)))return false;
  if(input.requiredChar&&!record.name.includes(input.requiredChar))return false;
  if(!passesGeneration(record.name,input))return false;
  const blocked=new Set([...(input.avoidChars||''),...(input.elderTabooChars||'')]);
  if([...record.name].some(ch=>blocked.has(ch)))return false;
  const terms=(input.customTaboos||'').split(/[，,\s]+/).filter(Boolean);
  if(terms.some(term=>full.includes(term)||record.name.includes(term)))return false;
  if(input.gender!=='neutral'&&record.gender!=='neutral'&&record.gender!==input.gender)return false;
  const sound=Base.toneReview(surname,record.name);
  if(!sound.passed)return false;
  if(input.feedback?.tooAncient&&record.styles?.includes('古典雅致')&&record.quality<97)return false;
  if(input.feedback?.tooSoft&&record.gender==='girl'&&!record.styles?.includes('大气稳重'))return false;
  if(input.feedback?.tooHard&&record.gender==='boy'&&record.styles?.includes('大气稳重')&&!record.styles?.includes('温润清雅'))return false;
  return true;
}

function methodMatch(record,input){
  const methods=methodsFor(record,input);
  if(input.namingMethod==='lei')return methods.includes('lei')||Boolean(input.generationChar)||input.maternalMode!=='none';
  return methods.includes(input.namingMethod);
}

function routeReason(record,input,method,bHits,mHits){
  const wish=input.familyWish?.trim();
  if(method==='xin'){
    const facts=uniq([...bHits,...birthTags(input)]).slice(0,3);
    return`以出生事实为纪念，参考${facts.join('、')||'出生时节'}形成名字意象；它只记录成长起点，不作命运判断。`;
  }
  if(method==='yi')return`以德行与人生期待立意，重点表达${record.meanings?.join('、')||input.meaning}${wish?`，并回应家庭期待“${wish}”`:''}。`;
  if(method==='xiang')return`以人格气质立意，名字希望呈现${record.styles?.join('、')||input.style}的整体形象，而不是堆叠吉祥字。`;
  if(method==='jia')return`借自然或文化意象寄托祝愿，${record.source?'同时保留可核验的原文依据':'以现代汉语中已经成立的意象关系为基础'}。`;
  const family=[];
  if(input.generationChar)family.push(`辈分字“${input.generationChar}”`);
  if(record.familyDirect)family.push(`母姓“${input.motherSurname}”直接入名`);
  if(mHits.length)family.push(`母姓意象${mHits.join('、')}`);
  return`以家族关系为立意，通过${family.join('、')||'父母与家族共同期待'}形成呼应，同时保留完整姓名的自然读感。`;
}

function semanticText(record,input){
  if(EXPLANATIONS[record.name])return EXPLANATIONS[record.name];
  if(record.source)return`从可核验典籍语句中取意，表达${record.meanings?.join('、')||input.meaning}，原文语境经单独标注。`;
  return`“${record.name}”作为一个整体表达${record.meanings?.join('、')||input.meaning}，语义关系完整，适合日常与成年后的正式使用。`;
}

function score(record,input){
  const surname=fullSurname(input);const sound=Base.toneReview(surname,record.name);
  const methods=methodsFor(record,input);const bHits=birthHit(record,input);const mHits=maternalHit(record,input);
  let total=record.quality*0.38+sound.score*0.24;
  if(methods.includes(input.namingMethod))total+=20;else total-=10;
  if(record.styles?.includes(input.style))total+=8;
  if(record.meanings?.includes(input.meaning))total+=6;
  if(input.gender!=='neutral'){if(record.gender===input.gender)total+=5;else if(record.gender==='neutral')total+=1;}
  const birthCap=input.namingMethod==='xin'?12:4;
  total+=Math.min(birthCap,bHits.length*(input.namingMethod==='xin'?4:1.5));
  const familyCap=input.namingMethod==='lei'?12:4;
  total+=Math.min(familyCap,mHits.length*3+(input.generationChar&&record.name.includes(input.generationChar)?6:0)+(record.familyDirect?7:0));
  if(input.avoidTrend&&record.popularity>=4)total-=3+(record.popularity-4)*2;
  if(input.feedback?.tooCommon&&record.popularity>=4)total-=8;
  if(input.feedback?.tooRare&&record.popularity<=1)total-=7;
  if(record.source)total+=1;
  return{...record,total,sound,methods,birthHit:bHits,maternalHit:mHits};
}

function diversify(ranked,limit){
  const selected=[];const firstCount=new Map();const styleCount=new Map();
  for(const candidate of ranked){
    const first=candidate.name[0];const mainStyle=candidate.styles?.[0]||'';
    if((firstCount.get(first)||0)>=1&&ranked.length>limit*2)continue;
    if((styleCount.get(mainStyle)||0)>=2&&ranked.length>limit*2)continue;
    selected.push(candidate);
    firstCount.set(first,(firstCount.get(first)||0)+1);
    styleCount.set(mainStyle,(styleCount.get(mainStyle)||0)+1);
    if(selected.length>=limit*4)break;
  }
  return selected;
}

function buildNamingBrief(rawInput){
  const input=normalizeInput(rawInput);const method=METHODS[input.namingMethod]||METHODS.yi;
  const family=[];
  if(input.generationChar)family.push(`使用${input.generationPosition==='first'?'首字':input.generationPosition==='second'?'末字':'任一位置'}辈分字“${input.generationChar}”`);
  if(input.maternalMode==='symbolic')family.push(`轻度呼应母姓“${input.motherSurname}”的文化意象`);
  if(input.maternalMode==='direct')family.push(`将母姓“${input.motherSurname}”直接纳入名字`);
  if(input.elderTabooChars)family.push(`避开长辈用字“${input.elderTabooChars}”`);
  const wish=input.familyWish?.trim()||`希望孩子拥有${input.meaning}，整体气质${input.style}`;
  return`${method.label}：${wish}；${family.join('，')||'不设置额外家族字形约束'}。名字自然度、完整语义与全名读感优先。`;
}

function recommend(rawInput,batch=0,limit=6){
  const input=normalizeInput(rawInput);const pool=[...Base.CORPUS,...makeDirectFamilyRecords(input)];
  const prepared=pool.filter(record=>hardFilter(record,input)).map(record=>score(record,input));
  let matched=prepared.filter(record=>methodMatch(record,input));
  if(matched.length<limit)matched=[...matched,...prepared.filter(record=>!matched.some(item=>item.name===record.name))];
  matched.sort((a,b)=>b.total-a.total||b.quality-a.quality||a.name.localeCompare(b.name,'zh-CN'));
  const diverse=diversify(matched,limit);
  const offset=(Math.max(0,batch)*limit)%Math.max(limit,diverse.length||limit);
  let page=diverse.slice(offset,offset+limit);
  if(page.length<limit&&diverse.length>limit)page=[...page,...diverse.slice(0,limit-page.length)];
  const method=METHODS[input.namingMethod]||METHODS.yi;
  return page.map(record=>({
    ...record,
    fullName:fullSurname(input)+record.name,
    pinyin:Base.toneReview(fullSurname(input),record.name).pinyin.join(' · '),
    route:method.classical,
    routeLabel:method.label,
    routeReason:routeReason(record,input,input.namingMethod,record.birthHit,record.maternalHit),
    meaningText:semanticText(record,input),
    sourceType:sourceType(record),
    publicLevel:record.quality>=97&&record.sound.score>=90?'强推荐':record.quality>=93?'值得考虑':'风格探索'
  }));
}

return{METHODS,buildNamingBrief,recommend,fullSurname,birthTags};
});
