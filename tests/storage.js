const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=require('./load')();
function fakeDb(docs,canWrite){const snap=(p)=>({id:p.split('/').pop(),exists:p in docs,data:()=>docs[p]});
 const doc=p=>{if(p.split('/').length%2)throw new TypeError('doc parity '+p);return{path:p,get:async()=>snap(p),set:async d=>{if(!canWrite(p))throw{code:'invalid_argument'};docs[p]=JSON.parse(JSON.stringify(d))},delete:async()=>{if(!canWrite(p))throw{code:'invalid_argument'};delete docs[p]},collection:c=>col(p+'/'+c)}};
 const col=p=>{if(p.split('/').length%2===0)throw new TypeError('col parity '+p);const q={limit:()=>q,get:async()=>({docs:Object.keys(docs).filter(k=>k.startsWith(p+'/')&&k.slice(p.length+1).indexOf('/')<0).map(snap)}),doc:id=>doc(p+'/'+id)};return q};
 return{doc,collection:col}}
const JD=('Partner Development Manager, AI Platforms. Build channel partnerships, partner enablement, co-sell, generative AI, Salesforce, Ingram Micro. ').repeat(3);
function mk(docs,{owner=true,canWrite=()=>true,id='u1',url}={}){const calls=[];const saved=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',url:url||('file://'+path.join(__dirname,'../index.html')),pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};
  const sample=async()=>({text:'x'});sample.json=async(prompt,o)=>{calls.push(prompt);
   if(prompt.startsWith('You are building'))return{profile:{name:'Sample Person',email:'s@e.co',phone:'555'},roles:[{company:'Acme XR',title:'Channel Manager',start:'Jan 2026',end:'Present'},{company:'Acme XR',title:'Channel & Partnerships Manager',start:'Jan 2026',end:'Present'}],facts:[{kind:'achievement',text:'Signed 12 distribution partners including Ingram Micro, part '+calls.length,company:'Acme XR',title:'Channel Manager'},{kind:'skill',text:'Salesforce, channel partnerships, partner enablement '+calls.length},{kind:'education',text:'B.S. Business '+calls.length}]};
   if(prompt.startsWith('Analyze this job'))return{company:'ExampleCo',title:'PDM',keywords:[{term:'channel partnerships',weight:3},{term:'partner enablement',weight:3},{term:'generative AI',weight:2},{term:'Salesforce',weight:1}]};
   if(prompt.startsWith('You are a master')){const S=w.__re.S;const rev=prompt.includes('REVISION TASK');return{headline:'PDM',summary:rev?'Leader in channel partnerships and partner enablement.':'Leader with 99 wins.',skills:[{group:'Core',items:rev?['Salesforce','partner enablement','channel partnerships']:['Salesforce']}],experience:[{roleId:S.roles[0].id,bullets:[{text:'Signed 12 distribution partners including Ingram Micro',facts:[S.facts[0].id]}]}],education:[{text:'B.S. Business'}],gaps:[]}}
   throw{code:'invalid_json'}};
  w.claude={use:async n=>n==='sample'?sample:n==='db'?(docs?fakeDb(docs,canWrite):null):n==='user'?{id:async()=>id,isOwner:async()=>owner}:n==='downloads'?{save:async o=>{saved.push(o);return{status:'saved'}}}:null}}});
 return{dom,w:dom.window,calls,saved}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 // A: owner, legacy data + inbox, full flow in cloud mode
 const docs={'state/profile':{name:'Legacy'},'state/facts':{items:[{id:'f0',kind:'skill',text:'legacy fact',roleId:''}]},'state/roles':{items:[]},'sources/s0':{type:'resume',title:'old',text:'x',addedAt:1},'inbox/i1':{kind:'job',company:'InboxCo',title:'Role',jdText:JD}};
 let {dom,w,calls,saved}=mk(docs);await wait(300);let R=w.__re,S=R.S,d=w.document;
 const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const type=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 const change=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('change',{bubbles:true}))};
 console.log('A mode',R.Store.mode,'migrated',S.profile.name,S.facts.length,S.sources.length,'inbox jobs',S.jobs.length,'toast:',d.querySelector('#toast').textContent);
 await wait(100);console.log('A stored',Object.keys(docs).filter(k=>k.startsWith('data/users/u1')).sort().map(k=>k.replace('data/users/u1/','')).join(' | '),'inbox left',Object.keys(docs).filter(k=>k.startsWith('inbox')).length);
 // long source → chunks
 const long=Array.from({length:900},(_,i)=>'Line '+i+' of a long LinkedIn export with details about work.').join('\n');
 console.log('chunks',R.chunks(long).length,R.chunks(long).map(c=>c.length).join(','),R.chunks(long).join('').length===long.length+1);
 type('#srcText',long);click('[data-act=addSource]');await wait(300);
 console.log('unmatched facts wait for approval',S.facts.filter(f=>f.ok===false&&f.match===false).length>0);S.facts.forEach(f=>{f.ok=true});
 console.log('extract calls',calls.filter(c=>c.startsWith('You are building')).length,'facts',S.facts.length,'roles',S.roles.length,'part note',calls[1].includes('This is part 2 of'));
 // merge duplicate roles, move a fact
 w.location.hash='facts';await wait(30);R.render();const [r0,r1]=S.roles;change('#mg-'+r1.id,r0.id);console.log('roles after merge',S.roles.length);
 const loose=S.facts.find(f=>!f.roleId&&f.kind==='skill');change('#fr-'+loose.id,r0.id);change('#fk-'+loose.id,'achievement');console.log('moved',S.facts.find(f=>f.id===loose.id).roleId===r0.id,S.facts.find(f=>f.id===loose.id).kind);
 // tailor + revise
 w.location.hash='jobs';await wait(30);R.render();click('[data-act=openTailor]');await wait(30);change('#len','1');d.querySelector('#len').dispatchEvent(new w.Event('input',{bubbles:true}));click('[data-act=tailor]');await wait(300);
 let rec=S.resumes[0];console.log('v1 score',R.scoreText(S.jobs[0],R.resumeText(rec.resume)).pct,'flags',R.flagsFor(rec.resume).map(f=>f.nums.join()).join('|'),'one page prompt',calls[calls.length-1].includes('Fit one page'),'revise btn',!!d.querySelector('[data-act=revise]'));
 click('[data-act=revise]');await wait(300);rec=S.resumes[1];const last=calls[calls.length-1];
 console.log('v2',rec.label,'score',R.scoreText(S.jobs[0],R.resumeText(rec.resume)).pct,'flags',R.flagsFor(rec.resume).length,'revise prompt terms',/Work in these posting terms.*partner enablement/.test(last),'flagged',last.includes('[unverified: 99]'));
 // backup, wipe, restore
 w.location.hash='data';await wait(30);R.render();click('[data-act=exportBackup]');await wait(50);const bk=JSON.parse(saved[0].data);console.log('backup',saved[0].filename,bk.facts.length,bk.resumes.length);
 click('[data-act=wipe]');click('[data-act=wipe]');await wait(150);console.log('wiped',S.facts.length,Object.keys(docs).filter(k=>k.includes('/lib/')).length);
 S.ui.imp=bk;R.render();click('[data-act=confirmImport]');await wait(150);console.log('restored',S.facts.length,S.resumes.length,Object.keys(docs).filter(k=>k.includes('/lib/')).length);
 w.close();
 // A2: reload same docs → persists, no re-migration, no dup
 ({dom,w}=mk(docs));await wait(300);console.log('A2 reload',w.__re.Store.mode,w.__re.S.facts.length,w.__re.S.jobs.length,w.__re.S.resumes.length);w.close();
 // B: friend who cannot write → local, sees none of the owner's data
 ({dom,w}=mk(docs,{owner:false,canWrite:()=>false,id:'u3',url:'https://example.test/'}));await wait(300);console.log('B friend mode',w.__re.Store.mode,'facts',w.__re.S.facts.length,'note:',w.document.querySelector('#storeNote').textContent,'owner hint',w.document.body.innerHTML.includes('send a link to Claude'));
 w.__re.S.memory.push({id:'m1',text:'x'});w.__re.Store.state('memory');await wait(50);console.log('B local saved',w.localStorage.getItem('resume-engine').length,'leaked to db',Object.keys(docs).some(k=>k.includes('u3')));w.close();
 ({dom,w}=mk(docs,{owner:false,canWrite:()=>false,id:'u3',url:'https://example.test/'}));
 // C: friend who can write own subtree (org contributor), separate id
 const docs2=JSON.parse(JSON.stringify(docs));({dom,w}=mk(docs2,{owner:false,id:'u2'}));await wait(300);console.log('C contributor',w.__re.Store.mode,'facts',w.__re.S.facts.length,'meta',!!docs2['data/users/u2/meta']);w.close();
 // D: no claude at all
 const dom4=new JSDOM(html,{runScripts:'dangerously',url:'file:///x/index.html',beforeParse(w){w.scrollTo=()=>{}}});await wait(200);console.log('D standalone',dom4.window.__re.Store.mode,dom4.window.document.querySelectorAll('#tabs a').length);dom4.window.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
