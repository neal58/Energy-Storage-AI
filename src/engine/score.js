const clamp=value=>Math.max(0,Math.min(100,value));
const OVERUSED=new Set([...'梓宸轩辰诺涵睿熙泽宇浩欣怡']);
export function scorePronunciation(candidate,context={}){
  const tones=[context.surnameTone??0,...(candidate.tones??[])].filter(Boolean);
  let score=86;const notes=[];
  const unique=new Set(tones).size;
  if(unique===tones.length){score+=8;notes.push('声调起伏清楚')}
  else if(unique>=2){score+=3;notes.push('声调总体自然')}
  if(tones.length===3&&tones.every(t=>t===tones[0])){score-=22;notes.push('声调较平')}
  for(let i=0;i<tones.length-1;i++){
    if(tones[i]===tones[i+1])score-=5;
    if(tones[i]===3&&tones[i+1]===3)score-=8;
  }
  return {score:clamp(score),notes:[...new Set(notes)]};
}
export function scoreCandidate(candidate,context={}){
  const pronunciation=scorePronunciation(candidate,context);
  let preference=50;
  if(candidate.styles.includes(context.style))preference+=22;
  if(candidate.meanings.includes(context.meaning))preference+=20;
  if(context.trend==='stable')preference+=candidate.popularity>=3?10:-2;
  if(context.trend==='balanced')preference+=candidate.popularity>=2&&candidate.popularity<=4?10:0;
  if(context.trend==='niche')preference+=candidate.popularity<=2?12:-4;
  if(context.avoidTrend)preference-=candidate.chars.filter(char=>OVERUSED.has(char)).length*18;
  if(candidate.sourceVerified)preference+=2;
  preference=clamp(preference);
  const total=Math.round(candidate.natural*.32+pronunciation.score*.25+candidate.semantic*.18+candidate.adult*.10+candidate.writing*.05+preference*.10);
  return {total,naturalness:candidate.natural,pronunciation:pronunciation.score,pronunciationNotes:pronunciation.notes,semantics:candidate.semantic,growthFit:candidate.adult,usability:candidate.writing,preference};
}
