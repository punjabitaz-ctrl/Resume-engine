// The fact-check gaps from the pre-test review: nothing the AI invents should reach a resume without the user's tap.
const {JSDOM}=require('jsdom');
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const SOURCE='Sample Person\ns@example.com | 555-0100\nChannel Manager, Acme XR, January 2026 to Present\nRan partner enablement training for reseller sales teams. Led 5 people on the partner team.\nEducation: B.S. Business, Example University';
let EXTRACT,WRITE;
(async()=>{const prompts=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;
  w.fetch=async(u,o)=>{const p=JSON.parse(o.body).messages[0].content;prompts.push(p);const out=p.startsWith('You are building')?EXTRACT:WRITE(w.__re.S);
   return{ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(out)},finish_reason:'stop'}]})}}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';R.render();
 const click=sel=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const type=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 // 6. extracted name, contact details, roles and dates must be in the file
 EXTRACT={profile:{name:'Sample Person',email:'other@example.com',phone:'555-0100',headline:'Award-winning channel visionary'},
  roles:[{company:'Acme XR',title:'Senior Director of Channel',start:'Jan 2026',end:'Present'},{company:'Globex',title:'VP Partnerships',start:'2015',end:'2019'}],
  facts:[{kind:'responsibility',text:'Ran partner enablement training for reseller sales teams',company:'Acme XR'},{kind:'achievement',text:'Led 5 people on the partner team',company:'Acme XR'},
   {kind:'achievement',text:'Led 5 years of partner growth',company:'Acme XR'},{kind:'achievement',text:'Trained twelve reseller sales teams',company:'Acme XR'}]};
 w.location.hash='sources';await wait(30);R.render();type('#srcText',SOURCE);click('[data-act=addSource]');await wait(300);
 ok(S.profile.name==='Sample Person'&&S.profile.phone==='555-0100','a name and phone found in the file are kept');
 ok(!S.profile.email&&!S.profile.headline,'an email or headline the AI wrote that is not in the file is left out');
 ok(S.roles.length===1&&S.roles[0].company==='Acme XR','a company that is not in the file does not become a job');
 ok(S.roles[0].title===''&&S.roles[0].start==='Jan 2026'&&S.roles[0].end==='Present','a job title not in the file is left blank, and a date written differently but with the same month and year is kept');
 ok(S.ui.held>=4,'the user is told how many details were left out');
 // 5. numbers match with their units, and spelled-out numbers are numbers
 const byText=t=>S.facts.find(f=>f.text===t);
 ok(byText('Led 5 people on the partner team').match===true,'a number with the same unit as the file matches');
 ok(byText('Led 5 years of partner growth').match===false,'"5 years" does not count as evidence from "5 people"');
 ok(R.metrics('Trained twelve reseller sales teams').length>0&&byText('Trained twelve reseller sales teams').ok===false,'a spelled-out number counts as a metric and waits for the user');
 // 4. intake questions are not evidence
 const qa={id:'sq',type:'interview',title:'Intake',trusted:true,addedAt:2,text:'Question (about Channel Manager at Acme XR): Did you grow revenue 300% with Fortune 50 partners?\nCandidate answer: Yes, with two distributors.'};
 S.sources.push(qa);const c=R.corpus();
 ok(!R.matchesSource('Grew revenue 300% with Fortune 50 partners',c),'wording that appears only in an AI-written interview question does not approve a fact');
 ok(R.matchesSource('Yes with two distributors',c),'the person’s own answer still counts as their words');
 S.sources=S.sources.filter(s=>s.id!=='sq');
 // 3 and 7. the writer: unknown roles and rejected facts
 const ran=byText('Ran partner enablement training for reseller sales teams'),people=byText('Led 5 people on the partner team');people.ok=false;people.refuted=true;
 S.jobs=[{id:'j1',company:'ExampleCo',title:'Partner Manager',jdText:'x',status:'Saved',addedAt:1,analysis:{keywords:[{term:'partner enablement',weight:2}]}}];
 WRITE=S2=>({headline:'Channel leader',summary:'Partner enablement leader.',skills:[{group:'Core',items:['Salesforce','partner enablement']}],
  experience:[{roleId:'r-made-up',company:'Acme XR',title:'VP Global Channels',dates:'2010 - Present',bullets:[{text:'Ran partner enablement training for reseller sales teams',facts:[ran.id]}]},
   {roleId:'r-other',company:'Initech',title:'Chief Partner Officer',dates:'2005 - 2009',bullets:[{text:'Built a global channel from scratch',facts:[]}]},
   {roleId:S2.roles[0].id,bullets:[{text:'Led 5 people on the partner team',facts:[people.id]}]}],
  education:[{text:'B.S. Business, Example University'},{text:'MBA, Harvard Business School'}],certifications:[{text:'Certified Channel Expert'}]});
 S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(300);
 const rec=S.resumes[0],ex=rec.resume.experience;
 ok(ex.length===2&&ex[0].company==='Acme XR'&&ex[0].title===S.roles[0].title&&ex[0].dates===R.roleDates(S.roles[0]),'a job with an unknown id takes its title and dates from the saved role its facts belong to');
 ok(!ex.some(e=>e.company==='Initech')&&rec.resume.dropped===1&&d.body.textContent.includes('that are not in your fact base'),'a job the AI cannot tie to a saved role is left out, and the user is told');
 ok(ex[1].bullets[0].facts.length===0,'a citation to a rejected fact is dropped');
 ok(R.flagsFor(rec.resume).some(f=>f.text==='Led 5 people on the partner team'),'so a bullet built from a rejected fact is flagged');
 // 2. every section is checked
 const ls=R.numLines(rec.resume).map(l=>l.t);
 ok(ls.includes('MBA, Harvard Business School')&&ls.includes('Certified Channel Expert')&&ls.includes('Salesforce'),'education, certifications and skills not found in the user’s material wait for a tap');
 ok(!ls.includes('B.S. Business, Example University')&&!ls.includes('partner enablement'),'items that are in the user’s own material do not');
 ok(d.body.textContent.includes('Lines to confirm before export')&&d.body.textContent.includes('not in your facts or sources'),'the panel names lines that are not backed by the user’s material');
 let saved=0;w.URL.createObjectURL=()=>{saved++;return 'blob:x'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 click('[data-act=export][data-id=txt]');await wait(100);ok(saved===0,'export stays locked until those lines are confirmed');
 // 7. deleting a win never switches a rejected fact back on
 const win={id:'fw',kind:'win',text:'A win',roleId:S.roles[0].id,star:{s:'a',t:'b',a:'c',r:'d',proof:''},ok:true};S.facts.push(win);ran.ok=false;ran.upTo='fw';ran.refuted=true;
 ok(!R.needsLook(ran),'a fact a win replaced is not in the review list');
 w.location.hash='wins';await wait(30);R.render();click('[data-act=delWin]');click('[data-act=delWin]');await wait(50);
 ok(!S.facts.some(f=>f.id==='fw')&&ran.ok===false&&!ran.upTo,'deleting the win leaves a rejected fact switched off');
 await wait(200);w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
