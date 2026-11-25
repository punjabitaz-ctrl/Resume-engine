// Fixes from the launch review: private reports, one tab, local-only http, usage, hostile backups, recording safety, versions, headers.
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const html=require('./load')();const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
const root=path.join(__dirname,'..'),js=fs.readdirSync(path.join(root,'js')).map(f=>fs.readFileSync(path.join(root,'js',f),'utf8')).join('\n');
const boot=(opt={})=>new JSDOM(html,{runScripts:'dangerously',url:'http://localhost:8000/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};
 Object.defineProperty(w,'crypto',{value:require('crypto').webcrypto,configurable:true});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
 const f=require('fake-indexeddb');w.indexedDB=opt.idb||new f.IDBFactory();w.structuredClone=w.structuredClone||(o=>JSON.parse(JSON.stringify(o)));
 Object.defineProperty(w.navigator,'storage',{value:{persisted:async()=>true,persist:async()=>true},configurable:true});
 if(opt.locks)Object.defineProperty(w.navigator,'locks',{value:opt.locks,configurable:true});
 w.localStorage.setItem('resume-engine-prefs',JSON.stringify({tourDone:1}));
 if(opt.fetch)w.fetch=opt.fetch}});
(async()=>{
 // versions and headers
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));const av=(js.match(/APP_VERSION='([\d.]+)'/)||[])[1];
 ok(pkg.version===av,'package.json and the app show the same version ('+av+')');
 const hd=fs.readFileSync(path.join(root,'_headers'),'utf8'),meta=(js.match(/m\.content="([^"]+)"/)||[])[1];
 ok(hd.includes('Content-Security-Policy: '+meta+"; frame-ancestors 'none'")&&/X-Frame-Options: DENY/.test(hd)&&/Referrer-Policy: no-referrer/.test(hd),'the hosted copy sends the same content policy as the page, plus no framing and no referrer');
 ok(!/connect-src[^;]*\bhttp:(;| )/.test(meta)&&/http:\/\/localhost:\*/.test(meta),'plain http connections are allowed only to this computer');
 ok(fs.existsSync(path.join(root,'.github/workflows/test.yml'))&&/npm test/.test(fs.readFileSync(path.join(root,'.github/workflows/test.yml'),'utf8')),'GitHub runs the full test suite on every push');
 ok(!fs.existsSync(path.join(root,'HANDOFF.md'))&&!fs.existsSync(path.join(root,'ROADMAP.md')),'working notes are not in the public repo');
 // colour contrast of success text in the light theme
 const css=fs.readFileSync(path.join(root,'app.css'),'utf8'),L=h=>{const c=[0,2,4].map(i=>parseInt(h.slice(i+1,i+3),16)/255).map(x=>x<=0.03928?x/12.92:((x+0.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 const g=css.match(/:root\{[\s\S]*?--good:(#[0-9a-f]{6}); --good-soft:(#[0-9a-f]{6})/i),cr=(a,b)=>{a=L(a);b=L(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
 ok(g&&cr(g[1],g[2])>=4.5&&cr(g[1],'#ffffff')>=4.5,'green text meets the 4.5 to 1 readability standard on its pale background and on white');
 const fg=css.match(/:root\{[\s\S]*?--gold:(#[0-9a-f]{6});[\s\S]*?--head:(#[0-9a-f]{6})/i),fk=css.match(/:root\[data-theme="dark"\]\{[\s\S]*?--head:(#[0-9a-f]{6})/i);
 ok(/header\.top :focus-visible\{outline-color:var\(--gold\)\}/.test(css)&&fg&&fk&&cr(fg[1],fg[2])>=3&&cr(fg[1],fk[1])>=3,'the keyboard focus ring in the navy top bar is gold and meets 3 to 1 in both themes');
 // one tab at a time
 const held=new Set(),locks={request:async(name,o,cb)=>{if(held.has(name))return cb(null);held.add(name);return cb({name})}};
 let a=boot({locks});await wait(300);ok(a.window.__re.S.ready===true,'the first tab loads normally');
 const b=boot({locks});await wait(300);const bt=b.window.document.querySelector('#view').textContent;
 ok(b.window.__re.S.ready!==true&&bt.includes('already open in another tab'),'a second tab loads nothing and says the app is open in another tab');
 b.window.close();a.window.close();
 // private problem report
 let calls=0;const reply=o=>({ok:true,headers:{get:()=>'application/json'},json:async()=>Object.assign({choices:[{message:{content:JSON.stringify(o)},finish_reason:'stop'}]},calls%2?{}:{usage:{prompt_tokens:1200,completion_tokens:300}})});
 const c=boot({fetch:async(u)=>{calls++;return reply({profile:{},roles:[],facts:[]})}});await wait(300);const w=c.window,d=w.document,R=w.__re,S=R.S;
 const click=sel=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 w.location.hash='data';await wait(30);R.render();
 ok(!d.querySelector('#view').innerHTML.includes('issues/new')&&!/GitHub issue/.test(d.querySelector('#view').textContent),'Setup no longer sends testers to a public GitHub issue');
 S.ui.draft.fbText='PDF upload stopped.';const link=d.querySelector('[data-issue]');link.addEventListener('click',e=>e.preventDefault());link.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 const href=decodeURIComponent(link.href);ok(href.startsWith('mailto:hello@tazabbas.com?subject=Resume Engine problem: PDF upload stopped.')&&href.includes('Version: '+R.APP_VERSION)&&link.href.length<2600,'Email this report opens the tester’s own mail, addressed privately, with the report filled in');
 // http only to this computer
 const base=d.querySelector('#aiBase');base.value='http://192.168.1.20:1234/v1';base.dispatchEvent(new w.Event('change',{bubbles:true}));ok(R.AI.cfg.baseUrl!=='http://192.168.1.20:1234/v1'&&/only for a server on this computer/.test(d.querySelector('#toast').textContent),'a plain http address on another machine is refused with a reason');
 base.value='http://localhost:11434/v1';base.dispatchEvent(new w.Event('change',{bubbles:true}));ok(R.AI.cfg.baseUrl==='http://localhost:11434/v1','a local model address is accepted');
 R.AI.cfg.baseUrl='http://example.com/v1';let threw=null;try{R.AI.url('/x')}catch(e){threw=e}ok(threw&&/https/.test(threw.message),'a saved plain http address elsewhere is never called');
 // usage this session
 R.AI.cfg.baseUrl='https://api.example/v1';R.AI.cfg.model='m';R.AI.cfg.stream=false;
 await R.AI.complete('one');await R.AI.complete('two');R.render();const vt=d.querySelector('#view').textContent;
 ok(R.AI.used.calls===2&&R.AI.used.inT===1200&&R.AI.used.outT===300&&R.AI.used.unk===1&&vt.includes('2 requests')&&vt.includes('1,200 tokens sent'),'Setup shows requests and tokens used this session, as the provider reported them');
 ok(vt.includes('saved unencrypted in this browser'),'Setup says plainly where a remembered key is kept');
 // a hostile backup cannot add markup through a mock interview
 S.jobs.push({id:'j1',company:'Acme',title:'Partner Manager',status:'Applied',prep:{rounds:[],mocks:[{id:'m1',at:Date.now(),stage:'screen',level:'mid',n:3,asked:1,turns:[{who:'them"><img src=x id=pwn>',text:'Hi'},{who:'me',text:'Hello'}],report:null}]}});
 S.ui.mock={id:'m1',jobId:'j1',stage:'screen',level:'mid',n:3,asked:1,turns:[{who:'them"><img src=x id=pwn2>',text:'Hi'}],report:null};
 w.location.hash='practice';await wait(30);R.render();ok(!d.querySelector('#pwn')&&!d.querySelector('#pwn2')&&d.querySelector('.msg.me'),'a crafted speaker label in saved data cannot add markup to the page');
 // recording: size shown, leaving the page warns while audio is unsaved
 R.Rec.blob=new w.Blob([new Uint8Array(30e6)],{type:'audio/webm'});R.Rec.saved=false;w.location.hash='calls';await wait(30);R.render();
 ok(/30 MB: too large for most hosted Whisper/.test(d.querySelector('#view').textContent),'a recording too large for hosted Whisper says so, with its size');
 const ev=new w.Event('beforeunload',{cancelable:true});w.dispatchEvent(ev);ok(ev.defaultPrevented,'leaving the page with unsaved audio asks first');
 R.Rec.saved=true;const ev2=new w.Event('beforeunload',{cancelable:true});w.dispatchEvent(ev2);ok(!ev2.defaultPrevented,'once the audio is saved, leaving does not ask');
 R.Rec.blob=null;
 // delete everything says what it does not touch
 w.location.hash='data';await wait(30);R.render();ok(/stay where they are/.test(d.querySelector('[data-act=wipe]').dataset.confirm),'Delete everything says backup files elsewhere are not deleted');
 ok(!/[–—]/.test(d.querySelector('#view').textContent),'no long dashes on screen');
 w.close();
})();
