(function(){
'use strict';
const E=globalThis.HaoMingEngine;
if(!E)throw new Error('HaoMingEngine 未加载');
const $=id=>document.getElementById(id);
let batch=0;
let excluded=[];

function esc(text=''){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function readInput(){return{
 fatherSurname:$('father-surname').value.trim()||'陈',motherSurname:$('mother-surname').value.trim()||'林',surnameMode:$('surname-mode').value,
 maternalMode:$('maternal-mode').value,gender:$('gender').value,birthDate:$('birth-date').value,birthTime:$('birth-time').value,
 timezone:$('timezone').value,traditionalReference:$('traditional-reference').checked,style:$('style').value,meaning:$('meaning').value,
 requiredChar:$('required-char').value.trim(),avoidChars:$('avoid-chars').value.trim(),customTaboos:$('custom-taboos').value.trim(),
 avoidTrend:$('avoid-trend').checked,excludedNames:excluded
};}
function summary(input){
 const tags=E.profile(input);const surname=E.fullSurname(input);const maternal=input.maternalMode==='symbolic'?(E.MATERNAL[input.motherSurname]||[]):[];
 $('birth-summary').innerHTML=`<b>${esc(surname)}姓 · 本次筛选依据</b><span>审美：${esc(input.style)}</span><span>寓意：${esc(input.meaning)}</span><span>出生参考：${esc(tags.join('、')||'未启用')}</span><span>母姓纪念：${esc(maternal.join('、')||'未启用')}</span><em>名字自然度与全名读感优先，出生信息只做小幅复排。</em>`;
}
function render(){
 const input=readInput();const results=E.recommend(input,batch,6);summary(input);
 $('recommendations').innerHTML=results.length?results.map(item=>{
  const source=item.source?item.source:'无直接可靠出处，按现代汉语语义和现实姓名习惯推荐。';
  const evidence=[item.styles.includes(input.style)?`符合“${input.style}”`:item.styles[0],item.meanings.includes(input.meaning)?`侧重${input.meaning}`:'语义完整',item.birthHit.length?`呼应${item.birthHit.join('、')}`:'出生信息未强行干预',item.maternalHit.length?`呼应母姓意象${item.maternalHit.join('、')}`:''].filter(Boolean);
  return `<article><div class="category">${esc(item.category)}</div><h2>${esc(item.fullName)}</h2><div class="pinyin">${esc(item.pinyin)}</div><p class="meaning">${esc(item.meaningText)}</p><div class="reason-tags">${evidence.map(x=>`<span>${esc(x)}</span>`).join('')}</div><dl><dt>全名读感</dt><dd>${item.sound.warnings.length?`整体可读；需留意：${esc(item.sound.warnings.join('、'))}`:'声调有起伏，连读自然，没有明显同音硬伤。'}</dd><dt>文化出处</dt><dd>${esc(source)}</dd></dl><div class="actions"><button class="minor dislike" data-name="${esc(item.name)}">不喜欢这个名字</button></div></article>`;
 }).join(''):'<div class="empty">当前条件下没有达到自然度门槛的名字。可以取消指定字、减少避讳字，或换一种审美方向。</div>';
 document.querySelectorAll('.dislike').forEach(btn=>btn.addEventListener('click',()=>{excluded=[...new Set([...excluded,btn.dataset.name])];batch=0;render();}));
}
$('generate').addEventListener('click',()=>{batch=0;excluded=[];render();});
$('refresh').addEventListener('click',()=>{batch+=1;render();});
$('surname-mode').addEventListener('change',event=>{if(event.target.value==='double')$('name-length-note').textContent='双姓已较长，建议优先使用单字名；本版仍生成双字名供比较。';else $('name-length-note').textContent='';});
render();
})();
