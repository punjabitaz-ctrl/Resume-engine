// Interview prep: story bank themes, interview-only stories, approved wording, rounds, likely questions, practice, debrief.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');const tap=require('./tap');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const prompts=[];let clip='';
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;w.Element.prototype.scrollIntoView=()=>{};
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{clip=t}}});
  w.fetch=async(u,o)=>{const p=JSON.parse(o.body).messages[0].content;prompts.push(p);let out={};
   if(p.startsWith('Rewrite each part'))out={title:'',s:'Acme XR had no distribution in North America.',t:'',a:'Pitched Ingram Micro and negotiated terms.',r:'Signed in 5 months, adding 60 resellers.'};
   else if(p.startsWith('You are preparing a candidate'))out={questions:[{q:'Tell me about a time you opened a new channel.',type:'behavioral',tests:'Can you build distribution from nothing',theme:'Results',wins:['w1','ghost']},{q:'Tell me about a time a partner relationship went wrong.',type:'behavioral',tests:'How you handle conflict',theme:'Conflict',wins:[]},{q:'Why this company?',type:'motivation',tests:'Real interest',theme:'',wins:[]},{q:'Odd type',type:'weird',tests:'',wins:[]}],ask:[{q:'What does success look like in the first six months?',why:'Shows you think in outcomes.'}],research:['Which distributors the company already works with']};
   else if(p.startsWith('Draft an answer to "Tell me about yourself"'))out={text:'I run channel partnerships at Acme XR, where I signed 12 distributors. Before that I spent 9 years at OldCo. This role is the next step.'};
   else if(p.startsWith('Draft a short thank-you'))out={subject:'Thank you',body:'Thank you for the conversation about distribution. I will send the reference I promised.'};
   else if(p.startsWith('Give feedback'))out={covered:{situation:true,task:false,action:true,result:false},strengths:['Clear on what you did.'],improve:['Land the result with what changed.']};
   else out={headline:'x',summary:'y',skills:[{group:'a',items:['b']}],experience:[],education:[],gaps:[]};
   return{ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(out)},finish_reason:'stop'}]})}}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';
 S.profile={name:'Sample Person'};S.roles=[{id:'r1',company:'Acme XR',title:'Channel Manager',start:'Jan 2026',end:'Present'},{id:'r2',company:'OldCo',title:'Partner Lead',start:'Mar 2019',end:'Dec 2025'},{id:'r3',company:'FirstCo',title:'Rep',start:'Jan 2015',end:'Feb 2019'}];
 S.facts=[{id:'w1',kind:'win',src:'win',ok:true,match:true,title:'Signed the first national distributor',wkind:'accomplishment',roleId:'r1',themes:[],star:{s:'Acme XR sold only direct and had no distribution in North America at all.',t:'Open a channel.',a:'Pitched Ingram Micro, negotiated terms and built the onboarding kit.',r:'Signed in 5 months.'},text:'Signed the first national distributor. Situation: Acme XR sold only direct. Action: Pitched Ingram Micro. Result: Signed in 5 months.'},{id:'f2',kind:'achievement',text:'Signed 12 distributors',roleId:'r1',ok:true,match:true}];
 S.jobs=[{id:'j1',company:'ExampleCo',title:'Partner Manager',jdText:'Build distribution and manage partners.',status:'Applied',addedAt:1,analysis:{mustHaves:['distribution'],keywords:[{term:'distribution',weight:3}]}}];
 const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const type=(sel,v)=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 const change=(sel,v)=>{const el=d.querySelector(sel);if(v!==undefined)el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}))};
 // win targets
 w.location.hash='wins';await wait(30);R.render();
 ok(d.body.textContent.includes('1 of 3')&&d.body.textContent.includes('0 of 2')&&d.body.textContent.includes('Aim for 2 to 3 wins in every role'),'every role asks for 2 to 3 wins, with the most recent weighted');
 // wording suggestion: approved per part, number guard
 click('[data-act=editWin][data-id=w1]');click('[data-act=tightenWin]');await wait(200);
 ok(prompts[0].includes('Add nothing: no new facts, no new numbers')&&d.body.textContent.includes('Dropped because it added a number you did not write: Result'),'a suggestion that adds a number is dropped by the app and the user is told');
 ok(d.querySelector('#w_s').value.includes('sold only direct'),'the user\u2019s wording is untouched until they choose');
 click('[data-act=useWording][data-id=s]');ok(d.querySelector('#w_s').value.includes('sold only direct'),'GUARDRAIL: a script-made click cannot accept a suggestion');
 tap(w,d.querySelector('[data-act=useWording][data-id=s]'));ok(d.querySelector('#w_s').value==='Acme XR had no distribution in North America.','the user\u2019s own tap accepts a suggested part');
 // themes and interview-only
 const th=d.querySelector('[data-chg=winTheme][data-k="Results"]');th.checked=true;th.dispatchEvent(new w.Event('change',{bubbles:true}));click('[data-act=saveWin]');
 ok(R.wins()[0].themes.join()==='Results'&&R.wins()[0].star.s==='Acme XR had no distribution in North America.','themes and approved wording are saved with the win');
 w.location.hash='prep';await wait(30);R.render();
 ok([...d.querySelectorAll('.chip.hit')].some(c=>c.textContent==='Results 1')&&[...d.querySelectorAll('.chip.miss')].some(c=>c.textContent==='Conflict 0'),'the story bank shows which interview themes are covered and which are not');
 click('[data-act=newWin][data-id="t:Conflict"]');ok(d.querySelector('#w_io').checked&&d.body.textContent.includes('A story about: Conflict'),'a missing theme starts an interview-only story');
 type('#w_title','Reset a failing partner relationship');type('#w_a','Met the partner in person, agreed what had gone wrong and rewrote the joint plan together.');type('#w_r','They stayed and renewed.');click('[data-act=saveWin]');
 const io=R.wins().find(x=>x.interviewOnly);S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(200);
 ok(io&&!prompts[prompts.length-1].includes(io.id+' | win'),'an interview-only story is never sent to the resume writer');
 // prep pack
 w.location.hash='prep';await wait(30);R.render();change('#prepJob','j1');change('#r_stage','manager');type('#r_date','Nov 18');type('#r_who','Dana, VP Sales');click('[data-act=addRound]');
 const pr=R.prepOf(S.jobs[0]);ok(pr.rounds.length===1&&d.body.textContent.includes('Hiring manager \u00b7 Nov 18'),'an interview round is logged with its stage');
 click('[data-act=buildPack]');await wait(200);const pk=pr.pack,pp=prompts.find(x=>x.startsWith('You are preparing a candidate'));
 ok(pk&&pk.stage==='Hiring manager'&&pp.includes('STAGE: Hiring manager')&&pp.includes('w1 | Signed the first national distributor | Results')&&pp.includes(io.id),'the pack is built for the upcoming stage from the posting and the whole story bank');
 ok(pk.questions[0].wins.join()==='w1'&&pk.questions[3].type==='role','story ids the AI invents are discarded and odd answers are normalised');
 ok(d.body.textContent.includes('no story yet')&&d.body.textContent.includes('What does success look like')&&d.body.textContent.includes('Which distributors the company already works with'),'the pack shows story gaps, questions to ask and what to research');
 // practice
 click('[data-act=pracQ][data-id="'+pk.questions[0].id+'"]');ok(d.body.textContent.includes('They are checking: Can you build distribution')&&!d.body.textContent.includes('Pitched Ingram Micro and negotiated'),'practice shows the question and hides the story until asked');
 click('[data-act=pracShow]');ok(d.body.textContent.includes('Pitched Ingram Micro'),'the matched story appears as cue cards');
 click('[data-act=pracClock]');await wait(50);click('[data-act=pracClock]');ok(/^\d:\d\d$/.test(d.querySelector('#pracClock').textContent),'a clock times the spoken answer');
 type('#pracAns','At Acme we sold only direct so I pitched Ingram Micro and negotiated the terms and then built an onboarding kit for all of their resellers to use.');click('[data-act=pracFeedback]');await wait(200);
 ok(d.body.textContent.includes('result missing')&&d.body.textContent.includes('Land the result')&&prompts[prompts.length-1].includes('Do not rewrite the answer'),'feedback says which STAR parts were missing and does not rewrite the answer');
 click('[data-act=pracDone]');ok(pr.practice[pk.questions[0].id].n===1&&d.body.textContent.includes('practiced 1'),'practice is counted per question');
 // tell me about yourself
 click('[data-act=draftTmay]');await wait(200);ok(d.body.textContent.includes('numbers not found in your facts: 9')&&!pr.tmay,'the introduction draft is checked against the facts and is only a proposal');
 click('[data-act=useTmay]');ok(!pr.tmay,'GUARDRAIL: a script-made click cannot accept the draft');tap(w,d.querySelector('[data-act=useTmay]'));ok(pr.tmay.startsWith('I run channel partnerships')&&/seconds spoken/.test(d.body.textContent),'the user\u2019s tap accepts it and the spoken length is shown');
 // debrief and thank-you
 const rid=pr.rounds[0].id;change('#rd-'+rid+'-asked','How I opened distribution');change('#rd-'+rid+'-owed','A reference');click('[data-act=thankYou][data-id="'+rid+'"]');await wait(200);
 ok(pr.rounds[0].debrief.owed==='A reference'&&prompts[prompts.length-1].includes('WHAT I OWE THEM: A reference')&&d.body.textContent.includes('send it yourself'),'the debrief is saved and feeds a thank-you draft the user sends themselves');
 click('[data-act=copyThanks][data-id="'+rid+'"]');await wait(30);ok(clip.includes('reference I promised'),'the thank-you draft can be copied');
 click('[data-act=roundDone][data-id="'+rid+'"]');ok(pr.rounds[0].done&&S.jobs[0].status==='Interview','marking a round done moves the job to Interview');
 // custom themes
 w.location.hash='wins';await wait(30);R.render();click('[data-act=editWin][data-id=w1]');type('#w_newTheme','Negotiation');click('[data-act=addTheme]');click('[data-act=saveWin]');
 w.location.hash='prep';await wait(30);R.render();ok(S.profile.themes.join()==='Negotiation'&&R.wins().find(x=>x.id==='w1').themes.includes('Negotiation')&&[...d.querySelectorAll('.chip.hit')].some(c=>c.textContent==='Negotiation 1'),'a user can add their own theme and it joins the story bank');
 // debriefs feed learning, as a proposal, and interview lessons shape the next pack
 ok(R.signalCount()>=1,'a debrief counts as a new signal for learning');
 const orig=w.fetch;w.fetch=async(u,o)=>{const p=JSON.parse(o.body).messages[0].content;prompts.push(p);const out=p.startsWith('You maintain')?{lessons:[{id:'',text:'Lead with the distribution story when asked about growth.',dir:'do',strength:3,basis:'debriefs',scope:'interview',evidence:'1 debrief'}],summary:'One interview lesson.'}:{questions:[],ask:[],research:[]};return{ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(out)},finish_reason:'stop'}]})}};
 w.location.hash='memory';await wait(30);R.render();click('[data-act=learn]');await wait(200);const lp=prompts[prompts.length-1];
 ok(lp.includes('INTERVIEW DEBRIEFS (1)')&&lp.includes('How I opened distribution')&&R.learned().length===0,'debrief notes reach the learning request and the result is only a proposal');
 tap(w,d.querySelector('[data-act=approveLessons]'));ok(R.learned()[0].scope==='interview'&&d.body.textContent.includes('for interview prep'),'an approved interview lesson is kept and labelled');
 w.location.hash='prep';await wait(30);R.render();click('[data-act=buildPack]');await wait(200);const p2=prompts[prompts.length-1];
 ok(p2.includes('LESSONS FROM THIS CANDIDATE\'S PAST INTERVIEWS')&&p2.includes('Lead with the distribution story')&&p2.includes('QUESTIONS THIS CANDIDATE REPORTS BEING ASKED BEFORE')&&p2.includes('Negotiation'),'the next prep pack uses interview lessons, questions asked before and custom themes');
 w.fetch=orig;S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(200);ok(!prompts[prompts.length-1].includes('Lead with the distribution story'),'interview lessons stay out of the resume writer');
 ok(prompts.every(x=>x.includes('never use an em dash')),'every prep request carries the house writing rule');
 await wait(200);w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
