import {SURNAME_PROFILES,MATERNAL_SYMBOLS,CHARACTER_MAP,PAIRS,RELATION_LABELS} from './dynamic-data.js';

const DIRECT_MATERNAL = {
  林:{fact:{char:'林',pinyin:'lín',tone:2,initial:'l',final:'in',gender:'neutral',roles:['nature','first'],meanings:['生长','清润'],styles:['自然','温润'],birthTags:['生长','清润'],commonness:5,writing:5,popularity:3},seconds:['安','宁','和','清','远','宜','澄','然']},
  江:{fact:{char:'江',pinyin:'jiāng',tone:1,initial:'j',final:'iang',gender:'neutral',roles:['nature','first'],meanings:['开阔','流动'],styles:['自然','清朗'],birthTags:['开阔','流动'],commonness:5,writing:5,popularity:3},seconds:['宁','远','清','和','澄','舟','朗','安']},
  苏:{fact:{char:'苏',pinyin:'sū',tone:1,initial:'s',final:'u',gender:'neutral',roles:['state','first'],meanings:['舒展','新生'],styles:['清雅','现代'],birthTags:['舒展','初始'],commonness:5,writing:5,popularity:3},seconds:['宁','和','清','宜','远','然','安','仪']},
  沈:{fact:{char:'沈',pinyin:'shěn',tone:3,initial:'sh',final:'en',gender:'neutral',roles:['state','first'],meanings:['沉静','深远'],styles:['稳重','书卷'],birthTags:['沉静','深远'],commonness:4,writing:4,popularity:2},seconds:['宁','安','澄','远','和','清','然','哲']}
};

const stripTone = (text = '') => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function getSeasonTags(month){
  if([3,4,5].includes(month)) return ['生长','清润','和煦'];
  if([6,7,8].includes(month)) return ['明朗','充沛','开阔'];
  if([9,10,11].includes(month)) return ['澄澈','收获','坚定'];
  return ['沉静','安定','坚韧','深远'];
}

function getTimeTags(hour){
  if(hour>=5&&hour<9) return ['晨光','初始','明朗'];
  if(hour>=9&&hour<17) return ['开阔','进取','明晰'];
  if(hour>=17&&hour<21) return ['温和','安宁','收束'];
  return ['沉静','清澈','安定'];
}

function countElements(strings){
  const counts={木:0,火:0,土:0,金:0,水:0};
  for(const text of strings){for(const char of String(text||'')){if(char in counts)counts[char]++;}}
  return counts;
}

export function buildBirthProfile({date,time,timezone='+08:00',enabled=true}){
  if(!date||!time) return {enabled:false,seasonTags:[],timeTags:[],traditionalTags:[],pillars:{},elementCounts:{木:0,火:0,土:0,金:0,水:0},warnings:['未填写完整出生时间']};
  const [year,month,day]=date.split('-').map(Number);
  const [hour,minute]=time.split(':').map(Number);
  const profile={enabled:Boolean(enabled),localDateTime:`${date}T${time}`,timezone,seasonTags:getSeasonTags(month),timeTags:getTimeTags(hour),traditionalTags:[],pillars:{},elementCounts:{木:0,火:0,土:0,金:0,水:0},warnings:[]};
  if(hour===23||hour===0) profile.warnings.push('出生时间位于子时边界，不同传统流派对日柱划分可能不同');
  if(enabled && globalThis.Solar){
    try{
      const solar=globalThis.Solar.fromYmdHms(year,month,day,hour,minute,0);
      const lunar=solar.getLunar();
      const eight=lunar.getEightChar();
      profile.lunarText=lunar.toString();
      profile.pillars={year:eight.getYear(),month:eight.getMonth(),day:eight.getDay(),time:eight.getTime()};
      const wx=[eight.getYearWuXing(),eight.getMonthWuXing(),eight.getDayWuXing(),eight.getTimeWuXing()];
      profile.elementCounts=countElements(wx);
      const min=Math.min(...Object.values(profile.elementCounts));
      profile.traditionalTags=Object.entries(profile.elementCounts).filter(([,value])=>value===min).map(([key])=>({木:'生长',火:'明朗',土:'安定',金:'坚定',水:'清澈'}[key]));
    }catch(error){profile.warnings.push(`历法计算失败：${error.message}`);}
  }else if(enabled){
    profile.warnings.push('历法库未加载，当前仅使用季节与当地时段参与推荐');
  }
  return profile;
}

export function createNamingTask(input){
  const surname=input.surnameMode==='mother'?input.motherSurname:input.surnameMode==='double'?`${input.fatherSurname}${input.motherSurname}`:input.fatherSurname;
  const maternalTags=input.maternalMode==='symbolic'?(MATERNAL_SYMBOLS[input.motherSurname]||[]):[];
  const birthProfile=buildBirthProfile({date:input.birthDate,time:input.birthTime,timezone:input.timezone,enabled:input.traditionalReference});
  return {
    ...input,
    surname,
    surnameProfile:SURNAME_PROFILES[surname]||SURNAME_PROFILES[surname[0]]||{pinyin:'',tone:0,initial:'',final:'',unknown:true},
    maternalTags,
    birthProfile,
    nameLength:input.surnameMode==='double'&&Number(input.nameLength)!==2?1:Number(input.nameLength||2),
    requiredChar:(input.requiredChar||'').trim(),
    avoidSet:new Set([...(input.avoidChars||'')]),
    tabooTerms:(input.customTaboos||'').split(/[，,\s]+/).map(x=>x.trim()).filter(Boolean)
  };
}

function genderScore(candidateGender,taskGender){
  if(taskGender==='neutral'||candidateGender==='neutral') return 1;
  return candidateGender===taskGender?1:-0.35;
}

function tagMatches(fact,tags){return tags.reduce((sum,tag)=>sum+(fact.meanings.includes(tag)||fact.styles.includes(tag)||fact.birthTags.includes(tag)?1:0),0);}

export function reviewPhonology(surname,surnameProfile,candidate){
  const chars=candidate.chars;
  const hardRisks=[],warnings=[],evidence=[];
  if(!surnameProfile||surnameProfile.unknown){warnings.push('姓氏拼音未收录，音律结论置信度较低');}
  if(surnameProfile?.pinyin&&chars[0]&&stripTone(surnameProfile.pinyin)===stripTone(chars[0].pinyin)) hardRisks.push('姓与名首字同音');
  const tones=[surnameProfile?.tone,...chars.map(x=>x.tone)].filter(Boolean);
  if(tones.length>=3&&new Set(tones).size===1) hardRisks.push('全名声调完全相同');
  let score=92;
  for(let i=0;i<tones.length-1;i++) if(tones[i]===tones[i+1]) score-=6;
  const phonetics=[surnameProfile,...chars].filter(Boolean);
  for(let i=0;i<phonetics.length-1;i++){
    if(phonetics[i].initial&&phonetics[i].initial===phonetics[i+1].initial){score-=5;warnings.push('相邻声母重复');}
    if(phonetics[i].final&&phonetics[i].final===phonetics[i+1].final){score-=7;warnings.push('相邻韵母重复');}
  }
  if(hardRisks.length===0) evidence.push('全名没有明显同音或同调硬伤');
  return {passed:hardRisks.length===0,score:Math.max(0,score),hardRisks,warnings:[...new Set(warnings)],evidence};
}

function seededValue(text,seed){let h=2166136261+seed;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}

function candidateScore(task,first,second,phonology){
  const facts=[first,...(second?[second]:[])];
  const userTags=[task.style,task.meaning];
  const birthTags=[...task.birthProfile.seasonTags,...task.birthProfile.timeTags,...task.birthProfile.traditionalTags];
  const maternalTags=task.maternalTags;
  const preference=facts.reduce((sum,f)=>sum+tagMatches(f,userTags)*10,0);
  const birth=Math.min(15,facts.reduce((sum,f)=>sum+tagMatches(f,birthTags)*2.5,0));
  const maternal=Math.min(8,facts.reduce((sum,f)=>sum+tagMatches(f,maternalTags)*2,0));
  const gender=facts.reduce((sum,f)=>sum+genderScore(f.gender,task.gender)*4,0);
  const usability=facts.reduce((sum,f)=>sum+f.commonness*2+f.writing,0);
  const popularityPenalty=task.avoidTrend?facts.reduce((sum,f)=>sum+(f.popularity>=5?5:0),0):0;
  return 55+preference+birth+maternal+gender+usability+phonology.score*.18-popularityPenalty;
}

function buildCandidate(task,first,second){
  const chars=[first,...(second?[second]:[])];
  const givenName=chars.map(x=>x.char).join('');
  const fullName=task.surname+givenName;
  if(task.avoidSet.size&&chars.some(x=>task.avoidSet.has(x.char))) return null;
  if(task.requiredChar&&!givenName.includes(task.requiredChar)) return null;
  if(task.maternalMode==='direct'&&givenName[0]!==task.motherSurname) return null;
  if(task.tabooTerms.some(term=>fullName.includes(term)||givenName.includes(term))) return null;
  const phonology=reviewPhonology(task.surname,task.surnameProfile,{chars});
  if(!phonology.passed) return null;
  const firstRole=first.roles.find(role=>RELATION_LABELS[role])||'quality';
  const secondRole=second?.roles.find(role=>RELATION_LABELS[role])||'virtue';
  const relation=`${RELATION_LABELS[firstRole]||'气质'}与${RELATION_LABELS[secondRole]||'内涵'}相连`;
  const score=candidateScore(task,first,second,phonology);
  const birthContribution=[...task.birthProfile.seasonTags,...task.birthProfile.timeTags].filter(tag=>chars.some(f=>f.birthTags.includes(tag)));
  const maternalContribution=task.maternalTags.filter(tag=>chars.some(f=>f.meanings.includes(tag)||f.birthTags.includes(tag)||f.styles.includes(tag)));
  return {
    givenName,fullName,chars,pinyin:[task.surnameProfile.pinyin,...chars.map(x=>x.pinyin)].filter(Boolean).join(' · '),
    score,phonology,relation,
    meaning:`${first.meanings[0]}${second?`，并延伸到${second.meanings[0]}`:''}，整体表达${relation}。`,
    birthContribution,maternalContribution,
    category:'综合推荐',source:'无直接可靠出处，按现代汉语语义关系与姓名习惯生成。'
  };
}

function allCandidates(task){
  const candidates=[];
  if(task.maternalMode==='direct'){
    const route=DIRECT_MATERNAL[task.motherSurname];
    if(!route)return [];
    if(task.nameLength===1){const item=buildCandidate(task,route.fact,null);return item?[item]:[];}
    for(const secondChar of route.seconds){const second=CHARACTER_MAP.get(secondChar);if(!second)continue;const item=buildCandidate(task,route.fact,second);if(item)candidates.push(item);}
    return candidates;
  }
  if(task.nameLength===1){
    for(const fact of CHARACTER_MAP.values()){
      if(!fact.roles.includes('single')) continue;
      const item=buildCandidate(task,fact,null);if(item)candidates.push(item);
    }
    return candidates;
  }
  for(const [firstChar,seconds] of Object.entries(PAIRS)){
    const first=CHARACTER_MAP.get(firstChar);if(!first)continue;
    for(const secondChar of seconds){
      const second=CHARACTER_MAP.get(secondChar);if(!second)continue;
      const item=buildCandidate(task,first,second);if(item)candidates.push(item);
    }
  }
  return candidates;
}

export function generateRecommendations(task,{seed=0,limit=8}={}){
  const ranked=allCandidates(task)
    .map(item=>({...item,score:item.score+seededValue(item.fullName,seed)*5}))
    .sort((a,b)=>b.score-a.score);
  const selected=[],firstChars=new Set(),categories=['综合最贴合','稳妥耐用','小众自然','家庭纪念','出生意象','现代简洁','书卷文化','探索方向'];
  for(const item of ranked){
    if(selected.length>=limit)break;
    if(firstChars.has(item.givenName[0])&&ranked.length>limit*2)continue;
    item.category=categories[selected.length]||'备选';
    item.level=item.score>=100?'strong':item.score>=88?'consider':'explore';
    selected.push(item);firstChars.add(item.givenName[0]);
  }
  return selected;
}
