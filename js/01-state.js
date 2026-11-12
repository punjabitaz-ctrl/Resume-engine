"use strict";
/* ---------- state ---------- */
const S={profile:{},roles:[],facts:[],memory:[],sources:[],jobs:[],resumes:[],ui:{draft:{},jobId:null,resId:null,q:'',iv:null,imp:null,proposal:null,repairOnce:false,incident:null,health:[],checked:false,restore:null},busy:null,ready:false};
const TABS=[['sources','Sources'],['wins','Wins'],['interview','Intake'],['facts','Fact base'],['jobs','Jobs'],['tailor','Tailor'],['prep','Interview prep'],['memory','Memory'],['data','Setup']];
const KINDS=['win','achievement','responsibility','skill','project','education','certification','award','summary','other'];
const STATUSES=['Saved','Applied','Interview','Offer','Rejected','No response'];
const APP_VERSION='0.15.0';
const IN_CLAUDE=!!(window.claude&&window.claude.use);
const REPO='https://github.com/punjabitaz-ctrl/Resume-engine';
/* PAGE PROTECTIONS (standalone copy). Inside Claude the host page sets its own policy, so these apply only outside it.
   1. Refuse to run inside another site's frame, so nobody can overlay the page and trick taps (the approval gate relies on real taps).
   2. A content security policy: scripts may come only from this site's own files, never from injected markup. Connections stay open
      because the AI address is the user's choice. Skipped for file:// pages, where browsers cannot match a page's own files. */
if(!IN_CLAUDE){
 if(window.top!==window.self){document.documentElement.textContent='';throw new Error('Resume Engine does not run inside another page.')}
 if(location.protocol!=='file:'){const m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';m.content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https: http:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'";document.head.appendChild(m)}
}
/* Keys never leave through an error message, a log line or a report. */
function scrub(t){t=String(t==null?'':t);try{if(AI.key&&AI.key.length>=8)t=t.split(AI.key).join('[key removed]')}catch(e){}return t.replace(/\b(?:sk|pk|rk|gsk|xai|AIza)[-_A-Za-z0-9]{12,}/g,'[key removed]').replace(/(Bearer\s+)[-._~+\/A-Za-z0-9]{12,}/gi,'$1[key removed]')}
const errs=[];function logErr(where,e){errs.push({at:new Date().toISOString(),where:String(where),code:String((e&&e.code)||''),msg:scrub((e&&e.message)||'').slice(0,200)});if(errs.length>8)errs.shift()}
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const clone=o=>JSON.parse(JSON.stringify(o??null));
const norm=s=>String(s??'').toLowerCase().replace(/[‐-―\-_/]/g,' ').replace(/[^a-z0-9+#.&% ]/g,' ').replace(/\s+/g,' ').trim();
const D=k=>S.ui.draft[k]??'';
function toast(msg,kind){const t=$('#toast');t.innerHTML='<div class="'+(kind||'')+'">'+esc(scrub(msg))+'</div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{t.innerHTML=''},kind==='bad'?7000:3200)}
