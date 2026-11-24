import {CONFIG} from './config.js';
import {resolveConfig,get,getUrl} from './api.js';
const id=new URLSearchParams(location.search).get('id'); const $=s=>document.querySelector(s);
let questions=[]; let pos=0; let selected={}; let seconds=1800; let testInfo={};
function unwrapQuestions(x){
  if(Array.isArray(x))return x;
  if(Array.isArray(x?.questions))return x.questions;
  if(Array.isArray(x?.data?.questions))return x.data.questions;
  if(Array.isArray(x?.result?.questions))return x.result.questions;
  if(Array.isArray(x?.data))return x.data;
  if(Array.isArray(x?.result))return x.result;
  return [];
}
function opts(q){
  const raw=q.options??q.option??q.opts;
  if(Array.isArray(raw))return raw;
  const out=[]; for(let i=1;i<=10;i++){const v=q[`option${i}`]??q[`option_${i}`]??q[`opt${i}`]; if(v!==undefined&&v!==null&&v!=='')out.push(v)}
  return out;
}
function render(){
  const q=questions[pos]||{}; $('#qno').textContent=`Question ${pos+1} of ${questions.length||testInfo.totalQuestions||40}`;
  $('#question').textContent=q.question??q.questionText??q.question_text??q.title??'Question data load nahi hua.';
  const arr=opts(q); $('#options').innerHTML=arr.map((o,i)=>`<div class="option ${selected[pos]===i?'selected':''}" data-i="${i}"><b>${String.fromCharCode(65+i)}</b>${typeof o==='object'?(o.text??o.value??o.label??JSON.stringify(o)):o}</div>`).join('');
  document.querySelectorAll('.option').forEach(el=>el.onclick=()=>{selected[pos]=+el.dataset.i;render()});
  $('#palette').innerHTML=questions.map((_,i)=>`<span class="num ${i===pos?'current':''}" onclick="window.goQ(${i})">${i+1}</span>`).join('');
}
window.goQ=i=>{pos=Math.max(0,Math.min(i,questions.length-1));render()};
function tick(){seconds=Math.max(0,seconds-1);$('#timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;if(seconds===0)clearInterval(window.timer)}
window.timer=setInterval(tick,1000);
$('#next').onclick=()=>{if(pos<questions.length-1){pos++;render()}};
document.querySelector('.actions button:first-child').onclick=()=>{delete selected[pos];render()};
document.querySelector('.actions button:nth-child(4)').onclick=()=>{if(pos>0){pos--;render()}};
async function init(){
  await resolveConfig();
  testInfo=JSON.parse(sessionStorage.getItem(`parmar-test-${id}`)||'{}');
  const qurl=testInfo.testQuestionsUrl||testInfo.test_questions_url;
  try{
    let d=null;
    if(qurl && /^https?:\/\//i.test(qurl)) d=await getUrl(qurl);
    if(!d) d=await get(CONFIG.endpoints.details[0],{testId:id,test_id:id});
    questions=unwrapQuestions(d);
    if(!questions.length){
      const t=await get(CONFIG.endpoints.tests[0],{testId:id,test_id:id,testid:id});
      const list=Array.isArray(t)?t:(t?.data||t?.result||t?.results||[]); const item=list.find(x=>String(x.id??x.testId??x.test_id)===String(id));
      if(item){testInfo=item; const u=item.testQuestionsUrl||item.test_questions_url; if(u)questions=unwrapQuestions(await getUrl(u))}
    }
    if(!questions.length)throw Error('No questions in response');
    const mins=Number(testInfo.timeMinutes||testInfo.time_minutes||testInfo.time||testInfo.duration||30); seconds=Math.max(60,Math.round(mins*60));
    $('#testName').textContent=testInfo.testTitle||testInfo.test_title||testInfo.title||'TEST';
    $('#marks').textContent=`+${testInfo.positiveMarks??testInfo.positive_marks??'1.00'} / -${testInfo.negativeMarks??testInfo.negative_marks??'0.33'}`;
    render(); tick();
  }catch(e){
    console.error(e);
    $('#question').textContent='Live Parmar question data load nahi hua. Test response me test_questions_url/API access verify karna baki hai.';
    $('#options').innerHTML='';
  }
}
init();
