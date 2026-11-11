// Repair system: a failed step is explained, a fix is proposed, and nothing changes until the user approves.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const GOOD={profile:{name:'Sample Person'},roles:[{company:'Acme',title:'Manager',start:'Jan 2020',end:'Present'}],facts:[{kind:'achievement',text:'Signed 12 partners',company:'Acme',title:'Manager'}]};
const reply=(content,finish)=>({ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content},finish_reason:finish||'stop'}]})});
function mk(fetchImpl){const calls=[];const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;w.fetch=async(u,o)=>{const body=o&&o.body?JSON.parse(o.body):{};calls.push(body);return fetchImpl(body,calls)}}});
 const w=dom.window,d=w.document;return{w,d,calls,R:null,
  click:sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))},
  type:(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))}}}
async function ready(t){await wait(300);t.R=t.w.__re;t.R.AI.cfg.baseUrl='http://localhost:1234/v1';t.R.AI.cfg.model='m';t.R.render();return t}
const src='Resume text long enough to be accepted as a source for testing the repair flow.';
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const prompt=b=>(b.messages&&b.messages[0].content)||'';
(async()=>{
 // 1. trailing comma: fixed silently, no panel, no extra request
 let t=await ready(mk(async()=>reply(JSON.stringify(GOOD).replace(/}$/,',}'))));t.type('#srcText',src);t.click('[data-act=addSource]');await wait(200);
 ok(t.R.S.facts.length===1&&!t.d.querySelector('.incident')&&t.calls.length===1,'small formatting slip is repaired locally with no extra request');t.w.close();
 // 2. unreadable answer: panel, permission, AI repair, retry succeeds
 t=await ready(mk(async b=>prompt(b).startsWith('The text below was meant')?reply(JSON.stringify(GOOD)):reply('{"profile":{"name":"Sample Person" "roles":[oops')));t.type('#srcText',src);t.click('[data-act=addSource]');await wait(200);
 ok(!!t.d.querySelector('.incident')&&t.R.S.facts.length===0,'unreadable answer opens the repair panel');
 ok(t.R.AI.cfg.jsonRepair===false&&t.R.S.sources.length===1,'nothing is changed before the user approves a fix');
 ok(t.d.querySelector('.incident [data-id=jsonRepair]').className.includes('primary'),'the first proposed fix matches the failure');
 t.click('.incident [data-id=jsonRepair]');await wait(300);
 ok(t.R.AI.cfg.jsonRepair===true&&t.R.S.facts.length===1&&t.R.S.sources.length===1&&!t.d.querySelector('.incident'),'approved fix is applied and the failed step is retried without duplicating the source');
 ok(t.R.S.profile.heals.length===1&&t.R.S.profile.heals[0].fix==='jsonRepair','the approved fix is recorded');t.w.close();
 // 3. answer cut short on a long document: smaller parts
 const long=Array.from({length:400},(_,i)=>'Line '+i+' of a long resume with plenty of detail in it.').join('\n');
 t=await ready(mk(async b=>prompt(b).length>12000?reply('{"profile":{"na','length'):reply(JSON.stringify(GOOD))));t.type('#srcText',long);t.click('[data-act=addSource]');await wait(200);
 ok(t.R.ruleDiagnosis(t.R.S.ui.incident).fixes[0]==='smaller','a cut-off answer during extraction proposes smaller parts');
 t.click('.incident [data-id=smaller]');await wait(400);
 ok(t.R.AI.cfg.chunk===7000&&t.R.S.facts.length>=1&&!t.d.querySelector('.incident'),'smaller parts are applied and extraction completes');t.w.close();
 // 4. unreachable server: settings fixes only, no AI analysis offered
 t=await ready(mk(async()=>{throw new TypeError('Failed to fetch')}));t.type('#srcText',src);t.click('[data-act=addSource]');await wait(200);
 ok(!!t.d.querySelector('.incident [data-id=setup]')&&!t.d.querySelector('[data-act=analyze]'),'when the AI is unreachable the panel offers settings fixes, not AI analysis');t.w.close();
 // 5. rate limit: wait then retry
 let hits=0;t=await ready(mk(async()=>++hits===1?{ok:false,status:429,json:async()=>({error:{message:'slow down'}})}:reply(JSON.stringify(GOOD))));t.R.HEAL.wait=50;t.type('#srcText',src);t.click('[data-act=addSource]');await wait(200);
 t.click('.incident [data-id=wait]');await wait(500);ok(t.R.S.facts.length===1,'rate limit: waits, then retries with approval');t.w.close();
 // 6. unknown failure: AI analysis proposes a fix from the allowed list only
 hits=0;t=await ready(mk(async b=>{if(prompt(b).startsWith('You are the repair assistant'))return reply(JSON.stringify({cause:'The server hiccuped.',evidence:'Error 500.',fix:'delete_everything',why:'x'}));return ++hits===1?{ok:false,status:500,json:async()=>({error:{message:'boom'}})}:reply(JSON.stringify(GOOD))}));t.type('#srcText',src);t.click('[data-act=addSource]');await wait(200);
 t.click('[data-act=analyze]');await wait(200);const inc=t.R.S.ui.incident;
 ok(inc&&inc.diag&&inc.diag.cause==='The server hiccuped.'&&inc.diag.fix==='report','AI analysis is shown, and a fix outside the allowed list is refused');
 ok(t.calls.some(b=>prompt(b).includes('ERROR CODE: api')),'the analysis request carries the failure record');t.w.close();
 // 7. damaged data: screen guard, health check, repair with permission, undo
 t=await ready(mk(async()=>reply('{}')));const S=t.R.S;
 S.roles=[{id:'r1',company:'Acme',title:'Manager'}];S.facts=[{id:'f1',kind:'skill',text:'ok',roleId:'gone'},{id:'f1',kind:'skill',text:'dup',roleId:''},{id:'f3',kind:'skill',text:'  '},null];
 S.jobs=[{id:'j1',jdText:'x',addedAt:1}];S.resumes=[{id:'v1',jobId:'j1',createdAt:1,label:'v1',resume:{experience:'broken'}},{id:'v2',jobId:'missing',createdAt:2,label:'v2',resume:{}}];
 ok(t.R.checkData().length===5,'health check finds each kind of damage ('+t.R.checkData().map(i=>i.text).join(' | ')+')');
 const before=JSON.stringify(t.R.snapshot());t.w.location.hash='facts';await wait(30);t.R.render();
 ok(t.d.querySelector('.incident h2').textContent==='This screen could not be shown'&&t.d.querySelectorAll('#tabs a').length===7,'a screen that cannot draw shows a recovery card instead of breaking the app');
 ok(JSON.stringify(t.R.snapshot())===before,'damaged data is not touched before approval');
 t.click('[data-act=repairData]');await wait(100);
 ok(t.R.checkData().length===0&&S.facts.length===2&&S.resumes.length===1&&Array.isArray(S.resumes[0].resume.experience)&&!t.d.querySelector('.incident'),'approved repair fixes the data and the screen draws again');
 t.w.location.hash='data';await wait(30);t.R.render();t.click('[data-act=undoRepair]');await wait(100);
 ok(t.R.S.resumes.length===2&&t.R.S.facts.length===4,'undo restores the data exactly as it was before the repair');
 S.jobs=null;t.w.location.hash='jobs';await wait(30);t.R.render();ok(!!t.d.querySelector('.incident')&&t.d.querySelector('#counts').textContent.includes('0 jobs'),'a missing list does not crash the page');t.w.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
