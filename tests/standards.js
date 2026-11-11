// Resume standards: facts are approved only when they match the user's own material, and every version is checked
// for clean parsing, recruiter search and a human voice.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');const tap=require('./tap');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const SOURCE='Channel Manager, Acme XR, Jan 2026 - Present. Signed 12 new distribution partners including Ingram Micro and TD SYNNEX in 6 months. Ran partner enablement training for reseller sales teams. Tools: Salesforce.';
const EXTRACT={profile:{name:'Sample Person',email:'s@example.com',phone:'555-0100'},roles:[{company:'Acme XR',title:'Channel Manager',start:'Jan 2026',end:'Present'}],facts:[
 {kind:'achievement',text:'Signed 12 new distribution partners, including Ingram Micro and TD SYNNEX, in 6 months',company:'Acme XR',title:'Channel Manager'},
 {kind:'responsibility',text:'Ran partner enablement training for reseller sales teams',company:'Acme XR',title:'Channel Manager'},
 {kind:'achievement',text:'Signed 15 new distribution partners in 6 months',company:'Acme XR',title:'Channel Manager'},
 {kind:'achievement',text:'Recognized as a visionary leader who transformed global alliances strategy',company:'Acme XR',title:'Channel Manager'}]};
(async()=>{const prompts=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tester.example/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextDecoder=TextDecoder;
  w.fetch=async(u,o)=>{const p=JSON.parse(o.body).messages[0].content;prompts.push(p);const S=w.__re.S;
   const out=p.startsWith('You are building')?EXTRACT:{headline:'Channel leader',summary:'Dynamic, results-driven leader — I leveraged partnerships.',skills:[{group:'Core',items:['Salesforce']}],
    experience:[{roleId:S.roles[0].id,bullets:['Spearheaded distribution partner signings across the channel','Spearheaded partner enablement training for reseller teams','Spearheaded growth in the partner ecosystem overall','Managed search engine optimization for partner pages','Managed the weekly partner pipeline review meeting','Managed onboarding for every newly signed partner'].map(t=>({text:t,facts:[S.facts[0].id]}))}],education:[{text:'B.S. Business'}],gaps:[]};
   return{ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(out)},finish_reason:'stop'}]})}}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';R.render();
 const click=sel=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const type=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 // facts
 type('#srcText',SOURCE);click('[data-act=addSource]');await wait(200);
 const f=S.facts;ok(f.length===4,'four facts extracted');
 ok(f[0].ok===true&&f[1].ok===true,'facts that match the uploaded source are approved, even when lightly reworded');
 ok(f[2].ok===false&&f[2].match===false,'a fact whose number is not in the source waits for approval');
 ok(f[3].ok===false,'a fact with wording the source does not contain waits for approval');
 ok(d.querySelector('#toast').textContent.includes('2 could not be matched'),'the user is told how many facts need approval');
 w.location.hash='facts';await wait(30);R.render();
 ok(d.querySelectorAll('.chip.have').length===2&&!!d.querySelector('.banner'),'pending facts are marked in the Fact base');
 const box=d.querySelector('#ok-'+f[3].id);box.checked=true;box.dispatchEvent(new w.Event('change',{bubbles:true}));
 ok(f[3].ok===false&&box.checked===false,'GUARDRAIL: a script cannot approve an unmatched fact');
 // prompt and dates
 S.jobs=[{id:'j1',company:'ExampleCo',title:'Channel Partnerships Manager',jdText:'x',status:'Saved',addedAt:1,analysis:{keywords:[{term:'search engine optimization',variants:['SEO'],weight:2},{term:'Salesforce',weight:1}]}}];
 S.ui.jobId='j1';w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(200);
 const wp=prompts[prompts.length-1];
 ok(prompts.length>=2&&prompts.every(x=>x.includes('WRITING RULE FOR ALL TEXT IN YOUR ANSWER: never use an em dash')),'the no-long-dash rule rides on every request the app makes, not only resume writing');
 ok(wp.includes('Never use an em dash')&&wp.includes('recruiters search it by job title')&&wp.includes('spearheaded'),'the writer is told the human-voice and search rules up front');
 ok(!wp.includes('visionary')&&!wp.includes('Signed 15'),'unapproved facts are never sent to the writer');
 ok(R.roleDates(S.roles[0])==='Jan 2026 - Present','date ranges use a plain hyphen');
 // checks
 const rec=S.resumes[0],checks=R.atsChecks(rec.resume,R.flagsFor(rec.resume),S.jobs[0]),bad=checks.filter(c=>!c.ok).map(c=>c.label).join(' | ');
 ok(/long dashes/.test(bad),'check: long dashes are flagged');
 ok(/dynamic/.test(bad)&&/spearheaded/.test(bad)&&/leveraged/.test(bad),'check: filler and machine-sounding words are flagged');
 ok(/keep opening with: spearheaded, managed/.test(bad),'check: repeated bullet openings are flagged');
 ok(/First-person/.test(bad),'check: first-person wording is flagged');
 ok(/same length/.test(bad),'check: uniform bullet rhythm is flagged');
 ok(/job title appears/.test(bad),'check: missing job title is flagged');
 ok(/search engine optimization \(SEO\)/.test(bad),'check: abbreviation without its pair is flagged');
 ok(/name no number, product, partner or place/.test(bad),'check: generic bullets are flagged');
 ok(checks.filter(c=>c.g==='ats').length>=8&&checks.filter(c=>c.g==='human').length>=7,'checks are grouped into parsing and human voice');
 // revise carries the failed checks; nothing is rewritten silently
 ok(rec.resume.summary.includes('—'),'the text is not altered silently; the user decides');
 click('[data-act=revise]');await wait(200);const rp=prompts[prompts.length-1];
 ok(rp.includes('Also fix these')&&rp.includes('Remove every em dash')&&rp.includes('Vary how bullets open'),'Revise sends the failed checks to the writer');
 w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
