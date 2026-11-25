// First hour for a tester: the start guide, the backup reminder, the request to keep data, cut documents and opening from a file.
const {JSDOM}=require('jsdom');const path=require('path');
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const EXTRACT={profile:{name:'Sample Person'},roles:[{company:'Acme',title:'Manager',start:'Jan 2020',end:'Present'}],facts:[{kind:'responsibility',text:'Ran partner enablement training for reseller sales teams',company:'Acme',title:'Manager'}]};
const reply=o=>({ok:true,headers:{get:()=>'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify(o)},finish_reason:'stop'}]})});
function mk(url,{persist=true}={}){let calls=0;const dom=new JSDOM(html,{runScripts:'dangerously',url,pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};
  Object.defineProperty(w,'crypto',{value:require('crypto').webcrypto,configurable:true});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  const f=require('fake-indexeddb');w.indexedDB=new f.IDBFactory();w.structuredClone=w.structuredClone||(o=>JSON.parse(JSON.stringify(o)));
  w.__asked=0;Object.defineProperty(w.navigator,'storage',{value:{persisted:async()=>false,persist:async()=>{w.__asked++;return persist}},configurable:true});
  w.URL.createObjectURL=()=>'blob:test';w.HTMLAnchorElement.prototype.click=function(){};w.URL.revokeObjectURL=()=>{};
  w.fetch=async()=>{calls++;return reply(EXTRACT)}}});const w=dom.window;return{w,d:w.document,calls:()=>calls}}
(async()=>{
 let {w,d}=mk('https://tester.example/');await wait(300);let R=w.__re,S=R.S;
 const click=sel=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const type=(sel,v)=>{const el=d.querySelector(sel);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 const view=()=>d.querySelector('#view').innerHTML;
 const go=async h=>{w.location.hash=h;await wait(30);R.render()};
 // 1. the start guide on a fresh copy
 await go('sources');
 ok(view().includes('Start here')&&view().includes('0 of 7 done'),'a fresh copy opens on a seven-step start guide with nothing ticked');
 ok(!d.querySelector('#view .steps'),'the older step strip stays out of the way while the guide is shown');
 ok(!d.querySelector('[data-nag=backup]'),'no backup reminder before there is anything to back up');
 ok(w.__asked===0,'the browser is not asked to keep data before there is any');
 // 2. connect an engine, add a resume
 R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';
 type('#srcText','Sample Person. Ran partner enablement training for reseller sales teams at Acme.');click('[data-act=addSource]');await wait(300);await go('sources');
 ok(S.sources.length===1&&S.sources[0].type==='resume','a resume source is added');
 ok(view().includes('3 of 7 done'),'the guide ticks the engine, the resume and the facts review from the user\u2019s own data');
 ok(!!d.querySelector('[data-nag=backup]')&&d.querySelector('[data-nag=backup]').textContent.includes('not downloaded a backup yet'),'once there is work and no backup, a reminder asks for one');
 ok(w.__asked===1&&S.ui.persist==='kept','the first change asks the browser to keep the data, once');
 // 3. Setup shows the state, and the reminder is not repeated there
 await go('data');
 ok(!d.querySelector('[data-nag=backup]'),'the reminder is not shown on the Setup tab itself');
 const keep=d.querySelector('[data-keep]').textContent;ok(keep.includes('Last backup: none yet')&&keep.includes('agreed to keep'),'Setup shows that no backup exists yet and what the browser promised');
 // 4. a locked backup clears the reminder
 type('#bkPass','correct horse battery');type('#bkPass2','correct horse battery');click('[data-act=exportBackup]');await wait(400);
 const p=R.Prefs.get();ok(p.backupAt>0&&!p.changedAt,'a downloaded backup is recorded, with no content kept');
 await go('sources');ok(!d.querySelector('[data-nag=backup]')&&view().includes('4 of 7 done'),'after the backup the reminder goes and the guide ticks the backup step');
 // 5. later changes bring it back after a while, not at once
 R.Store.state('facts');await wait(50);await go('sources');
 ok(!d.querySelector('[data-nag=backup]'),'a fresh change does not nag straight away');
 R.Prefs.set({changedAt:Date.now()-R.NAG_MS-1000});await go('sources');
 ok(d.querySelector('[data-nag=backup]')&&d.querySelector('[data-nag=backup]').textContent.includes('changes since your last backup'),'changes older than 20 minutes with no backup bring the reminder back');
 // 6. hiding and showing the guide
 click('[data-act=guideHide]');await wait(30);
 ok(!view().includes('Start here')&&!!d.querySelector('#view .steps'),'hiding the guide brings back the step strip');
 await go('data');ok(!!d.querySelector('[data-act=guideShow]'),'Setup offers the guide again');
 click('[data-act=guideShow]');await wait(30);await go('sources');ok(view().includes('Start here'),'the guide comes back');
 // 7. a document too long to read in full says so
 R.AI.cfg.chunk=1000;const long=Array.from({length:400},(_,i)=>'Line '+i+' of a very long document about partner programs and enablement work.').join('\n');
 type('#srcText',long);click('[data-act=addSource]');await wait(600);await go('sources');
 const cut=S.sources.find(s=>s.cut);ok(cut&&cut.cut.read===9&&cut.cut.of>9&&cut.cut.left>0,'a document cut to 9 parts records how much was left out');
 ok(view().includes('Too long to read in full'),'the source shows that its end was not read');
 // 8. delete everything clears the settings too
 w.location.hash='data';await wait(30);R.render();click('[data-act=wipe]');await wait(20);click('[data-act=wipe]');await wait(100);
 ok(!w.localStorage.getItem('resume-engine-prefs'),'delete everything also clears the guide and backup settings');
 w.close();
 // 9. opened straight from a file
 ({w,d}=mk('file://'+path.join(__dirname,'../index.html')));await wait(300);w.__re.render();
 ok(!!d.querySelector('[data-nag=file]'),'opening the page from a file warns and points to the start file');
 w.close();
 // 10. a browser that will not promise to keep data
 ({w,d}=mk('https://tester.example/',{persist:false}));await wait(300);R=w.__re;R.AI.cfg.baseUrl='http://localhost:1/v1';R.AI.cfg.model='m';
 d.querySelector('#srcText').value='Sample Person. Ran partner enablement training.';d.querySelector('#srcText').dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('[data-act=addSource]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(300);w.location.hash='data';await wait(30);R.render();
 ok(R.S.ui.persist==='not yet'&&d.querySelector('[data-keep]').textContent.includes('backup is your safety net'),'when the browser makes no promise, Setup says the backup is the safety net');
 w.close();
})();
