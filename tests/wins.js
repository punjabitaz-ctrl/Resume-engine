// Wins: accomplishment stories in the user's own words (STAR), scored for strength and fed to the writer.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const prompts=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;w.Element.prototype.scrollIntoView=()=>{};
  w.fetch=async(u,o)=>{const p=JSON.parse(o.body).messages[0].content;prompts.push(p);const S=w.__re.S;
   const out=p.startsWith('You are coaching')?{questions:[{q:'How much revenue did the distributor bring in the first year?',field:'result'},{q:'How many people were on the team?',field:'situation'},{q:'Bad field',field:'nonsense'}]}
    :{headline:'Channel leader',summary:'Builds distribution channels.',skills:[{group:'Core',items:['Salesforce']}],experience:[{roleId:'r1',bullets:[{text:'Signed Ingram Micro as the first national distributor in 5 months, adding 40 resellers',facts:[w.__re.wins()[0].id]}]}],education:[{text:'B.S.'}],gaps:[]};
   return{ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(out)},finish_reason:'stop'}]})}}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';
 S.profile={name:'Sample Person',email:'s@example.com',phone:'555'};
 S.roles=[{id:'r1',company:'Acme XR',title:'Channel Manager',start:'Jan 2026',end:'Present'},{id:'r2',company:'OldCo',title:'Partner Lead',start:'Mar 2019',end:'Dec 2025'}];
 S.facts=[{id:'f1',kind:'achievement',text:'Signed the first national distributor for the headset line',roleId:'r1',ok:true,match:true},{id:'f2',kind:'skill',text:'Salesforce',roleId:'',ok:true,match:true}];
 S.jobs=[{id:'j1',company:'ExampleCo',title:'Partner Manager',jdText:'x',status:'Saved',addedAt:1,analysis:{keywords:[{term:'distribution',weight:3},{term:'co-sell',weight:3},{term:'Salesforce',weight:1}]}}];
 const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const type=(sel,v)=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 w.location.hash='wins';await wait(30);R.render();
 ok(d.querySelectorAll('#tabs a').length===8&&d.querySelector('#tabs a[aria-current]').textContent.includes('Wins'),'Wins has its own tab');
 ok(d.body.textContent.includes('1 accomplishment from your sources to build out')&&d.body.textContent.includes('0 of 3'),'one-line accomplishments are offered for building out, and roles show how many wins they still need');
 // build a win from an existing fact
 click('[data-act=newWin][data-id=f1]');
 ok(d.querySelector('#w_a').value.startsWith('Signed the first national distributor')&&d.querySelector('#w_role').value==='r1','the form starts from the fact, with its role');
 ok(/thin/.test(d.querySelector('#winMeter').textContent)&&/Add the result/.test(d.querySelector('#winMeter').textContent),'a thin win is scored and told exactly what is missing');
 type('#w_title','Signed the first national distributor');type('#w_s','Acme XR sold only direct and had no distribution coverage in North America.');type('#w_t','Open a national distribution channel within two quarters.');
 type('#w_a','Pitched Ingram Micro, negotiated terms and built the onboarding kit for its reseller base.');type('#w_r','Signed in 5 months.');
 ok(/5\/5/.test(d.querySelector('#winMeter').textContent)&&/strong/.test(d.querySelector('#winMeter').textContent),'the strength meter updates as the user types');
 // coaching: questions only, answers stay in the user's words
 click('[data-act=coachWin]');await wait(200);
 ok(d.querySelectorAll('[id^=wq]').length===3&&prompts[0].includes('Never suggest an answer, a number or wording'),'the coach asks questions and is told never to suggest answers or numbers');
 type('#wq0','It added 40 resellers.');click('[data-act=addAnswers]');
 ok(d.querySelector('#w_r').value==='Signed in 5 months. It added 40 resellers.','answers are added to the win exactly as the user wrote them');
 ok(R.wins().length===0,'nothing is saved until the user saves');
 click('[data-act=saveWin]');const win=R.wins()[0];
 ok(win&&win.ok===true&&win.roleId==='r1'&&R.winScore(win.star).label==='strong','the win is saved, approved as the user’s own words, and scored strong');
 ok(win.text==='Signed the first national distributor. Situation: Acme XR sold only direct and had no distribution coverage in North America. Task: Open a national distribution channel within two quarters. Action: Pitched Ingram Micro, negotiated terms and built the onboarding kit for its reseller base. Result: Signed in 5 months. It added 40 resellers.','the story is stored as one complete fact');
 ok(S.facts.find(f=>f.id==='f1').ok===false,'the one-line fact it grew from is switched off so it is not used twice');
 ok(d.body.textContent.includes('1 of 3')&&d.querySelector('.chip.hit').textContent==='1 strong','the database view shows the new strength and role coverage');
 // posting coverage
 type('#winJob','j1');d.querySelector('#winJob').dispatchEvent(new w.Event('change',{bubbles:true}));
 ok(d.body.textContent.includes('1 of this posting’s 2 main terms')&&[...d.querySelectorAll('.chip.miss')].some(c=>c.textContent==='co-sell'),'wins are checked against a posting and the uncovered terms are named');
 // prompts
 click('[data-act=newWin][data-id=p2]');ok(d.body.textContent.includes('Prompt: A number you moved'),'a memory prompt opens a new win');click('[data-act=cancelWin]');
 // the writer gets the win and its numbers count as evidence
 S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(200);const wp=prompts[prompts.length-1];
 ok(wp.includes('Facts of kind "win" are full accomplishment stories')&&wp.includes(win.id+' | win | r1 | Signed the first national distributor.')&&!wp.includes('f1 | achievement'),'the writer receives the full win, is told to build from it, and does not get the replaced fact');
 ok(R.flagsFor(S.resumes[0].resume).length===0,'numbers in a bullet built from a win trace back to the win');
 // fact base shows it read-only; edit and delete
 w.location.hash='facts';await wait(30);R.render();ok(d.body.textContent.includes('win, in your own words')&&!d.querySelector('[data-edit=fact][data-id="'+win.id+'"]'),'the Fact base shows the win but edits happen in Wins');
 click('[data-act=editWin][data-id="'+win.id+'"]');type('#w_r','Signed in 5 months.');click('[data-act=saveWin]');ok(R.wins().length===1&&R.wins()[0].id===win.id&&!R.wins()[0].text.includes('40 resellers'),'editing updates the same win');
 w.location.hash='wins';await wait(30);R.render();click('[data-act=delWin]');click('[data-act=delWin]');ok(R.wins().length===0&&S.facts.find(f=>f.id==='f1').ok===true,'deleting a win switches the original fact back on');
 await wait(200);w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
