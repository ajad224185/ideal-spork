import {CONFIG} from './config.js';
import {resolveConfig,get} from './api.js';
const id=new URLSearchParams(location.search).get('id'); const $=s=>document.querySelector(s); let all=[];
function unwrap(x){return Array.isArray(x)?x:(x?.data||x?.result||x?.results||x?.tests||x?.test_titles||x?.testTitles||x?.list||[])}
function pick(x,...keys){for(const k of keys)if(x?.[k]!==undefined&&x?.[k]!==null&&x?.[k]!=='')return x[k];return ''}
function title(x){return pick(x,'title','name','test_title','testTitle')||'Mock Test'}
function render(list){
  $('#count').textContent=`${list.length} Tests`;
  $('#tests').innerHTML=list.map((x,i)=>{
    const tid=pick(x,'id','testId','test_id','testid');
    const q=pick(x,'questions','totalQuestions','total_questions','total_qs','question_count');
    const marks=pick(x,'marks','totalMarks','total_marks');
    const mins=pick(x,'duration','time','timeMinutes','time_minutes','minutes');
    const paid=pick(x,'is_paid','isPaid','paid','paidtest');
    const url=pick(x,'testQuestionsUrl','test_questions_url');
    sessionStorage.setItem(`parmar-test-${tid}`,JSON.stringify(x));
    return `<article class="testcard"><span class="pill">${paid?'PAID':''}</span><h3>${title(x)}</h3><div class="testmeta">${q||'—'} Qs • ${marks||'—'} Marks • ${mins||'—'} Mins</div><button class="start" data-id="${tid}">Start Test</button><div class="testurl">${url?'Questions URL available':''}</div><div style="clear:both"></div></article>`
  }).join('')||'<div class="status">No tests found.</div>';
  document.querySelectorAll('.start').forEach(b=>b.onclick=()=>location.href=`test.html?id=${encodeURIComponent(b.dataset.id)}`)
}
async function init(){
  await resolveConfig();
  try{
    const d=await get(CONFIG.endpoints.tests[0],{test_series_id:id,testSeriesId:id,testseriesid:id,testseries_id:id});
    all=unwrap(d); render(all);
  }catch(e){$('#tests').innerHTML='<div class="status">Test list API response nahi mila. Console me exact response dekho.</div>';console.error(e)}
}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const t=b.dataset.tab;render(t==='all'?all:all.filter(x=>{const s=JSON.stringify(x).toLowerCase();return s.includes(t==='sectional'?'sectional':'full')}))});
init();
