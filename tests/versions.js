const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
require('fs').mkdirSync(require('path').join(__dirname,'out'),{recursive:true});
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const saved=[];let n=0;
 const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',url:'file://'+path.join(__dirname,'../index.html'),pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  const sample=async()=>({text:'x'});sample.json=async(prompt)=>{const S=w.__re.S;
   if(prompt.startsWith('You are a master')){n++;const rev=prompt.includes('REVISION TASK');return{headline:'Partner Development Manager | Channel Partnerships',summary:'Channel partnerships leader who builds distribution programs across Ingram Micro and TD SYNNEX. '+(rev?'Drives partner enablement at scale.':'Known for 99 wins.'),skills:[{group:'Partnerships',items:['channel partnerships',rev?'partner enablement':'alliances']},{group:'Tools',items:['Salesforce','HubSpot']}],experience:[{roleId:'r1',bullets:[{text:'Signed 12 new distribution partners including Ingram Micro and TD SYNNEX in 6 months',facts:['f1']},{text:'Ran partner enablement training for reseller sales teams across three regions with quarterly refreshers and certification tracks',facts:['f2']}]},{roleId:'r2',bullets:[{text:'Managed reseller accounts',facts:['f3']}]}],projects:[{name:'Side project',text:'Built an internal partner portal',facts:['f3']}],education:[{text:'B.S. Business, Example University'}],certifications:[{text:'Example Cloud Certification'}],gaps:[]}}
   throw{code:'invalid_json'}};
  w.claude={use:async k=>k==='sample'?sample:k==='downloads'?{save:async o=>{saved.push(o);return{status:'saved'}}}:null}}});
 const w=dom.window,d=w.document;await wait(300);const R=w.__re,S=R.S;
 S.profile={name:'Sample Person',email:'s@example.com',phone:'555-0100',location:'Princeton, NJ',links:['linkedin.com/in/sample']};
 S.roles=[{id:'r1',company:'Acme XR',title:'Channel Manager',location:'Remote',start:'Jan 2026',end:'Present'},{id:'r2',company:'OldCo',title:'Partner Lead',start:'Mar 2019',end:'Dec 2025'}];
 S.facts=[{id:'f1',kind:'achievement',text:'Signed 12 new distribution partners including Ingram Micro and TD SYNNEX in 6 months',roleId:'r1'},{id:'f2',kind:'responsibility',text:'Ran partner enablement training',roleId:'r1'},{id:'f3',kind:'responsibility',text:'Managed reseller accounts',roleId:'r2'}];
 S.jobs=[{id:'j1',company:'ExampleCo',title:'PDM',jdText:'x',status:'Saved',addedAt:1,analysis:{keywords:[{term:'channel partnerships',weight:3},{term:'partner enablement',weight:3},{term:'Salesforce',weight:1}]}}];
 const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('no '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 const change=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('change',{bubbles:true}))};
 w.location.hash='tailor';await wait(30);R.render();click('[data-act=tailor]');await wait(200);click('[data-act=revise]');await wait(200);
 console.log('versions',S.resumes.map(v=>v.label+':'+v.kind+':'+v.from).join(' '),'rows',d.querySelectorAll('.ver').length);
 const v1=S.resumes[0],v2=S.resumes[1];
 click('[data-act=cmpVer][data-id='+v1.id+']');console.log('diff add/del',d.querySelectorAll('.diff .add').length,d.querySelectorAll('.diff .del').length);
 // edit a line → orig kept, edited chip; undo
 const sp=d.querySelector('.sheet [data-path="experience.0.0"]');sp.textContent='Signed 12 partners fast';sp.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true}));
 console.log('edited',!!v2.orig,v2.resume.experience[0].bullets[0].text,'chip',!!d.querySelector('.ver.on .chip.have'));
 click('[data-act=resetEdits]');click('[data-act=resetEdits]');console.log('undo',!v2.orig,v2.resume.experience[0].bullets[0].text.slice(0,20));
 // rename, duplicate, mark sent → lock + job status
 const lb=d.querySelector('.ver.on .vlabel');lb.textContent='Final for recruiter';lb.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true}));
 click('.ver.on [data-act=markSent]');console.log('label',v2.label,'sent',!!v2.sentAt,'job',S.jobs[0].status,'editable spans',d.querySelectorAll('.sheet [contenteditable]').length,'banner',!!d.querySelector('.banner'));
 click('.ver.on [data-act=dupVer]');const v3=S.resumes[2];console.log('dup',v3.label,v3.kind,v3.from,'open',S.ui.resId===v3.id,'editable',d.querySelectorAll('.sheet [contenteditable]').length>0);
 // templates → export each
 S.resumes.forEach(r=>{r.numsOk=R.numSig(r.resume)});
 for(const k of Object.keys(R.TPL)){change('#tpl',k);click('[data-act=export][data-id=pdf]');await wait(k==='classic'?2500:300);const s=saved.pop();const buf=Buffer.from(await new Promise(res=>{const fr=new w.FileReader();fr.onload=()=>res(fr.result);fr.readAsArrayBuffer(s.data)}));fs.writeFileSync(path.join(__dirname,'out','tpl-'+k+'.pdf'),buf);
  const X=require('docx');w.docx=X;fs.writeFileSync(path.join(__dirname,'out','tpl-'+k+'.docx'),await X.Packer.toBuffer(R.buildDocx(v3.resume,R.TPL[k])));
  console.log(k,'pdf',buf.length,'sheet font',d.querySelector('.sheet').style.fontFamily.slice(0,18),'h5',[...d.querySelectorAll('.sheet h5')].map(x=>x.textContent).join('/'))}
 console.log('profile tpl',S.profile.tpl,'v3 tpl',v3.tpl);w.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
