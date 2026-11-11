// Standalone mode: no Claude runtime. The user brings an API key or a local model.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const EXTRACT={profile:{name:'Sample Person'},roles:[{company:'Acme',title:'Manager',start:'Jan 2020',end:'Present'}],facts:[{kind:'achievement',text:'Signed 12 partners',company:'Acme',title:'Manager'}]};
function sse(chunks){let i=0;const enc=new TextEncoder();return{getReader:()=>({read:async()=>i<chunks.length?{done:false,value:enc.encode(chunks[i++])}:{done:true}})}}
function mk(fetchImpl,{idb=false}={}){const calls=[];const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;w.URL.createObjectURL=()=>'blob:x';w.URL.revokeObjectURL=()=>{};
  if(idb){const f=require('fake-indexeddb');w.indexedDB=new f.IDBFactory();w.structuredClone=w.structuredClone||(o=>JSON.parse(JSON.stringify(o)))}
  w.fetch=async(u,o)=>{calls.push({u,o});return fetchImpl(u,o,calls)}}});return{w:dom.window,d:dom.window.document,calls}}
const ok=(cond,msg)=>{console.log((cond?'PASS ':'FAIL ')+msg);if(!cond)process.exitCode=1};
(async()=>{
 // 1. Anthropic format, streamed
 let {w,d,calls}=mk(async(u,o)=>{if(u.endsWith('/models'))return{ok:true,json:async()=>({data:[{id:'model-b'},{id:'model-a'}]})};
   const j=JSON.stringify(EXTRACT),a=j.slice(0,40),b=j.slice(40);
   return{ok:true,headers:{get:()=>'text/event-stream'},body:sse(['event: content_block_delta\ndata: '+JSON.stringify({type:'content_block_delta',delta:{type:'text_delta',text:a}})+'\n\nevent: content_bl','ock_delta\ndata: '+JSON.stringify({type:'content_block_delta',delta:{type:'text_delta',text:b}})+'\n\ndata: '+JSON.stringify({type:'message_delta',delta:{stop_reason:'end_turn'}})+'\n\n'])}});
 await wait(300);let R=w.__re;const click=(doc,sel)=>doc.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const set=(win,sel,v,ev)=>{const el=win.document.querySelector(sel);el.value=v;el.dispatchEvent(new win.Event(ev||'change',{bubbles:true}))};
 ok(!R.IN_CLAUDE&&!R.AI.ready(),'starts with no engine configured and nothing built in');
 ok(!!d.querySelector('.banner [data-id=data]'),'Sources tab asks the user to choose an engine');
 w.location.hash='data';await wait(30);R.render();set(w,'#aiPreset','anthropic');set(w,'#aiKey','test-key-abcd1234');
 click(d,'[data-act=loadModels]');await wait(100);ok(R.AI.models.join()==='model-a,model-b','models are loaded from the provider, not baked in');
 set(w,'#aiModel','model-a');ok(R.AI.ready(),'engine ready after address, model and key');
 ok(!d.documentElement.innerHTML.includes('test-key-abcd1234')&&d.querySelector('#aiKey').placeholder.includes('1234'),'key is not echoed into the page, only its last 4 characters');
 w.location.hash='sources';await wait(30);R.render();set(w,'#srcText','Resume text long enough to be accepted as a source for testing.','input');click(d,'[data-act=addSource]');await wait(200);
 const call=calls.find(c=>c.u.endsWith('/messages'));
 ok(call&&call.u==='https://api.anthropic.com/v1/messages','calls the Anthropic messages address');
 ok(call.o.headers['x-api-key']==='test-key-abcd1234'&&call.o.headers['anthropic-dangerous-direct-browser-access']==='true'&&call.o.headers['anthropic-version']==='2023-06-01','sends Anthropic headers with the user key');
 ok(JSON.parse(call.o.body).model==='model-a','uses the model the user picked');
 ok(R.S.facts.length===1&&R.S.profile.name==='Sample Person','streamed answer split across chunks is parsed into facts');
 const snap=JSON.stringify(R.snapshot());w.location.hash='data';await wait(30);R.render();
 ok(!snap.includes('test-key')&&!R.reportText().includes('test-key')&&R.reportText().includes('api.anthropic.com'),'key is absent from backups and problem reports');
 ok(JSON.parse(w.localStorage.getItem('resume-engine-ai')).key==='test-key-abcd1234','remembered key is kept in this browser');
 set(w,'#aiRemember','x');d.querySelector('#aiRemember').checked=false;d.querySelector('#aiRemember').dispatchEvent(new w.Event('change',{bubbles:true}));
 ok(JSON.parse(w.localStorage.getItem('resume-engine-ai')).key===''&&w.sessionStorage.getItem('resume-engine-key')==='test-key-abcd1234','with remember off the key lives only for the session');
 w.close();
 // 2. OpenAI-compatible local server, not streamed, reasoning tags and code fence, no key
 ({w,d,calls}=mk(async()=>({ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:'<think>working</think>Here you go:\n```json\n'+JSON.stringify(EXTRACT)+'\n```'},finish_reason:'stop'}]})})));
 await wait(300);R=w.__re;w.location.hash='data';await wait(30);R.render();set(w,'#aiPreset','ollama');set(w,'#aiModel','local-model');
 w.location.hash='sources';await wait(30);R.render();set(w,'#srcText','Resume text long enough to be accepted as a source for testing.','input');w.document.querySelector('[data-act=addSource]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(200);
 ok(calls[0].u==='http://localhost:11434/v1/chat/completions'&&!('authorization' in calls[0].o.headers),'local model: OpenAI-compatible address, no key sent');
 ok(R.S.facts.length===1,'local model answer with reasoning tags and a code fence is parsed');w.close();
 // 3. errors
 ({w,d,calls}=mk(async()=>({ok:false,status:401,json:async()=>({error:{message:'invalid x-api-key'}})})));await wait(300);R=w.__re;R.AI.cfg.baseUrl='https://api.example/v1';R.AI.cfg.model='m';R.AI.key='bad';w.location.hash='data';await wait(30);R.render();
 w.document.querySelector('[data-act=testAI]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(100);ok(w.document.querySelector('#toast').textContent.includes('rejected the API key'),'401 is explained as a rejected key');w.close();
 ({w,d,calls}=mk(async()=>{throw new TypeError('Failed to fetch')}));await wait(300);R=w.__re;R.AI.cfg.baseUrl='http://localhost:1234/v1';R.AI.cfg.model='m';w.location.hash='data';await wait(30);R.render();
 w.document.querySelector('[data-act=testAI]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(100);ok(w.document.querySelector('#toast').textContent.includes('Could not reach the AI server'),'unreachable server is explained');w.close();
 // 4. IndexedDB persistence and native download
 ({w,d}=mk(async()=>({ok:false,status:500,json:async()=>({})}),{idb:true}));await wait(300);R=w.__re;R.S.memory.push({id:'m1',text:'kept'});R.Store.state('memory');await wait(100);
 ok((await R.Local.get()).memory[0].text==='kept'&&!w.localStorage.getItem('resume-engine'),'data persists in IndexedDB when available');
 let clicked='';w.HTMLAnchorElement.prototype.click=function(){clicked=this.download};w.location.hash='data';await wait(30);R.render();w.document.querySelector('[data-act=exportBackup]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(100);
 ok(clicked.startsWith('resume-engine-backup-'),'downloads work without the Claude runtime');w.close();
 ok(!/sk-ant|sk-proj|Bearer [A-Za-z0-9]{20}/.test(html),'no credential-shaped strings in the source');
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
