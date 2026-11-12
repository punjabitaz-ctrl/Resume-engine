"use strict";
/* ---------- repair: explain a failed step, propose a fix, change nothing until the user approves ---------- */
/* APPROVAL GATE. Fixes, data repairs and learned-lesson changes run only after a genuine tap or click by the person using the app.
   The browser marks real user input as trusted and scripts cannot forge that mark. There is no setting, flag, stored value or AI output
   that bypasses this gate, and the AI's answer is only ever displayed as a recommendation. Do not add a bypass. */
const Gate=(()=>{let live=null;return Object.freeze({
 grant(e,what){if(!e||e.isTrusted!==true){live=null;return false}live={what,at:Date.now()};return true},
 use(what){const ok=!!live&&live.what===what&&Date.now()-live.at<3000;live=null;if(!ok)logErr('approval gate',{code:'blocked',message:'refused "'+what+'": no direct approval from the user'});return ok}})})();
const GATED=Object.freeze({fix:1,repairData:1,undoRepair:1,approveLessons:1,useWording:1,useTmay:1});
const PASS=Symbol('approved');
const HEAL={wait:30000};
const FIXES=Object.freeze({retry:'Try the step again',wait:'Wait 30 seconds, then try again',smaller:'Read documents in smaller parts, then try again',tidy:'Allow small punctuation slips in the answer to be tidied this once (no AI call), then try again',jsonRepair:'Let the AI repair the unreadable answer this once (one extra request), then try again',nostream:'Turn off live streaming of answers, then try again',factCap:'Send only the facts most relevant to the job, then try again',dataRepair:'Repair the saved data, then try again',setup:'Open Setup to fix the AI engine settings',report:'Draft a problem report for the maintainer'});
const AI_DOWN=['network','bad_key','no_ai','bad_model','not_granted','sampling_disabled','unavailable','session_expired'];
/* HOUSE RULE, ALL SCENARIOS: no em dash or en dash in anything the app holds or writes. Every AI answer enters through askJSON and lands in the
   saved data, so this one scan covers facts, roles, job notes, lessons and versions today and whatever is added later. It only finds and counts.
   Replacement happens through the approved repair, never silently. Text the user supplied (sources, postings) and sent versions are left alone. */
const DASH=/[–—]/;
function dashScan(){let n=0;const where=[];const skip={jdText:1,url:1,id:1,src:1,roleId:1,jobId:1,orig:1},count=o=>typeof o==='string'?(o.match(/[–—]/g)||[]).length:Array.isArray(o)?o.reduce((a,x)=>a+count(x),0):o&&typeof o==='object'?Object.keys(o).reduce((a,k)=>a+(skip[k]?0:count(o[k])),0):0;
 const areas={facts:S.facts,roles:S.roles,lessons:S.memory,'job notes':S.jobs,versions:(Array.isArray(S.resumes)?S.resumes:[]).filter(v=>v&&!v.sentAt),'contact header':S.profile};for(const a of Object.keys(areas)){const c=count(areas[a]);if(c){n+=c;where.push(c+' in '+a)}}return{n,where}}
const undash=t=>t.replace(/(\d)\s*[–—]\s*(\d)/g,'$1 to $2').replace(/\s*[–—]\s*/g,', ').replace(/,\s*,/g,',').replace(/,\s*([.;:!?])/g,'$1');
function dashFix(){const skip={jdText:1,url:1,id:1,src:1,roleId:1,jobId:1,orig:1},fix=o=>{if(Array.isArray(o)){for(let i=0;i<o.length;i++){if(typeof o[i]==='string'){if(DASH.test(o[i]))o[i]=undash(o[i])}else fix(o[i])}}else if(o&&typeof o==='object')for(const k of Object.keys(o)){if(skip[k])continue;if(typeof o[k]==='string'){if(DASH.test(o[k]))o[k]=undash(o[k])}else fix(o[k])}};
 fix(S.facts);fix(S.roles);fix(S.memory);fix(S.jobs);fix(S.resumes.filter(v=>v&&!v.sentAt));fix(S.profile)}
function checkData(){const out=[],obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 for(const k of ['roles','facts','memory','sources','jobs','resumes'])if(!Array.isArray(S[k]))out.push({text:'The saved '+k+' list is damaged and cannot be read',fix(){S[k]=[]}});
 if(!obj(S.profile))out.push({text:'The contact header is damaged',fix(){S.profile={}}});
 if(out.length)return out;
 const drop=(k,bad,text)=>{if(bad.length)out.push({text:bad.length+' '+text,fix(){S[k]=S[k].filter(x=>!bad.includes(x))}})};
 drop('roles',S.roles.filter(r=>!obj(r)||!r.id),'roles are unreadable');
 drop('facts',S.facts.filter(f=>!obj(f)||!f.id||typeof f.text!=='string'||!f.text.trim()),'facts have no text');
 drop('sources',S.sources.filter(x=>!obj(x)||!x.id||typeof x.text!=='string'),'sources are unreadable');
 drop('jobs',S.jobs.filter(x=>!obj(x)||!x.id||typeof x.jdText!=='string'),'jobs are unreadable');
 drop('resumes',S.resumes.filter(v=>!obj(v)||!v.id||!obj(v.resume)),'resume versions are unreadable');
 drop('memory',S.memory.filter(m=>!obj(m)||typeof m.text!=='string'||!m.text.trim()),'saved instructions are empty');
 const rid=new Set(S.roles.filter(obj).map(r=>r.id)),jid=new Set(S.jobs.filter(obj).map(j=>j.id));
 const orph=S.facts.filter(f=>obj(f)&&f.roleId&&!rid.has(f.roleId));if(orph.length)out.push({text:orph.length+' facts point to a role that no longer exists',fix(){for(const f of orph)f.roleId=''}});
 const seen=new Set(),dup=S.facts.filter(f=>obj(f)&&f.id&&(seen.has(f.id)||!seen.add(f.id)));if(dup.length)out.push({text:dup.length+' facts share an id with another fact',fix(){for(const f of dup)f.id=uid('f')}});
 const lost=S.resumes.filter(v=>obj(v)&&obj(v.resume)&&!jid.has(v.jobId));if(lost.length)out.push({text:lost.length+' resume versions belong to a job that no longer exists',fix(){S.resumes=S.resumes.filter(v=>!lost.includes(v))}});
 const SEC=['skills','experience','projects','education','certifications'],bent=S.resumes.filter(v=>obj(v)&&obj(v.resume)&&SEC.some(k=>v.resume[k]!=null&&!Array.isArray(v.resume[k])));if(bent.length)out.push({text:bent.length+' resume versions have a damaged section',fix(){for(const v of bent)for(const k of SEC)if(v.resume[k]!=null&&!Array.isArray(v.resume[k]))v.resume[k]=[]}});
 const dz=dashScan();if(dz.n)out.push({style:true,text:dz.n+' long dash'+(dz.n>1?'es':'')+' in saved text ('+dz.where.join(', ')+'). The project rule is none, anywhere',fix(){dashFix()}});
 return out}
function doRepair(quiet,pass){if(pass!==PASS)return 0;const ids={};for(const c of ['sources','jobs','resumes'])ids[c]=Array.isArray(S[c])?S[c].filter(x=>x&&x.id).map(x=>x.id):[];
 S.ui.restore=clone(snapshot());Local.set(S.ui.restore,'restore');let n=0;for(let pass=0;pass<3;pass++){const is=checkData();if(!is.length)break;for(const i of is){try{i.fix();n++}catch(e){}}}
 for(const c of ['sources','jobs','resumes']){const now=new Set(S[c].map(x=>x.id));for(const id of ids[c])if(!now.has(id))Store.remove(c,id)}
 Store.saveAll();S.ui.health=checkData();S.ui.checked=true;if(!quiet){render();toast(n?'Repaired '+n+' problem'+(n>1?'s':'')+'. You can undo this in Setup.':'Nothing needed repair.')}return n}
function ruleDiagnosis(inc){const c=inc.code,ex=/extract|source|answers/i.test(inc.label),wr=/writing resume/i.test(inc.label);
 if(c==='network')return{cause:'The AI server did not answer. The address may be wrong, the connection may have dropped, or a local model is not running or does not allow this page.',fixes:['retry','nostream','setup']};
 if(AI_DOWN.includes(c))return{cause:'The AI engine settings need attention before this step can run.',fixes:IN_CLAUDE?['retry']:['setup']};
 if(c==='rate_limited')return{cause:'The provider is limiting how much you can send right now.',fixes:['wait']};
 if(c==='invalid_json')return inc.cut?{cause:'The answer was cut off before it finished, usually because one request asked for too much.',fixes:ex?['smaller','retry']:wr?['factCap','retry']:['retry']}:{cause:'The model returned an answer the app could not read as data.',fixes:ex?['tidy','jsonRepair','smaller','retry']:['tidy','jsonRepair','retry']};
 if(c==='prompt_too_large')return{cause:'The request was larger than the model accepts.',fixes:ex?['smaller']:wr?['factCap']:['report']};
 if(['empty_completion','upstream_error','lib','api'].includes(c))return{cause:'This looks like a temporary failure on the AI side. Your data is unaffected.',fixes:['retry']};
 if(c==='refused')return{cause:'The model declined this content. Retrying unchanged gives the same result; edit the source text or the posting first.',fixes:['report']};
 if(checkData().some(i=>!i.style))return{cause:'The saved data has problems that can make steps fail.',fixes:['dataRepair','report']};
 return{cause:'This failure does not match a known pattern.',fixes:['retry','report']}}
async function aiDiagnose(){const inc=S.ui.incident;if(!inc)return;
 await run('Analyzing what broke',async()=>{const d=await askJSON(`You are the repair assistant inside a resume-writing web app. A step failed. From the record below, work out the most likely cause and choose ONE fix from the allowed list. You cannot change the app's code. If the cause looks like a defect in the app itself, choose "report".

ALLOWED FIXES
${Object.entries(FIXES).map(([k,v])=>'- '+k+': '+v).join('\n')}

Reply with only JSON: {"cause":"one plain sentence","evidence":"what in the record points to it","fix":"one id from the list","why":"one sentence"}

FAILED STEP: ${inc.label}
ERROR CODE: ${inc.code}
ERROR MESSAGE: ${inc.msg||'none'}
ANSWER WAS CUT SHORT: ${inc.cut}
START OF THE MODEL'S RAW ANSWER: ${inc.raw?fence(inc.raw):'not captured'}
ENGINE: ${AI.label()}
SETTINGS: ${JSON.stringify({partSize:+AI.cfg.chunk||14000,streaming:AI.cfg.stream!==false,factLimit:+AI.cfg.factCap||0})}
DATA: ${S.sources.length} sources, ${S.facts.length} facts, ${S.jobs.length} jobs, ${S.resumes.length} versions
DATA CHECK: ${checkData().map(i=>i.text).join('; ')||'no problems'}
RECENT ERRORS: ${JSON.stringify(errs.slice(-5))}`,'quick');inc.diag={cause:String(d.cause||''),evidence:String(d.evidence||''),why:String(d.why||''),fix:FIXES[d.fix]?d.fix:'report'}});
 if(S.ui.incident!==inc){inc.diagFail=true;S.ui.incident=inc}render()}
async function applyFix(act){if(!Gate.use('fix:'+act))return;const inc=S.ui.incident;if(!inc||!FIXES[act])return;const again=inc.retry;S.ui.incident=null;
 if(act==='setup'){location.hash='data';render();return}
 if(act==='report'){S.ui.draft.fbText=[D('fbText'),'Failed step: '+inc.label+' ('+inc.code+(inc.msg?', '+inc.msg:'')+').',inc.diag?'AI analysis: '+inc.diag.cause+' '+inc.diag.evidence:''].filter(Boolean).join('\n');location.hash='data';render();toast('Problem report drafted in Setup. Copy it and send it.');return}
 if(act==='smaller')AI.cfg.chunk=Math.max(3000,Math.round((+AI.cfg.chunk||14000)/2));
 if(act==='jsonRepair')S.ui.repairOnce=true;
 if(act==='tidy')S.ui.tidyOnce=true;
 if(act==='nostream')AI.cfg.stream=false;
 if(act==='factCap')AI.cfg.factCap=AI.cfg.factCap?Math.max(20,Math.round(AI.cfg.factCap/2)):60;
 AI.save();if(act==='dataRepair')doRepair(true,PASS);
 if(S.profile&&typeof S.profile==='object'){S.profile.heals=(S.profile.heals||[]).concat({at:Date.now(),step:inc.label,code:inc.code,fix:act}).slice(-20);Store.state('profile')}
 if(act==='wait'){let go=true;await run('Waiting before trying again',()=>new Promise((res,rej)=>{const t=setTimeout(res,HEAL.wait);ctl.signal.addEventListener('abort',()=>{clearTimeout(t);go=false;rej({code:'cancelled'})})}));if(!go)return}
 render();if(again)again();else toast('Fix applied. Run the step again.')}
function vIncident(){const inc=S.ui.incident,d=ruleDiagnosis(inc),btn=(f,pri)=>'<button'+(pri?' class="primary"':'')+' data-act="fix" data-id="'+f+'">'+FIXES[f]+'</button>';
 return '<div class="card incident" role="alert" style="margin-bottom:16px"><h2>A step failed: '+esc(inc.label)+'</h2><p>'+esc(errCopy({code:inc.code,message:inc.msg}))+'</p><p class="small"><b>Likely cause.</b> '+esc(d.cause)+'</p><div class="row">'+d.fixes.map((f,i)=>btn(f,i===0&&!inc.diag)).join('')+'</div>'+(inc.diag?'<div class="item"><h3>AI analysis</h3><p class="small">'+esc(inc.diag.cause)+' '+esc(inc.diag.evidence)+'</p><p class="small"><b>Recommended.</b> '+esc(FIXES[inc.diag.fix])+'. '+esc(inc.diag.why)+'</p><div class="row">'+btn(inc.diag.fix,true)+'</div></div>':'')+(inc.diagFail?'<p class="small">The AI could not analyze this failure. Use a fix above or draft a report.</p>':'')+'<div class="row">'+(!inc.diag&&!inc.diagFail&&AI.ready()&&!AI_DOWN.includes(inc.code)?'<button data-act="analyze">Ask the AI to analyze it</button>':'')+(d.fixes.includes('report')?'':'<button data-act="fix" data-id="report">'+FIXES.report+'</button>')+'<button class="quiet" data-act="dismissIncident">Dismiss</button></div><p class="small">Nothing changes until you choose a fix.</p></div>'}
function vCrash(){const is=checkData();S.ui.health=is;S.ui.checked=true;return '<div class="card incident" role="alert"><h2>This screen could not be shown</h2><p>Your data is still saved. '+(is.length?'The health check found '+is.length+' problem'+(is.length>1?'s':'')+' that can cause this:':'The health check found no damaged data, so this looks like a defect in the app. Please report it.')+'</p>'+is.map(i=>'<p class="small">'+esc(i.text)+'</p>').join('')+'<div class="row">'+(is.length?'<button class="primary" data-act="repairData">Repair and show this screen</button>':'')+'<button data-act="go" data-id="data">Open Setup</button></div>'+bkFields()+'<div class="row"><button data-act="exportBackup">Download locked backup</button></div></div>'}
function vHealth(){const is=S.ui.health||[],c=AI.cfg,tuned=[];if((+c.chunk||14000)!==14000)tuned.push('documents are read in parts of '+c.chunk+' characters');if(c.stream===false)tuned.push('live streaming is off');if(+c.factCap)tuned.push('the writer receives the '+c.factCap+' most relevant facts');const hs=((S.profile&&S.profile.heals)||[]).slice(-5).reverse();
 return '<div class="card"><h2>Health and repair</h2><p class="lede">When a step fails, a repair panel explains the likely cause and offers a fix, and the AI can analyze failures it does not recognise. Nothing is changed until you approve it with your own tap, and the app has no setting that lets the AI apply a fix by itself. The check below looks for damage in your saved data.</p>'+(S.ui.checked?(is.length?is.map(i=>'<p class="small bad">'+esc(i.text)+'</p>').join(''):'<p class="small good">No problems found in your saved data.</p>'):'')+'<div class="row"><button data-act="healthCheck">Run health check</button>'+(is.length?'<button class="primary" data-act="repairData">Repair '+is.length+' problem'+(is.length>1?'s':'')+'</button>':'')+(S.ui.restore?'<button data-act="undoRepair">Undo last repair</button>':'')+'</div>'+(tuned.length?'<p class="small">Changed by fixes you approved: '+tuned.join('; ')+'. <button class="quiet" data-act="resetTune">Reset to defaults</button></p>':'')+(hs.length?'<div class="item"><h3>Recent fixes you approved</h3>'+hs.map(h=>'<p class="small">'+esc(shortDate(h.at))+' · '+esc(h.step)+' · '+esc(FIXES[h.fix]||h.fix)+'</p>').join('')+'</div>':'')+'</div>'}
