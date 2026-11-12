const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));const tap=require('./tap');
(async()=>{const prompts=[];let learnCalls=0;
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};
  const sample=async()=>({text:'x'});sample.json=async(prompt)=>{prompts.push(prompt);const S=w.__re.S;
   if(prompt.startsWith('You maintain')){learnCalls++;const cur=w.__re.learned();
    if(learnCalls===1)return{lessons:[{id:'',text:'Open bullets with the outcome, then the action.',dir:'do',strength:2,basis:'edits',evidence:'2 of 2 hand edits moved the result first'},{id:'',text:'Avoid the word leveraged.',dir:'avoid',strength:3,basis:'edits',evidence:'removed twice'},{id:'',text:'Use the Executive template.',dir:'do',strength:9,basis:'outcomes',evidence:'early signal, 2 sent'}],summary:'Added three lessons.'};
    return{lessons:[{id:cur[0].id,text:cur[0].text,dir:'do',strength:4,basis:'both',evidence:'3 edits, 2 interviews'},{id:cur[1].id,text:cur[1].text,dir:'avoid',strength:2,basis:'edits',evidence:'weaker'}],summary:'Reinforced one, reduced one, dropped one.'}}
   if(prompt.startsWith('You are a master'))return{headline:'PDM',summary:'Leader in channel partnerships.',skills:[{group:'Core',items:['Salesforce']}],experience:[{roleId:'r1',bullets:[{text:'Leveraged relationships to sign 12 partners',facts:['f1']},{text:'Ran partner enablement training',facts:['f2']}]}],education:[{text:'B.S.'}],gaps:[]};
   throw{code:'invalid_json'}};
  w.claude={use:async k=>k==='sample'?sample:null}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;
 S.profile={name:'Sample Person',email:'sample.person@example.com',phone:'555-0100',location:'Princeton, NJ',links:['linkedin.com/in/sample-person','sampleperson.example.com/portfolio']};
 S.roles=[{id:'r1',company:'Acme XR',title:'Channel Manager',start:'Jan 2026',end:'Present'}];
 S.facts=[{id:'f1',kind:'achievement',text:'Signed 12 partners',roleId:'r1'},{id:'f2',kind:'responsibility',text:'Ran partner enablement training',roleId:'r1'}];
 const kw={keywords:[{term:'channel partnerships',weight:3},{term:'Salesforce',weight:1}]};
 S.jobs=[{id:'j1',company:'ExampleCo',title:'PDM',jdText:'x',status:'Saved',addedAt:1,analysis:kw},{id:'j2',company:'OtherCo',title:'Alliances Lead',jdText:'y',status:'Saved',addedAt:2,analysis:kw}];
 const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const change=(sel,v)=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}))};
 const edit=(pathSel,text)=>{const sp=d.querySelector('.sheet [data-path="'+pathSel+'"]');sp.textContent=text;sp.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true}))};
 S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();
 console.log('contact blocks',R.blocks({},R.TPL.classic).filter(b=>b.t==='contact').map(b=>b.text).join(' // '));
 console.log('base select before any other-job version',!!d.querySelector('#base'));
 click('[data-act=tailor]');await wait(200);
 edit('experience.0.0','12 partners signed by building distributor relationships');
 console.log('pairs',JSON.stringify(R.editPairs()),'signals',R.signalCount(),'banner',!!d.querySelector('.banner [data-act=learn]'));
 click('.ver.on [data-act=markSent]');w.location.hash='jobs';await wait(30);R.render();change('#st-j1','Interview');
 console.log('outcomes',R.outcomes().map(o=>o.status+':'+o.good+':'+o.tpl+':'+o.words).join(),'signals',R.signalCount());
 // learn
 w.location.hash='memory';await wait(30);R.render();click('[data-act=learn]');await wait(200);
 console.log('proposal only',R.learned().length===0&&!!S.ui.proposal&&!!d.querySelector('.proposal'));click('[data-act=approveLessons]');await wait(50);console.log('script click refused',R.learned().length===0);if(R.learned().length)process.exit(1);tap(w,d.querySelector('[data-act=approveLessons]'));await wait(50);
 console.log('lessons',R.learned().map(m=>m.dir+m.strength).join(' '),'signals after',R.signalCount(),'rows',d.querySelectorAll('[data-chg=lessonOn]').length,'stats',JSON.stringify(R.statGroups().groups.map(g=>g.rows)));
 const lp=prompts.find(p=>p.startsWith('You maintain'));console.log('learn prompt has edit',lp.includes('12 partners signed by building'),'has outcome',lp.includes('"outcome":"Interview"'));
 // switch one off, drop one, relearn → reinforce/reduce
 const L=R.learned();change('#ls-'+L[1].id,'x');d.querySelector('#ls-'+L[1].id).checked=false;d.querySelector('#ls-'+L[1].id).dispatchEvent(new w.Event('change',{bubbles:true}));
 click('[data-act=delLesson][data-id='+L[2].id+']');console.log('dropped',S.profile.dropped,'left',R.learned().length);
 click('[data-act=learn]');await wait(200);tap(w,d.querySelector('[data-act=approveLessons]'));await wait(50);const L2=R.learned();console.log('after relearn',L2.map(m=>m.dir+m.strength+'(was '+m.was+',on '+(m.on!==false)+')').join(' '),'| note:',S.profile.learnNote,'| arrow',d.body.textContent.includes('▲ from 2'));
 // writer sees lessons (only on ones) + edits; reuse for job 2
 S.ui.jobId='j2';w.location.hash='tailor';await wait(30);R.render();console.log('base select',!!d.querySelector('#base'),d.querySelector('#base').options.length);
 change('#base',S.resumes[0].id);click('[data-act=tailor]');await wait(200);const wp=prompts[prompts.length-1];const v=S.resumes[S.resumes.length-1];
 console.log('reused',v.kind,'|',v.from,'| adapt task',wp.includes('ADAPTATION TASK'),'no revision task',!wp.includes('REVISION TASK'),'| learned in prompt',wp.includes('[do, strength 4] Open bullets'),'off lesson excluded',!wp.includes('Avoid the word leveraged'),'| edits in prompt',wp.includes('RECENT HAND EDITS'),'| standing empty',!wp.includes('STANDING INSTRUCTIONS'));
 console.log('local saved',JSON.parse(w.localStorage.getItem('resume-engine')).memory.length);
 w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
