import {CONFIG} from './config.js';

let apiBase=CONFIG.fallbackApiBase;
let apiMeta={};
let resolvedConfig=null;

const norm=v=>String(v??'').toLowerCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&String(x)!=='');

function findParmar(obj){
  if(!obj||typeof obj!=='object') return null;
  if(Array.isArray(obj)){
    for(const x of obj){const r=findParmar(x);if(r)return r;}
    return null;
  }
  const name=norm(first(obj.name,obj.title,obj.instituteName,obj.appName,obj.institute,obj.clientName));
  const url=first(obj.apiUrl,obj.apiURL,obj.baseUrl,obj.baseURL,obj.api_url,obj.url);
  if(name.includes('parmar') && url) return obj;
  for(const v of Object.values(obj)){const r=findParmar(v);if(r)return r;}
  return null;
}

function extractMeta(obj){
  const out={};
  const keys=['authKey','auth_key','authToken','auth_token','clientService','client_service','deviceType','device_type','userId','user_id','userid','userEmail','useremail'];
  const walk=x=>{
    if(!x||typeof x!=='object') return;
    if(Array.isArray(x)){x.forEach(walk);return;}
    for(const k of keys){if(out[k]===undefined && x[k]!==undefined) out[k]=x[k];}
    for(const v of Object.values(x)) walk(v);
  };
  walk(obj);
  return out;
}

export async function resolveConfig(){
  try{
    const r=await fetch(CONFIG.appConfigUrl,{cache:'no-store'});
    if(!r.ok) throw Error(`config ${r.status}`);
    const data=await r.json();
    const p=findParmar(data);
    resolvedConfig={data,parmar:p};
    if(p){
      const url=first(p.apiUrl,p.apiURL,p.baseUrl,p.baseURL,p.api_url,p.url);
      if(url) apiBase=String(url).replace(/\/$/,'')+'/';
      apiMeta=extractMeta(p);
    } else {
      apiMeta=extractMeta(data);
    }
    return {data,parmar:p,apiBase,apiMeta};
  }catch(e){
    console.warn('Parmar config load failed; using APK fallback API',e);
    return {data:null,parmar:null,apiBase,apiMeta};
  }
}

export function getApiBase(){return apiBase}
export function getApiMeta(){return apiMeta}
export function getResolvedConfig(){return resolvedConfig}

function headers(){
  const h={'Accept':'application/json, text/plain, */*'};
  const map={
    'authKey':'Auth-Key',
    'auth_key':'Auth-Key',
    'clientService':'Client-Service',
    'client_service':'Client-Service',
    'deviceType':'Device-Type',
    'device_type':'Device-Type',
    'userId':'User-ID',
    'user_id':'User-ID'
  };
  for(const [k,v] of Object.entries(apiMeta)){
    if(v!==undefined&&v!==null&&String(v)!=='') h[map[k]||k]=String(v);
  }
  if(apiMeta.authToken||apiMeta.auth_token) h.Authorization=`Bearer ${apiMeta.authToken||apiMeta.auth_token}`;
  return h;
}

export async function get(path,params={}){
  const u=new URL(path,apiBase);
  for(const [k,v] of Object.entries(params)) if(v!==undefined&&v!==null&&v!=='') u.searchParams.set(k,v);
  const r=await fetch(u.toString(),{headers:headers(),cache:'no-store'});
  const text=await r.text();
  let data;
  try{data=JSON.parse(text)}catch{data=text}
  if(!r.ok) throw Object.assign(Error(`${r.status} ${u.pathname}`),{status:r.status,data});
  return data;
}

export async function getUrl(url){
  const r=await fetch(url,{headers:headers(),cache:'no-store'});
  const text=await r.text();
  let data;try{data=JSON.parse(text)}catch{data=text}
  if(!r.ok) throw Object.assign(Error(`${r.status} ${url}`),{status:r.status,data});
  return data;
}
