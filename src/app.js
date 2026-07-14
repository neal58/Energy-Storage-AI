import { NAME_CANDIDATES } from './data/names.js';
import { getSurnameRule } from './data/surnames.js';
import { filterCandidates } from './engine/filter.js';
import { scoreCandidate } from './engine/score.js';
import { recommendNames } from './engine/recommend.js';

const $=s=>document.querySelector(s);
const slotLabels={best:'最贴合',safe:'稳妥型',rare:'小众型',cultural:'文化型',modern:'现代型',explore:'探索型'};
let current=[];

function getContext(){
  const surname=$('#surname').value.trim()||'林';
  const gender=$('#gender').value;
  const style=$('#style').value;
  const meaning=$('#meaning').value;
  const avoid=[...$('#avoid').value.trim()];
  const required=$('#required').value.trim();
  const rule=getSurnameRule(surname);
  return {surname,gender,style,meaning,avoid,required,rule};
}

function generate(){
  const c=getContext();
  let pool=filterCandidates(NAME_CANDIDATES,{surname:c.surname,surnameRule:c.rule,avoidChars:c.avoid,allowPolyphonic:false});
  pool=pool.filter(x=>(c.gender==='neutral'||x.gender==='neutral'||x.gender===c.gender)&&(!c.required||x.chars.includes(c.required)));
  pool=pool.map(x=>({...x,score:scoreCandidate(x,{surnameTone:c.rule.tone,preferredTonePatterns:c.rule.preferredTonePatterns,stylePreferences:{[c.style]:2},meaningPreferences:{[c.meaning]:2}})}));
  current=recommendNames(pool,{},6);
  $('#surname-note').textContent=`${c.surname}姓分析：${c.rule.note}`;
  render();
}

function render(){
  const surname=$('#surname').value.trim()||'林';
  $('#recommendations').innerHTML=current.length?current.map((x,i)=>`<article class="card"><div class="slot">${slotLabels[x.slot]}</div><div class="score">${x.score.total}</div><h3>${surname}${x.name}</h3><p class="pinyin">${x.pinyin.join(' · ')}</p><div>${x.styles.map(t=>`<span class="tag">${t}</span>`).join('')}${x.meanings.map(t=>`<span class="tag">${t}</span>`).join('')}</div><p>自然度 ${x.score.naturalness} · 音律 ${x.score.pronunciation} · 语义 ${x.score.semantics}</p><p>${x.source?`出处：${x.source}`:'无可靠出处，按语言与审美规则推荐。'}</p><button class="secondary" onclick="window.addCompare(${i})">加入对比</button></article>`).join(''):'<div class="empty">当前条件下没有足够高质量的名字，请减少限制。</div>';
}
window.addCompare=i=>{const item=current[i];const selected=JSON.parse(localStorage.getItem('haoming.compare')||'[]');if(!selected.find(x=>x.name===item.name)&&selected.length<3)selected.push(item);localStorage.setItem('haoming.compare',JSON.stringify(selected));renderCompare()};
function renderCompare(){const surname=$('#surname').value.trim()||'林';const selected=JSON.parse(localStorage.getItem('haoming.compare')||'[]');$('#compare').innerHTML=selected.length?selected.map(x=>`<div class="compare-item"><b>${surname}${x.name}</b><span>总分 ${x.score.total}</span><span>自然度 ${x.score.naturalness}</span><span>音律 ${x.score.pronunciation}</span><span>成长适配 ${x.score.growthFit}</span></div>`).join(''):'尚未选择名字。'}
$('#generate').addEventListener('click',generate);$('#clear-compare').addEventListener('click',()=>{localStorage.removeItem('haoming.compare');renderCompare()});generate();renderCompare();
