// Backup to Google Drive or OneDrive through the folder their app keeps in sync.
const {JSDOM}=require('jsdom');
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const boot=async(withPicker)=>{const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost:8000/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};
  Object.defineProperty(w,'crypto',{value:require('crypto').webcrypto,configurable:true});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  const f=require('fake-indexeddb');w.indexedDB=new f.IDBFactory();w.structuredClone=w.structuredClone||(o=>JSON.parse(JSON.stringify(o)));
  Object.defineProperty(w.navigator,'storage',{value:{persisted:async()=>true,persist:async()=>true},configurable:true});
  w.URL.createObjectURL=()=>'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){w.__saved=(w.__saved||0)+1};
  w.localStorage.setItem('resume-engine-prefs',JSON.stringify({tourDone:1}));
  if(withPicker){w.__files={};w.__picks=0;w.__perm='granted';w.__name='My Drive';
   w.showDirectoryPicker=async()=>{w.__picks++;if(w.__cancel)throw new w.DOMException('cancelled','AbortError');const name=w.__name;return{kind:'directory',name,
    queryPermission:async()=>w.__perm,requestPermission:async()=>w.__perm,
    getFileHandle:async(n,o)=>{if(w.__fail)throw new Error('locked');return{createWritable:async()=>{let buf='';return{write:async d=>{buf+=d},close:async()=>{w.__files[name+'/'+n]=buf}}}}}}}}}});
 await wait(300);return dom};
(async()=>{
 // no folder access: no buttons, a plain note instead
 let dom=await boot(false),w=dom.window,d=w.document;w.location.hash='data';await wait(30);w.__re.render();
 ok(!d.querySelector('[data-act=cloudBackup]')&&d.querySelector('#view').textContent.includes('open the app in Chrome or Edge'),'a browser without folder access gets a note, not buttons that cannot work');
 w.close();
 dom=await boot(true);w=dom.window;d=w.document;const R=w.__re,S=R.S;
 S.facts.push({id:'f1',kind:'responsibility',text:'Ran partner enablement for 40 resellers',ok:true});R.Store.state('facts');
 w.location.hash='data';await wait(30);R.render();
 const click=sel=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const pass=(a,b)=>{d.querySelector('#bkPass').value=a;d.querySelector('#bkPass2').value=b===undefined?a:b};
 ok(!!d.querySelector('[data-act=cloudBackup][data-id=gdrive]')&&!!d.querySelector('[data-act=cloudBackup][data-id=onedrive]'),'Setup offers Google Drive and OneDrive next to the download');
 pass('short');click('[data-act=cloudBackup][data-id=gdrive]');await wait(50);ok(w.__picks===0,'a short password stops the backup before any folder is asked for');
 pass('a long password 1','different one');click('[data-act=cloudBackup][data-id=gdrive]');await wait(50);ok(w.__picks===0,'mismatched passwords stop it too');
 w.__cancel=true;pass('a long password 1');click('[data-act=cloudBackup][data-id=gdrive]');await wait(100);ok(w.__picks===1&&!Object.keys(w.__files).length&&!R.Prefs.get().cloud_gdrive,'cancelling the folder choice saves nothing');
 w.__cancel=false;pass('a long password 1');click('[data-act=cloudBackup][data-id=gdrive]');for(let i=0;i<60&&!Object.keys(w.__files).length;i++)await wait(100);
 const key=Object.keys(w.__files)[0]||'',file=JSON.parse(w.__files[key]||'{}');
 ok(/^My Drive\/resume-engine-backup-\d{4}-\d\d-\d\d\.json$/.test(key),'the backup is written into the chosen Google Drive folder');
 ok(file.locked===true&&file.cipher==='AES-256-GCM'&&!w.__files[key].includes('resellers'),'the file is locked before it is written, so the content cannot be read');
 const back=await R.unlockBackup?await R.unlockBackup(file,'a long password 1'):null;
 if(back)ok(back.facts.some(f=>f.text.includes('40 resellers')),'the same password opens it again');
 ok(R.Prefs.get().cloud_gdrive>0&&R.Prefs.get().backupAt>0&&d.querySelector('#view').textContent.includes('Last saved to Google Drive'),'Setup shows when it was last saved there and counts it as a backup');
 ok(!d.querySelector('#bkPass').value,'the password fields are cleared');
 pass('a long password 1');click('[data-act=cloudBackup][data-id=gdrive]');await wait(1500);ok(w.__picks===2&&Object.keys(w.__files).length===1,'the next Google Drive backup goes to the same folder without asking again');
 w.__name='Downloads';pass('a long password 1');click('[data-act=cloudBackup][data-id=onedrive]');for(let i=0;i<60&&!Object.keys(w.__files).some(k=>k.startsWith('Downloads/'));i++)await wait(100);
 ok(w.__picks===3&&/inside your OneDrive folder/.test(d.body.innerHTML),'a folder that does not look like OneDrive gets a warning');
 w.__perm='denied';pass('a long password 1');click('[data-act=cloudBackup][data-id=onedrive]');await wait(200);ok(w.__picks===4,'if permission to the folder is gone, it asks for the folder again');
 w.__perm='granted';
 click('[data-act=cloudForget][data-id=gdrive]');await wait(50);ok(!R.Prefs.get().cloud_gdrive&&!R.Folders.mem.gdrive,'Change folder forgets the Google Drive folder');
 w.__fail=true;pass('a long password 1');click('[data-act=cloudBackup][data-id=gdrive]');for(let i=0;i<60&&!/Could not write/.test(d.body.innerHTML);i++)await wait(100);ok(/Could not write to that folder/.test(d.body.innerHTML)&&!R.Folders.mem.gdrive,'a failed write says so and forgets the folder');
 w.__fail=false;click('[data-act=wipe]');await wait(20);click('[data-act=wipe]');await wait(80);ok(!R.Folders.mem.onedrive,'Delete everything also forgets the backup folders');
 ok(!/[–—]/.test(d.querySelector('#view').textContent),'no long dashes on screen');
 w.close();
})();
