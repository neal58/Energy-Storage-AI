import {NAME_CANDIDATES} from './data/names.js';
import {getSurnameRule} from './data/surnames.js';
import {filterCandidates} from './engine/filter.js';
import {scoreCandidate} from './engine/score.js';
import {recommendNames} from './engine/recommend.js';

const $=selector=>document.querySelector(selector);
const slotLabels={best:'最贴合',safe:'稳妥耐用',rare:'小众自然',cultural:'文化出处',modern:'现代简洁',literary:'书卷气',natural:'清朗自然',explore:'备选探索'};
let current=[];
let seed=0;
let excluded=[];

function getContext(){
  const surname=$('#surname').value.trim()||'林';
  return {
    surname,
    gender:$('#gender').value,
    style:$('#style').value,
    meaning:$('#meaning').value,
    trend:$('#trend').value,
    required:$('#required').value.trim(),
    avoid:[...$('#avoid').value.trim()],
    avoidTrend:$('#avoid-trend').checked,
    rule:getSurnameRule(surname)
  };
}

function popularityText(value){
  if(value>=5)return '较常见';
  if(value>=3)return '接受度较高';
  return '相对小众';
}

function pronunciationText(item){
  if(item.score.pronunciation>=94)return '声调起伏清楚，音节边界自然';
  if(item.score.pronunciation>=86)return '整体流畅，没有明显拗口';
  return '音律一般，建议多读几遍确认';
}

function generate(){
  const context=getContext();
  let pool=filterCandidates(NAME_CANDIDATES,{
    surname:context.surname,
    surnameRule:context.rule,
    gender:context.gender,
    requiredChar:context.required,
    avoidChars:context.avoid,
    allowPolyphonic:false
  });
  pool=pool.map(candidate=>({...candidate,score:scoreCandidate(candidate,{
    surnameTone:context.rule.tone,
    style:context.style,
    meaning:context.meaning,
    trend:context.trend,
    avoidTrend:context.avoidTrend
  })}));
  current=recommendNames(pool,{seed,excluded},8);
  $('#surname-note-title').textContent=`${context.surname}姓推荐`;
  $('#surname-note').textContent=`${context.rule.note} 已优先排除姓与名首字同音、明显谐音和生硬组合。`;
  render(context);
}

function render(context){
  $('#recommendations').innerHTML=current.length?current.map((item,index)=>`<article class="card">
    <div class="slot">${slotLabels[item.slot]}</div>
    <h3>${context.surname}${item.name}</h3>
    <p class="pinyin">${item.pinyin.join(' · ')}</p>
    <div class="tags">${item.styles.map(tag=>`<span class="tag">${tag}</span>`).join('')}${item.meanings.map(tag=>`<span class="tag">${tag}</span>`).join('')}</div>
    <p class="meaning">${item.meaningText}</p>
    <div class="facts"><b>读起来：</b>${pronunciationText(item)}。<br><b>现实使用：</b>${popularityText(item.popularity)}，成年后适用性${item.adult>=98?'很高':'较高'}。<br>${item.sourceVerified?`<span class="source"><b>可靠出处：</b>${item.source}</span>`:'<b>出处：</b>无直接可靠出处，按现代汉语语义与姓名习惯推荐。'}</div>
    <div class="actions"><button class="secondary strong" data-compare="${index}">加入对比</button><button class="secondary" data-dislike="${index}">不喜欢</button></div>
  </article>`).join(''):'<div class="panel empty">当前限制下没有足够高质量的名字，请取消指定字或减少避开字后再试。</div>';
  document.querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>addCompare(Number(button.dataset.compare))));
  document.querySelectorAll('[data-dislike]').forEach(button=>button.addEventListener('click',()=>dislike(Number(button.dataset.dislike))));
  renderCompare(context.surname);
}

function dislike(index){
  excluded.push(current[index].name);
  generate();
}

function addCompare(index){
  const item=current[index];
  const selected=JSON.parse(localStorage.getItem('haoming.compare.v3')||'[]');
  if(!selected.find(entry=>entry.name===item.name)&&selected.length<3)selected.push(item);
  localStorage.setItem('haoming.compare.v3',JSON.stringify(selected));
  renderCompare(getContext().surname);
}

function renderCompare(surname){
  const selected=JSON.parse(localStorage.getItem('haoming.compare.v3')||'[]');
  $('#compare').innerHTML=selected.length?selected.map(item=>`<div class="compare-item"><b>${surname}${item.name}</b><span>自然度：${item.natural>=97?'很高':'较高'}</span><span>音律：${item.score.pronunciation>=94?'很顺':'自然'}</span><span>语义：${item.semantic>=97?'完整清晰':'清晰'}</span><span>成长适配：${item.adult>=98?'很高':'较高'}</span></div>`).join(''):'<div class="hint">尚未选择名字。</div>';
}

$('#generate').addEventListener('click',()=>{seed=0;excluded=[];generate()});
$('#refresh').addEventListener('click',()=>{seed+=1;generate()});
$('#clear-compare').addEventListener('click',()=>{localStorage.removeItem('haoming.compare.v3');renderCompare(getContext().surname)});
generate();
