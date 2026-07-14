import {detectFullNameRisks} from './risk.js';
export function filterCandidates(candidates,input={}){
  const avoid=new Set(input.avoidChars??[]);
  return candidates.filter(candidate=>{
    if(!input.allowPolyphonic&&candidate.polyphonic)return false;
    if(input.gender&&input.gender!=='neutral'&&candidate.gender!=='neutral'&&candidate.gender!==input.gender)return false;
    if(input.requiredChar&&!candidate.chars.includes(input.requiredChar))return false;
    if(candidate.chars.some(char=>avoid.has(char)))return false;
    return detectFullNameRisks(input.surname??'',candidate,input.surnameRule??{}).length===0;
  });
}
