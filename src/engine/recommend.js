const slotMatchers={
best:()=>true,
safe:c=>c.popularity>=3&&c.natural>=96,
rare:c=>c.popularity<=2&&c.natural>=92,
cultural:c=>c.sourceVerified===true,
modern:c=>c.styles.includes('现代')||c.styles.includes('简洁'),
literary:c=>c.styles.includes('书卷')||c.styles.includes('古典'),
natural:c=>c.styles.includes('清朗')||c.styles.includes('自然'),
explore:()=>true
};
export function recommendNames(candidates,context={},limit=8){
  let sorted=[...candidates].filter(item=>!(context.excluded??[]).includes(item.name)).sort((a,b)=>(b.score?.total??0)-(a.score?.total??0)||(b.natural??0)-(a.natural??0));
  if(context.seed&&sorted.length>5){const head=sorted.slice(0,3),rest=sorted.slice(3),shift=context.seed%rest.length;sorted=[...head,...rest.slice(shift),...rest.slice(0,shift)]}
  const slots=['best','safe','rare','cultural','modern','literary','natural','explore'].slice(0,limit);
  const used=new Set(),firstChars=new Set(),result=[];
  for(const slot of slots){
    let candidate=sorted.find(item=>!used.has(item.name)&&slotMatchers[slot](item)&&!firstChars.has(item.name[0]));
    if(!candidate)candidate=sorted.find(item=>!used.has(item.name)&&slotMatchers[slot](item));
    if(!candidate)candidate=sorted.find(item=>!used.has(item.name));
    if(!candidate)break;
    used.add(candidate.name);firstChars.add(candidate.name[0]);result.push({...candidate,slot});
  }
  return result;
}
