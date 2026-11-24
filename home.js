import {CONFIG} from './config.js';
import {resolveConfig,get,getApiBase} from './api.js';
const $=s=>document.querySelector(s); let all=[];
function unwrap(x){return Array.isArray(x)?x:(x?.data||x?.result||x?.results||x?.test_series||x?.testSeries||x?.list||[])}
function pick(x,...keys){for(const k of keys)if(x?.[k]!==undefined&&x?.[k]!==null&&x?.[k]!=='')return x[k];return ''}
function render(list){
  $('#series').innerHTML=list.map(x=>{
    const id=pick(x,'id','testseries_id','testSeriesId','test_series_id','testseriesid');
    const title=pick(x,'title','name','test_series_name')||'Parmar Test Series';
    const price=pick(x,'price','offerPrice','offer_price','amount');
    const tests=pick(x,'tests','total_tests','test_count','totalQuestions');
    const validity=pick(x,'validity','duration','extendedValidity');
    const image=pick(x,'imageUrl','image_url','logoUrl','logo','banner');
    return `<article class="card">${image?`<img class="coverimg" src="${String(image).replace(/"/g,'&quot;')}" alt="">`:`<div class="cover">${title}</div>`}<div class="cardbody"><h2>${title}</h2><div class="meta"><span>📝 ${tests||'—'} Tests</span><span>⌛ ${validity||'—'}</span>${price!==''?`<span class="price">₹${price}</span>`:''}</div><button class="open" data-id="${id}">Open Test Series</button></div></article>`
  }).join('')||'<div class="status">No Parmar test series found from the API.</div>';
  document.querySelectorAll('.open').forEach(b=>b.onclick=()=>location.href=`series.html?id=${encodeURIComponent(b.dataset.id)}`)
}
async function init(){
  const r=await resolveConfig();
  $('#status').textContent=`Parmar API: ${getApiBase()}`;
  try{
    const data=await get(CONFIG.endpoints.series[0]);
    all=unwrap(data);
    // If the API returns multiple institutes, retain Parmar records only.
    const filtered=all.filter(x=>/parmar/i.test(JSON.stringify(x)) || r.parmar);
    render(filtered.length?filtered:all);
  }catch(e){
    $('#status').textContent='Live API load nahi hua. Browser console me exact API error dekho.';
    console.error(e);
  }
}
$('#search').oninput=e=>{const q=e.target.value.toLowerCase();render(all.filter(x=>JSON.stringify(x).toLowerCase().includes(q)))};
init();
