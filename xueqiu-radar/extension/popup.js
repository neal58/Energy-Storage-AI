const API='https://hbioiasauagkjcqmwqlw.supabase.co/functions/v1/xueqiu-radar-api';
const WEB='https://raw.githack.com/neal58/Energy-Storage-AI/feature/xueqiu-radar-web/xueqiu-radar/index.html';
const result=document.querySelector('#result');
function show(text,type=''){result.textContent=text;result.className='result '+type}
async function activeTab(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab}
document.querySelector('#open').onclick=()=>chrome.tabs.create({url:WEB});
document.querySelector('#scan').onclick=async()=>{
  try{
    show('正在读取当前页面…');
    const tab=await activeTab();
    if(!tab?.id||!/^https:\/\/(?:[^/]+\.)?xueqiu\.com\//.test(tab.url||''))throw new Error('请先打开已登录的雪球页面');
    let data;
    try{data=await chrome.tabs.sendMessage(tab.id,{type:'SCAN_XUEQIU'})}catch{throw new Error('扩展尚未注入当前页面，请刷新雪球页面后重试')}
    if(data?.error)throw new Error(data.error);
    const rawUsers=Array.isArray(data?.users)?data.users:[];
    const users=rawUsers.filter(x=>Number(x.followers_count)>=10000);
    const allowed=new Set(users.map(x=>String(x.xueqiu_user_id)));
    const posts=(Array.isArray(data?.posts)?data.posts:[]).filter(x=>allowed.has(String(x.xueqiu_user_id)));
    show(`页面识别：${rawUsers.length}人、${data?.posts?.length||0}条动态\n符合大V门槛：${users.length}人\n正在同步…`);
    const response=await fetch(API+'/ingest',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({users,posts,page:data.page})});
    const payload=await response.json();
    if(!response.ok)throw new Error(payload.error||'同步失败');
    show(`同步完成\n大V：${payload.accepted_users}\n真实动态：${payload.accepted_posts}\n未达到1万粉丝或数据不全：${payload.skipped_users}`,'ok');
  }catch(e){show(e.message||String(e),'err')}
};