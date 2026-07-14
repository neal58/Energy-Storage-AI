(function(){
'use strict';
const E=globalThis.HaoMingBookEngine;
if(!E)throw new Error('书籍研究版取名引擎未加载');
const $=id=>document.getElementById(id);
let batch=0;
let excluded=[];
let feedback={};

function esc(text=''){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function readInput(){return{
 fatherSurname:$('father-surname').value.trim()||'陈',motherSurname:$('mother-surname').value.trim()||'林',surnameMode:$('surname-mode').value,
 maternalMode:$('maternal-mode').value,gender:$('gender').value,generationChar:$('generation-char').value.trim(),generationPosition:$('generation-position').value,
 elderTabooChars:$('elder-taboo-chars').value.trim(),namingMethod:$('naming-method').value,familyWish:$('family-wish').value.trim(),
 birthDate:$('birth-date').value,birthTime:$('birth-time').value,timezone:$('timezone').value,traditionalReference:$('traditional-reference').checked,
 style:$('style').value,meaning:$('meaning').value,requiredChar:$('required-char').value.trim(),avoidChars:$('avoid-chars').value.trim(),
 customTaboos:$('custom-taboos').value.trim(),avoidTrend:$('avoid-trend').checked,excludedNames:excluded,feedback
};}

function renderSummary(input){
 const tags=E.birthTags(input);const surname=E.fullSurname(input);const method=E.METHODS[input.namingMethod];
 $('naming-brief').innerHTML=`<div class="brief-label">本次命名立意</div><p>${esc(E.buildNamingBrief(input))}</p>`;
 $('birth-summary').innerHTML=`<b>${esc(surname)}姓</b><span>${esc(method.label)}</span><span>审美：${esc(input.style)}</span><span>核心寓意：${esc(input.meaning)}</span><span>出生纪念：${esc(tags.join('、')||'未启用')}</span><em>出生信息仅作纪念性参考，名字自然度、完整语义与全名读感优先。</em>`;
}

function feedbackButtons(item){
 return `<div class="actions"><button class="minor dislike" data-name="${esc(item.name)}">不喜欢这个名字</button><button class="minor preference" data-feedback="tooAncient">太古风</button><button class="minor preference" data-feedback="tooCommon">太普通</button><button class="minor preference" data-feedback="tooSoft">太柔</button><button class="minor preference" data-feedback="tooHard">太硬</button></div>`;
}

function render(){
 const input=readInput();const results=E.recommend(input,batch,6);renderSummary(input);
 $('recommendations').innerHTML=results.length?results.map(item=>{
  const source=item.sourceType==='direct'?`直接出处：${item.source}`:'现代语义：无直接可靠出处，按完整语义与现实姓名习惯推荐。';
  const evidence=[item.routeLabel,item.styles.includes(input.style)?`符合“${input.style}”`:item.styles[0],item.meanings.includes(input.meaning)?`侧重${input.meaning}`:'语义完整',item.birthHit.length?`出生呼应：${item.birthHit.join('、')}`:'',item.maternalHit.length?`家庭呼应：${item.maternalHit.join('、')}`:''].filter(Boolean);
  const sound=item.sound.warnings.length?`整体可读；需留意：${item.sound.warnings.join('、')}`:'声调有起伏，连读自然，没有明显同音硬伤。';
  return `<article><div class="card-top"><div><div class="category">${esc(item.publicLevel)} · ${esc(item.routeLabel)}</div><h2>${esc(item.fullName)}</h2><div class="pinyin">${esc(item.pinyin)}</div></div><span class="route-mark">${esc(item.route)}</span></div><p class="meaning">${esc(item.meaningText)}</p><div class="reason-tags">${evidence.map(x=>`<span>${esc(x)}</span>`).join('')}</div><dl><dt>命名依据</dt><dd>${esc(item.routeReason)}</dd><dt>全名读感</dt><dd>${esc(sound)}</dd><dt>出处等级</dt><dd>${esc(source)}</dd></dl>${feedbackButtons(item)}</article>`;
 }).join(''):'<div class="empty">当前条件下没有达到自然度和语义门槛的名字。可以放宽辈分字位置、减少避讳字，或切换另一种命名方法；系统不会用生硬组合凑数。</div>';
 document.querySelectorAll('.dislike').forEach(btn=>btn.addEventListener('click',()=>{excluded=[...new Set([...excluded,btn.dataset.name])];batch=0;render();}));
 document.querySelectorAll('.preference').forEach(btn=>btn.addEventListener('click',()=>{feedback={...feedback,[btn.dataset.feedback]:true};batch=0;render();}));
}

$('generate').addEventListener('click',()=>{batch=0;excluded=[];feedback={};render();});
$('refresh').addEventListener('click',()=>{batch+=1;render();});
$('surname-mode').addEventListener('change',event=>{if(event.target.value==='double')$('name-length-note').textContent='双姓已经较长，实际登记前建议重点复核全名长度与连读。';else $('name-length-note').textContent='';});
$('naming-method').addEventListener('change',()=>{batch=0;render();});
render();
})();
