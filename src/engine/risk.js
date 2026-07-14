export function stripTone(text=''){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function detectFullNameRisks(surname,candidate,surnameRule={}){
  const fullName=`${surname}${candidate.name}`;
  const risks=[];
  if((surnameRule.avoidFirstChars??[]).includes(candidate.name[0]))risks.push('surname-first-char');
  for(const pattern of surnameRule.avoidFullNamePatterns??[]){if(fullName===pattern||fullName.includes(pattern))risks.push('surname-pattern')}
  if(surnameRule.pinyin&&candidate.pinyin?.[0]&&stripTone(surnameRule.pinyin)===stripTone(candidate.pinyin[0]))risks.push('same-syllable');
  if(candidate.risks?.length)risks.push(...candidate.risks);
  return [...new Set(risks)]
}
