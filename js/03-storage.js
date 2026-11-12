"use strict";
/* ---------- storage: artifact database, browser storage as fallback ---------- */
const DATA_KEYS=['profile','roles','facts','memory','sources','jobs','resumes'];
/* Saved data and backups are untrusted input: a crafted backup must not be able to inject markup. Ids go into HTML attributes, so any id
   that is not plain is replaced (consistently, so links between items survive); fields the page prints as numbers are forced to numbers. */
const SAFE_ID=/^[A-Za-z0-9_.:-]{1,80}$/;
function cleanData(o){const map={},fix=v=>typeof v!=='string'||v===''||SAFE_ID.test(v)?v:(map[v]=map[v]||uid('x')),NUM={strength:1,was:1,n:1,factCount:1},IDK={id:1,roleId:1,jobId:1,src:1,upTo:1};
 const walk=x=>{if(Array.isArray(x)){for(const y of x)walk(y);return}if(!x||typeof x!=='object')return;for(const k of Object.keys(x)){const v=x[k];if(k==='__proto__'||k==='constructor'||k==='prototype'){delete x[k];continue}if(IDK[k])x[k]=fix(v);else if(NUM[k]&&v!=null)x[k]=Number(v)||0;else if((k==='facts'||k==='wins'||k==='themes')&&Array.isArray(v)&&v.every(y=>typeof y==='string'))x[k]=k==='themes'?v.map(y=>y.slice(0,40)):v.map(fix);else if(k==='tpl'&&!(typeof v==='string'&&Object.prototype.hasOwnProperty.call(TPL,v)))delete x[k];else walk(v)}};
 for(const k of DATA_KEYS)walk(o[k]);return o}
const isEmpty=o=>!o.sources.length&&!o.facts.length&&!o.jobs.length&&!o.roles.length;
const Local={h:null,
 open(){if(this.h===null)this.h=new Promise(res=>{try{const r=indexedDB.open('resume-engine',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>res(false)}catch(e){res(false)}});return this.h},
 async get(key){key=key||'state';const d=await this.open();if(d){const v=await new Promise(res=>{try{const q=d.transaction('kv').objectStore('kv').get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)}catch(e){res(null)}});if(v)return v}if(key!=='state')return null;try{const raw=localStorage.getItem('resume-engine');return raw?JSON.parse(raw):null}catch(e){return null}},
 async set(o,key){key=key||'state';const d=await this.open();if(d){const ok=await new Promise(res=>{try{const tx=d.transaction('kv','readwrite');tx.objectStore('kv').put(o,key);tx.oncomplete=()=>res(true);tx.onerror=tx.onabort=()=>res(false)}catch(e){res(false)}});if(ok)return true}if(key!=='state')return false;try{localStorage.setItem('resume-engine',JSON.stringify(o));return true}catch(e){return false}}};
const Store={db:null,uid:null,owner:false,mode:'local',pending:{},running:{},inboxed:0,
 async init(){try{if(window.claude&&claude.use){const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);this.db=db;if(user){this.uid=await user.id();this.owner=!!(await user.isOwner())}}}catch(e){}await this.load()},
 P(k){return 'data/users/'+this.uid+'/'+k},
 async readSet(doc,col){const [p,r,f,m,so,jo,re]=await Promise.all([doc('profile').get(),doc('roles').get(),doc('facts').get(),doc('memory').get(),col('sources').limit(300).get(),col('jobs').limit(500).get(),col('resumes').limit(500).get()]);const items=q=>q.docs.map(d=>Object.assign(clone(d.data()),{id:d.id}));return{profile:p.exists?clone(p.data()):{},roles:r.exists?clone(r.data().items)||[]:[],facts:f.exists?clone(f.data().items)||[]:[],memory:m.exists?clone(m.data().items)||[]:[],sources:items(so),jobs:items(jo),resumes:items(re)}},
 async load(){this.mode='local';
  if(this.db&&this.uid){try{const db=this.db,lib=db.doc(this.P('lib'));const timeout=new Promise((_,rej)=>setTimeout(()=>rej({code:'timeout'}),10000));
    const [mine,meta]=await Promise.race([Promise.all([this.readSet(k=>db.doc(this.P(k)),c=>lib.collection(c)),db.doc(this.P('meta')).get()]),timeout]);
    let ok=meta.exists;if(!ok){try{await db.doc(this.P('meta')).set({v:2,createdAt:Date.now()});ok=true}catch(e){ok=false}}
    if(ok){this.mode='cloud';Object.assign(S,mine);cleanData(S);
     if(this.owner){
      if(isEmpty(mine)){try{const old=await this.readSet(k=>db.doc('state/'+k),c=>db.collection(c));if(!isEmpty(old)){Object.assign(S,old);cleanData(S);this.saveAll()}}catch(e){}}
      try{const ib=await db.collection('inbox').limit(50).get();for(const d of ib.docs){const x=clone(d.data());if(x.kind==='job'&&x.jdText){const it={id:uid('j'),url:x.url||'',company:x.company||'',title:x.title||'',jdText:String(x.jdText).slice(0,60000),status:'Saved',addedAt:Date.now()};S.jobs.push(it);this.item('jobs',it);this.inboxed++}else if(x.kind==='source'&&x.text){const it={id:uid('s'),type:x.type||'other',title:x.title||'Loaded by Claude',text:String(x.text).slice(0,150000),addedAt:Date.now(),trusted:false};S.sources.push(it);this.item('sources',it);this.inboxed++}this.write('inbox/'+d.id,()=>null)}}catch(e){}}
     return}
   }catch(e){this.mode='local'}}
  const o=await Local.get();if(o){for(const k of DATA_KEYS)if(o[k])S[k]=o[k];cleanData(S)}},
 write(path,get){if(this.mode!=='cloud')path='local';this.pending[path]=get;if(this.running[path])return;this.running[path]=true;(async()=>{while(this.pending[path]){const g=this.pending[path];delete this.pending[path];try{await this.put(path,g())}catch(e){toast(e&&e.code==='quota_exceeded'?'Storage is full. Delete old sources or versions.':'Could not save. Your change is still on screen; try again.','bad')}}this.running[path]=false})()},
 async put(path,data){if(this.mode==='cloud'){const ref=this.db.doc(path);if(data===null)await ref.delete();else await ref.set(data)}else if(!(await Local.set(clone(snapshot()))))toast('This browser blocked saving. Download a backup from the Setup tab.','bad')},
 state(k){this.write(this.P(k),()=>k==='profile'?clone(S.profile):{items:clone(S[k])})},
 item(coll,it){this.write(this.P('lib')+'/'+coll+'/'+it.id,()=>{const o=clone(it);delete o.id;return o})},
 remove(coll,id){this.write(this.P('lib')+'/'+coll+'/'+id,()=>null)},
 saveAll(){for(const k of ['profile','roles','facts','memory'])this.state(k);for(const c of ['sources','jobs','resumes'])for(const it of S[c])if(it&&it.id)this.item(c,it)},
 replaceAll(o){for(const c of ['sources','jobs','resumes'])for(const it of (Array.isArray(S[c])?S[c]:[]))if(it&&it.id)this.remove(c,it.id);S.profile=o.profile||{};for(const k of ['roles','facts','memory','sources','jobs','resumes'])S[k]=Array.isArray(o[k])?o[k]:[];cleanData(S);this.saveAll()}
};
function snapshot(){const o={};for(const k of DATA_KEYS)o[k]=S[k];return o}
