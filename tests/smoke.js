const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
require('fs').mkdirSync(require('path').join(__dirname,'out'),{recursive:true});
const html=require('./load')();
const JD=`Partner Development Manager, AI Platforms at ExampleCo. You will build and manage channel partnerships with distributors and resellers, drive partner enablement, own co-sell revenue targets, and launch go-to-market programs for generative AI products. Requirements: 10+ years in partnerships or channel sales; experience with distribution (Ingram Micro, TD SYNNEX); partner enablement; XR or AI hardware a plus; Salesforce.`.repeat(2);
const canned={
 extract:{profile:{name:'Sample Person',email:'s@example.com',phone:'555-0100',location:'Princeton, NJ',links:['linkedin.com/in/sample']},roles:[{company:'Acme XR',title:'Channel Manager',location:'Remote',start:'Jan 2026',end:'Present'},{company:'OldCo',title:'Partner Lead',start:'Mar 2019',end:'Dec 2025'}],facts:[{kind:'achievement',text:'Signed 12 new distribution partners including Ingram Micro and TD SYNNEX in 6 months',company:'Acme XR',title:'Channel Manager',tags:['distribution']},{kind:'responsibility',text:'Ran partner enablement training for reseller sales teams',company:'OldCo',title:'Partner Lead',tags:['enablement']},{kind:'skill',text:'Salesforce, HubSpot, channel partnerships, go-to-market programs',tags:['tools']},{kind:'education',text:'B.S. Business, Example University'}]},
 job:{company:'ExampleCo',title:'Partner Development Manager',summary:'Build channel.',mustHaves:['10+ years partnerships'],keywords:[{term:'channel partnerships',variants:['channel partner'],weight:3},{term:'partner enablement',weight:3},{term:'Ingram Micro',weight:2},{term:'co-sell',variants:['co sell'],weight:2},{term:'generative AI',variants:['GenAI'],weight:3},{term:'Salesforce',weight:1}]},
 iv:{questions:[{q:'What revenue came from the 12 partners?',why:'adds a result',company:'Acme XR',title:'Channel Manager'}]}
};
(async()=>{
 const saved=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',url:'file://'+path.join(__dirname,'../index.html'),pretendToBeVisual:true,beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
   w.scrollTo=()=>{};
   const sample=async()=>({text:'x'});
   sample.json=async(prompt,opts)=>{opts.onText&&opts.onText({text:'{}',delta:'{}'});
     if(prompt.startsWith('You are building'))return JSON.parse(JSON.stringify(canned.extract));
     if(prompt.startsWith('Analyze this job'))return JSON.parse(JSON.stringify(canned.job));
     if(prompt.includes('intake interview'))return canned.iv;
     if(prompt.startsWith('You are a master')){const S=w.__re.S;const f=S.facts;const r=S.roles;w.__lastPrompt=prompt;
       return {headline:'Partner Development Manager | Channel Partnerships',summary:'Channel partnerships leader with 20 years of experience.',skills:[{group:'Partnerships',items:['channel partnerships','partner enablement','Salesforce']}],
        experience:[{roleId:r[0].id,company:'WRONG',title:'WRONG',dates:'x',bullets:[{text:'Signed 12 distribution partners including Ingram Micro and TD SYNNEX in 6 months, growing revenue 45%',facts:[f[0].id]},{text:'Built co-sell motions with resellers',facts:[]}]},{roleId:r[1].id,bullets:[{text:'Ran partner enablement training for reseller sales teams',facts:[f[1].id,'bogus']}]}],
        education:[{text:'B.S. Business, Example University'}],certifications:[],projects:[],gaps:[{requirement:'generative AI products',note:'add AI project facts'}],notes:'Angle.'}}
     throw {code:'invalid_json'}};
   w.claude={use:async n=>n==='sample'?sample:n==='downloads'?{save:async o=>{saved.push(o);return{status:'saved'}}}:null};
 }});
 const w=dom.window,d=w.document;const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const errs=[];w.addEventListener('error',e=>errs.push(e.message));dom.virtualConsole.on('jsdomError',e=>errs.push(String(e)));
 await wait(300);
 const R=w.__re,S=R.S;const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const type=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 console.log('mode',R.Store.mode,'tabs',d.querySelectorAll('#tabs a').length);
 type('#srcText','Sample Person. '+canned.extract.facts.map(f=>f.text).join('. ')+'.');click('[data-act=addSource]');await wait(200);
 console.log('facts',S.facts.length,'roles',S.roles.length,'profile',S.profile.name);
 for(const t of ['facts','interview','memory','jobs']){w.location.hash=t;await wait(30);R.render();console.log(t,d.querySelector('#view').textContent.length)}
 type('#jobText',JD);click('[data-act=addJob]');await wait(200);
 console.log('jobs',S.jobs.length,'kw',S.jobs[0].analysis.keywords.length,'fit',R.scoreText(S.jobs[0],S.facts.map(f=>f.text).join(' ')).pct);
 click('[data-act=openTailor]');await wait(30);click('[data-act=tailor]');await wait(200);
 const rec=S.resumes[0];console.log('versions',S.resumes.length,'role0',rec.resume.experience[0].company,rec.resume.experience[0].dates,'cites',JSON.stringify(rec.resume.experience[1].bullets[0].facts.length));
 const flags=R.flagsFor(rec.resume);console.log('flags',JSON.stringify(flags.map(f=>[f.where,f.nums,!!f.nosrc])));
 const sc=R.scoreText(S.jobs[0],R.resumeText(rec.resume));console.log('score',sc.pct,'miss',sc.miss.map(k=>k.term));
 console.log('checks',JSON.stringify(R.atsChecks(rec.resume,flags).map(c=>c.ok)));
 console.log('flagged spans',d.querySelectorAll('.sheet .flag').length,'chips',d.querySelectorAll('.chip.miss,.chip.have').length);
 console.log('prompt has facts',w.__lastPrompt.includes(S.facts[0].id),w.__lastPrompt.length);
 // interview
 w.location.hash='interview';await wait(30);R.render();click('[data-act=genQuestions]');await wait(100);type('#iva0','They produced 3 million dollars');click('[data-act=saveAnswers]');await wait(150);console.log('sources',S.sources.length);
 // exports
 w.location.hash='tailor';await wait(30);R.render();
 click('[data-act=export][data-id=docx]');await wait(2500);click('[data-act=export][data-id=pdf]');await wait(2500);click('[data-act=export][data-id=txt]');await wait(200);
 for(const s of saved){let buf;if(typeof s.data==='string')buf=Buffer.from(s.data);else buf=Buffer.from(await new Promise(res=>{const fr=new w.FileReader();fr.onload=()=>res(fr.result);fr.readAsArrayBuffer(s.data)}));const out=path.join(__dirname,'out','out.'+s.filename.split('.').pop());fs.writeFileSync(out,buf);console.log('saved',s.filename,buf.length)}
 console.log('toast',d.querySelector('#toast').textContent,'errors',errs);
 console.log('unit',R.hasTerm('Led go-to-market programs.','go to market program'),R.hasTerm('channel partner work','channel partnerships'),R.unverifiedNums('grew 1,200 to $3.5M','1200 and 3.5'),R.dateKey('Mar 2019'),R.dateKey('Present'));
 w.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
