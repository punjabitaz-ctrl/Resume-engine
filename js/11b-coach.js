"use strict";
/* ---------- coach: mock interviews, outreach drafts and call reviews ----------
   All three run on the user's own AI engine. Nothing here sends a message, posts anything or changes a fact: drafts are for the user to
   read, edit and send themselves. Writers may use approved facts only, and any number not found in the facts, the posting or the
   user's own notes is flagged before the draft can be copied. Postings and call transcripts are fenced as material. */
const LEVELS=[['warm','Warm and encouraging'],['standard','Standard'],['tough','Tough, with probing follow-ups']];
const DRAFT_KINDS=[['cover','Cover letter','250 to 350 words, three or four short paragraphs, addressed to the hiring team or the named person.'],['recruiter','Note to a recruiter','Under 120 words. Who I am, the role, one proof point, a clear ask for a short call.'],['manager','Note to the hiring manager','Under 150 words. One line on why this team, two proof points tied to what the posting stresses, a clear ask.'],['referral','Ask for a referral','Under 120 words, to someone I know at the company. Easy to say yes to: the role, why I fit in one line, and an offer to send a short blurb they can forward.'],['followup','Follow-up after applying','Under 100 words. Polite, specific to the role, adds one relevant proof point, asks about next steps.'],['connect','LinkedIn connection note','Under 280 characters in total, no subject. Friendly and specific, with a reason to connect.']];
const CALL_KINDS=['Recruiter screen','Interview','Networking or referral call','Other'];
const factList=()=>usableFacts().slice(0,160).map(f=>'- '+String(f.text||'').replace(/\s+/g,' ').slice(0,300)).join('\n');
const jobById=id=>S.jobs.find(j=>j.id===id)||null;
const roleName=j=>j?(j.title||'the role')+(j.company?' at '+j.company:''):'';
const jobOptions=(key,none)=>'<option value="">'+esc(none)+'</option>'+S.jobs.map(j=>'<option value="'+j.id+'"'+(D(key)===j.id?' selected':'')+'>'+esc((j.title||'Untitled')+(j.company?' · '+j.company:''))+'</option>').join('');
/* numbers in a draft that are not in the approved facts, the posting or the user's own notes */
function strayNums(text,extra){const ok=new Set(nums(usableFacts().map(f=>f.text).join('\n')+'\n'+(extra||'')));return [...new Set(nums(text).filter(n=>!ok.has(n)))]}
function markNums(text,bad){let h=esc(text);for(const n of bad)h=h.split(esc(n)).join('<span class="nmiss">'+esc(n)+'</span>');return h}

/* ===== mock interview ===== */
const mockOf=j=>{const p=prepOf(j);p.mocks=p.mocks||[];return p.mocks};
function mockStart(){const job=jobById(D('mJob')),stage=D('mStage')||'screen',level=D('mLevel')||'standard',n=[3,5,8].includes(+D('mN'))?+D('mN'):5;
 if(!usableFacts().length&&!wins().length){toast('Add your resume or a few wins first, so the interviewer has something to ask about.','bad');return}
 S.ui.mock={id:uid('m'),jobId:job?job.id:'',stage,level,n,asked:0,turns:[],report:null,at:Date.now()};S.ui.draft.mAns='';mockTurn()}
function mockPrompt(m){const job=jobById(m.jobId),st=STAGES.find(s=>s[0]===m.stage)||STAGES[5],lv=(LEVELS.find(l=>l[0]===m.level)||LEVELS[1])[1];
 const last=m.turns[m.turns.length-1],lastFollow=m.turns.length>=2&&m.turns[m.turns.length-2].kind==='followup';
 return `You are a job interviewer running a realistic mock interview. Stay in role: ask one thing at a time, never give feedback, praise or hints during the interview, and keep each turn under 60 words.

ROUND: ${st[1]}. ${st[2]}
INTERVIEWER STYLE: ${lv}
PROGRESS: ${m.asked} of ${m.n} main questions asked so far.
${m.asked===0?'This is the opening: greet the candidate in one short line, then ask the first main question.':m.asked>=m.n?'All main questions are asked. If the last answer needs it, ask one short follow-up (kind "followup"); otherwise thank the candidate, say what happens next in one line, and close (kind "close").':'Either ask the next main question (kind "question"), or, if the last answer was vague, skipped the result, or raises something worth probing, ask one short follow-up (kind "followup").'+(lastFollow?' You just asked a follow-up, so ask the next main question.':'')}
Mix question types across the interview: behavioral, role-specific and motivation. Base them on the posting and the candidate's background. Do not repeat a question.

THE ROLE: ${job?roleName(job):'a role that fits the candidate’s background'}
${job&&job.jdText?'THE POSTING:\n'+fence(job.jdText.slice(0,9000)):''}
CANDIDATE BACKGROUND (roles and story titles):
${(S.roles||[]).slice(0,8).map(r=>'- '+(r.title||'')+(r.company?' at '+r.company:'')).join('\n')||'- not given'}
${wins().slice(0,12).map(w=>'- story: '+(w.title||'')).join('\n')}

CONVERSATION SO FAR:
${m.turns.map(t=>(t.who==='them'?'INTERVIEWER: ':'CANDIDATE: ')+t.text).join('\n')||'(none)'}

Reply with only JSON: {"say":"","kind":"question|followup|close"}`}
async function mockTurn(){const m=S.ui.mock;if(!m)return;
 await run('Interviewer is thinking',async()=>{const d=await askJSON(mockPrompt(m),'quick');let say=String((d&&d.say)||'').trim().slice(0,800),kind=['question','followup','close'].includes(d&&d.kind)?d.kind:'question';
  if(!say)throw{code:'invalid_json',message:'The interviewer gave no question.'};
  const prev=[...m.turns].reverse().find(t=>t.who==='them');if(kind==='followup'&&prev&&prev.kind==='followup')kind=m.asked>=m.n?'close':'question';if(kind==='question'&&m.asked>=m.n)kind=prev&&prev.kind==='followup'?'close':'followup';
  if(kind==='question')m.asked++;m.turns.push({who:'them',text:say,kind});
  if(kind==='close')await mockReport()},mockTurn)}
function mockAnswer(skip){const m=S.ui.mock;if(!m||m.report)return;const a=skip?'(I would like to skip this question.)':D('mAns').trim();
 if(!skip&&words(a)<3){toast('Type your answer first, or choose Skip question.','bad');return}m.turns.push({who:'me',text:a.slice(0,6000)});S.ui.draft.mAns='';const prev=[...m.turns].reverse().find(t=>t.who==='them');
 if(m.asked>=m.n&&prev&&prev.kind==='followup'){m.turns.push({who:'them',text:'Thank you, that is all my questions. You will hear about next steps soon.',kind:'close'});run('Scoring your interview',mockReport,mockEnd);return}mockTurn()}
async function mockReport(){const m=S.ui.mock;if(!m)return;const ws=wins(),titles=ws.map(w=>w.title).filter(Boolean),job=jobById(m.jobId);
 const d=await askJSON(`Score this mock interview fairly and specifically. Judge only what the candidate actually said. Do not invent facts or numbers, and do not rewrite whole answers. When a story from their bank would have fit a question better, name its exact title from the list, otherwise leave it empty.

Scores are 1 to 5: structure (clear situation, action, result), specificity (concrete detail, their own role), relevance (answers what was asked, ties to the role), concision (right length, no rambling).

Reply with only JSON: {"overall":3,"scores":{"structure":3,"specificity":3,"relevance":3,"concision":3},"summary":"two sentences","answers":[{"q":"the question, shortened","worked":"","improve":"","story":""}],"next":["up to 3 practice drills"]}

ROLE: ${job?roleName(job):'general practice'}; ROUND: ${(STAGES.find(s=>s[0]===m.stage)||STAGES[5])[1]}
STORY BANK TITLES: ${titles.join(' | ')||'(none)'}
TRANSCRIPT:
${m.turns.map(t=>(t.who==='them'?'INTERVIEWER: ':'CANDIDATE: ')+t.text).join('\n')}`,'complex');
 const sc=x=>Math.max(1,Math.min(5,Math.round(+x)||0))||1,s=(d&&d.scores)||{};
 m.report={overall:sc(d&&d.overall),scores:{structure:sc(s.structure),specificity:sc(s.specificity),relevance:sc(s.relevance),concision:sc(s.concision)},summary:String((d&&d.summary)||'').slice(0,600),
  answers:((d&&d.answers)||[]).slice(0,12).map(a=>({q:String(a.q||'').slice(0,300),worked:String(a.worked||'').slice(0,500),improve:String(a.improve||'').slice(0,500),story:titles.includes(a.story)?a.story:''})),next:((d&&d.next)||[]).slice(0,3).map(String)};
 if(job){const list=mockOf(job);list.unshift(clone({id:m.id,at:m.at,stage:m.stage,level:m.level,n:m.n,turns:m.turns,report:m.report}));list.length=Math.min(list.length,10);Store.item('jobs',job);m.saved=true}}
function vMockReport(r){const lab={structure:'Structure',specificity:'Specificity',relevance:'Relevance',concision:'Concision'};
 return '<div class="score"><div><b>'+r.overall+'<small style="font-size:16px"> / 5</small></b><span>Overall</span></div>'+Object.keys(lab).map(k=>'<div><b>'+r.scores[k]+'</b><span>'+lab[k]+'</span></div>').join('')+'</div>'+(r.summary?'<p>'+esc(r.summary)+'</p>':'')
  +r.answers.map((a,i)=>'<div class="item"><h3>'+(i+1)+'. '+esc(a.q)+'</h3>'+(a.worked?'<p class="small good">Worked: '+esc(a.worked)+'</p>':'')+(a.improve?'<p class="small">To improve: '+esc(a.improve)+'</p>':'')+(a.story?'<p class="small">A better story to use: <b>'+esc(a.story)+'</b></p>':'')+'</div>').join('')
  +(r.next.length?'<h3>Practice next</h3><ul>'+r.next.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')}
function vMock(){const m=S.ui.mock;let h='<div class="stack">';
 if(!m){h+='<div class="card"><h2>Mock interview</h2><p class="lede">An AI interviewer asks questions for the job and round you choose, follows up when an answer is thin, and scores the whole interview at the end. Type your answers, or say them out loud first and type the gist.</p><div class="grid2"><label>Job<select id="mJob" data-draft="mJob">'+jobOptions('mJob','No specific job (not saved)')+'</select></label><label>Round<select id="mStage" data-draft="mStage">'+STAGES.map(s=>'<option value="'+s[0]+'"'+(D('mStage')===s[0]?' selected':'')+'>'+s[1]+'</option>').join('')+'</select></label><label>Interviewer<select id="mLevel" data-draft="mLevel">'+LEVELS.map(l=>'<option value="'+l[0]+'"'+((D('mLevel')||'standard')===l[0]?' selected':'')+'>'+l[1]+'</option>').join('')+'</select></label><label>Main questions<select id="mN" data-draft="mN">'+[3,5,8].map(n=>'<option'+((+D('mN')||5)===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div><p class="small">Each interviewer turn and the final score are requests on your own AI key. A five-question interview is roughly a dozen short requests and one longer one.</p><div class="row"><button class="primary" data-act="mockStart">Start the interview</button></div></div>';
  const job=jobById(D('mJob')),past=job?mockOf(job):[];
  if(past.length)h+='<div class="card"><h2>Past interviews for this job</h2>'+past.map(p=>'<div class="item"><div class="row"><b style="margin-right:auto">'+esc(new Date(p.at).toLocaleDateString())+', '+esc((STAGES.find(s=>s[0]===p.stage)||STAGES[5])[1])+'</b><span class="pill s-Interview">'+(p.report?p.report.overall+' / 5':'not scored')+'</span><button data-act="mockOpen" data-id="'+p.id+'">Open</button></div></div>').join('')+'</div>';
  return h+'</div>'}
 const job=jobById(m.jobId),open=!m.report&&m.turns.length&&m.turns[m.turns.length-1].who==='them';
 h+='<div class="card"><div class="row"><h2 style="margin-right:auto">Mock interview</h2><span class="chip">'+esc((STAGES.find(s=>s[0]===m.stage)||STAGES[5])[1])+(job?' · '+esc(roleName(job)):'')+'</span><span class="chip">Question '+Math.min(m.asked,m.n)+' of '+m.n+'</span></div><div class="chat">'+m.turns.map(t=>'<div class="msg '+t.who+'"><span class="who">'+(t.who==='them'?'Interviewer':'You')+'</span>'+esc(t.text)+'</div>').join('')+'</div>'
  +(open?'<label>Your answer<textarea id="mAns" data-draft="mAns" style="min-height:120px" placeholder="Situation, what you did, and what changed.">'+esc(D('mAns'))+'</textarea></label><div class="row"><button class="primary" data-act="mockAnswer">Send answer</button><button data-act="mockSkip">Skip question</button><button class="quiet" data-act="mockEnd" style="margin-left:auto">End and get feedback</button></div>':'')
  +'</div>';
 if(m.report)h+='<div class="card"><h2>Your feedback</h2>'+vMockReport(m.report)+'<div class="row"><button class="primary" data-act="mockClose">Practice again</button>'+(m.saved?'<span class="small">Saved with this job.</span>':'<span class="small">Not saved: no job was chosen.</span>')+'</div></div>';
 return h+'</div>'}
async function mockEnd(){const m=S.ui.mock;if(!m||m.report)return;if(!m.turns.some(t=>t.who==='me')){S.ui.mock=null;render();return}await run('Scoring your interview',mockReport,mockEnd)}

/* ===== outreach drafts ===== */
const draftsOf=j=>{j.drafts=j.drafts||[];return j.drafts};
async function writeDraft(){const job=jobById(D('oJob')),kind=DRAFT_KINDS.find(k=>k[0]===(D('oKind')||'cover'))||DRAFT_KINDS[0],who=D('oWho').trim().slice(0,120),notes=D('oNotes').trim().slice(0,1500);
 if(!job){toast('Choose the job this is for.','bad');return}if(!usableFacts().length){toast('Approve some facts first: drafts use your approved facts only.','bad');return}
 await run('Writing your '+kind[1].toLowerCase(),async()=>{const d=await askJSON(`Write a ${kind[1].toLowerCase()} in the candidate's own voice, first person, plain and warm, with no cliches. ${kind[2]}
Use only the candidate's approved facts below and their own notes. Never invent an employer, title, result, number or claim. If a fact does not support a point, leave the point out. Tie the strongest facts to what the posting stresses.
${who?'Address it to: '+who+'.':'No recipient name is known, so use a neutral greeting.'}
Sign it with the candidate's name: ${S.profile.name||'(no name on file, leave the sign-off name empty)'}.

Reply with only JSON: {"subject":"empty for a connection note or cover letter","body":""}

THE ROLE: ${roleName(job)}
${job.jdText?'THE POSTING:\n'+fence(job.jdText.slice(0,9000)):''}
THE CANDIDATE'S OWN NOTES: ${notes||'(none)'}
APPROVED FACTS:
${factList()}`,'complex');
  const body=String((d&&d.body)||'').trim().slice(0,5000);if(!body)throw{code:'invalid_json',message:'The draft came back empty.'};
  S.ui.draftNumsOk=false;S.ui.draft2={id:uid('d'),jobId:job.id,kind:kind[0],who,subject:String((d&&d.subject)||'').trim().slice(0,200),body,at:Date.now(),extra:notes+'\n'+(job.jdText||'')}},writeDraft)}
function saveDraft(){const x=S.ui.draft2,job=x&&jobById(x.jobId);if(!job)return;x.subject=($('#odSubj')||{}).value??x.subject;x.body=($('#odBody')||{}).value??x.body;draftsOf(job).unshift({id:x.id,kind:x.kind,who:x.who,subject:x.subject,body:x.body,at:x.at});job.drafts.length=Math.min(job.drafts.length,20);Store.item('jobs',job);S.ui.draft2=null;render();toast('Saved with this job. Nothing was sent.')}
async function copyDraft(){const x=S.ui.draft2;if(!x)return;const s=($('#odSubj')||{}).value??x.subject,b=($('#odBody')||{}).value??x.body,bad=strayNums(s+'\n'+b,x.extra);
 if(bad.length&&!S.ui.draftNumsOk){toast('Check the highlighted numbers first, then tick that they are right.','bad');return}
 try{await navigator.clipboard.writeText((s?s+'\n\n':'')+b);toast('Copied. Read it once more before you send it.')}catch(e){toast('Copy was blocked. Select the text and copy it by hand.','bad')}}
function vDraftOut(){const x=S.ui.draft2;if(!x)return '';const k=DRAFT_KINDS.find(z=>z[0]===x.kind)||DRAFT_KINDS[0],bad=strayNums(x.subject+'\n'+x.body,x.extra);
 return '<div class="card proposal"><h2>'+esc(k[1])+' draft</h2><p class="small">Written from your approved facts. Edit it freely: it goes nowhere until you copy it and send it yourself.</p>'+(k[0]==='cover'||k[0]==='connect'?'':'<label>Subject<input type="text" id="odSubj" value="'+esc(x.subject)+'"></label>')+'<label>Message<textarea id="odBody" style="min-height:220px">'+esc(x.body)+'</textarea></label>'
  +(bad.length?'<div class="banner">These numbers are not in your approved facts or the posting: '+bad.map(n=>'<b>'+esc(n)+'</b>').join(', ')+'. Fix them or confirm they are true.<div class="draftbox" style="margin-top:8px">'+markNums(x.body,bad)+'</div><label style="flex-direction:row;align-items:center;gap:8px;margin-top:8px"><input type="checkbox" data-chg="draftNumsOk"'+(S.ui.draftNumsOk?' checked':'')+'> I checked these numbers and they are true</label></div>':'')
  +'<p class="small">'+(k[0]==='connect'?'Length: <span id="odLen">'+x.body.length+'</span> of 280 characters.':words(x.body)+' words.')+'</p><div class="row"><button class="primary" data-act="copyDraft">Copy</button><button data-act="saveDraft">Save with the job</button><button class="quiet" data-act="dropDraft">Discard</button></div></div>'}
/* ===== call review ===== */
const WH={k:'resume-engine-whisper',get(){try{return JSON.parse(localStorage.getItem(this.k)||'{}')||{}}catch(e){return{}}},set(o){try{localStorage.setItem(this.k,JSON.stringify(Object.assign(this.get(),o)))}catch(e){}},key:''};
try{WH.key=sessionStorage.getItem('resume-engine-whisper-key')||''}catch(e){}
function transcriptText(name,raw){raw=String(raw||'').replace(/\r/g,'');
 if(/\.json$/i.test(name)){try{const o=JSON.parse(raw);if(o&&Array.isArray(o.segments))return o.segments.map(s=>String(s.text||'').trim()).filter(Boolean).join('\n');if(o&&typeof o.text==='string')return o.text.trim()}catch(e){}}
 if(/\.(vtt|srt)$/i.test(name)||/^WEBVTT/.test(raw)){const out=[];for(let l of raw.split('\n')){l=l.trim();if(!l||/^WEBVTT/.test(l)||/^NOTE\b/.test(l)||/^\d+$/.test(l)||/-->/.test(l)||/^(Kind|Language):/i.test(l))continue;l=l.replace(/<[^>]+>/g,'').trim();if(l&&out[out.length-1]!==l)out.push(l)}return out.join('\n')}
 return raw.trim()}
function readCallFile(f){if(!f)return;if(f.size>5e6){toast('That file is too large for a transcript. Use the text, VTT, SRT or JSON your app saved.','bad');return}const r=new FileReader();r.onload=()=>{S.ui.draft.cText=transcriptText(f.name,r.result).slice(0,80000);render();toast('Transcript loaded: '+words(S.ui.draft.cText)+' words.')};r.readAsText(f)}
const Rec={mr:null,chunks:[],blob:null,t0:0,
 async start(){if(!S.ui.recOk){toast('Confirm that everyone on the call agreed to be recorded first.','bad');return}if(!navigator.mediaDevices||!window.MediaRecorder){toast('This browser cannot record. Use your call app’s transcript and import it instead.','bad');return}
  try{const st=await navigator.mediaDevices.getUserMedia({audio:true});this.chunks=[];this.blob=null;this.mr=new MediaRecorder(st);this.mr.ondataavailable=e=>{if(e.data&&e.data.size)this.chunks.push(e.data)};this.mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());this.blob=new Blob(this.chunks,{type:this.mr.mimeType||'audio/webm'});this.mr=null;render()};this.mr.start(1000);this.t0=Date.now();render()}catch(e){toast('The microphone was not available. Check the browser’s permission for this page.','bad')}},
 stop(){if(this.mr)this.mr.stop()}};
async function transcribe(){const c=WH.get(),b=Rec.blob;if(!b){toast('Record something first.','bad');return}if(!/^https?:\/\//i.test(c.base||'')||!c.model){toast('Add your Whisper server address and model under Transcription settings.','bad');return}
 await run('Transcribing with Whisper',async()=>{const fd=new FormData();fd.append('file',b,'call.'+((b.type.split('/')[1]||'webm').split(';')[0]));fd.append('model',c.model);
  const r=await fetch(c.base.replace(/\/+$/,'')+'/audio/transcriptions',{method:'POST',headers:WH.key?{Authorization:'Bearer '+WH.key}:{},body:fd,signal:ctl.signal});
  if(!r.ok)throw{code:'api',message:'The Whisper server answered '+r.status+'.'};const o=await r.json().catch(()=>null);const t=o&&typeof o.text==='string'?o.text.trim():'';if(!t)throw{code:'invalid_json',message:'The Whisper server returned no text.'};
  S.ui.draft.cText=t.slice(0,80000)},transcribe)}
const callsOf=j=>{j.calls=j.calls||[];return j.calls};
async function reviewCall(){const txt=D('cText').trim(),job=jobById(D('cJob')),kind=D('cKind')||CALL_KINDS[0],who=D('cWho').trim().slice(0,120);
 if(words(txt)<60){toast('Paste or import the call transcript first: at least a minute of conversation.','bad');return}
 await run('Reviewing the call',async()=>{const d=await askJSON(`Review a job search call from the candidate's side and help them follow up. The transcript may come from Whisper with no speaker labels; work out who is speaking from context and say so if unsure. Use only what the transcript says. Never invent a promise, number, name or detail.

Reply with only JSON: {"summary":"two or three sentences","well":["up to 4 things the candidate did well"],"improve":["up to 4 concrete things to do better next time"],"theyAsked":["questions the other side asked"],"learned":["what the candidate learned about the role, team, process or concerns"],"nextSteps":["next steps either side mentioned, with dates if said"],"points":["up to 5 follow-up points: thanks, answers to anything left open, anything promised"],"subject":"","body":"a follow-up email under 170 words in the candidate's voice, built from those points, specific to this call, signed with the candidate's name"}

CANDIDATE: ${S.profile.name||'the candidate'}
CALL: ${kind}${who?' with '+who:''}${job?' about '+roleName(job):''}
TRANSCRIPT:
${fence(txt.slice(0,60000))}`,'complex');
  const L=(x,n)=>(Array.isArray(x)?x:[]).slice(0,n).map(v=>String(v).slice(0,400)).filter(Boolean);
  const rec={id:uid('c'),at:Date.now(),kind,who,roundId:D('cRound')||'',words:words(txt),summary:String((d&&d.summary)||'').slice(0,800),well:L(d&&d.well,4),improve:L(d&&d.improve,4),theyAsked:L(d&&d.theyAsked,10),learned:L(d&&d.learned,8),nextSteps:L(d&&d.nextSteps,6),points:L(d&&d.points,5),subject:String((d&&d.subject)||'').slice(0,200),body:String((d&&d.body)||'').slice(0,3000)};
  S.ui.draftNumsOk=false;S.ui.call={jobId:job?job.id:'',rec,extra:txt};if(job){callsOf(job).unshift(Object.assign({transcript:txt.slice(0,60000)},rec));job.calls.length=Math.min(job.calls.length,20);Store.item('jobs',job)}},reviewCall)}
function callToRound(){const c=S.ui.call,job=c&&jobById(c.jobId),r=job&&prepOf(job).rounds.find(x=>x.id===c.rec.roundId);if(!r)return;r.debrief=r.debrief||{};let n=0;
 const put=(k,v)=>{if(v&&!String(r.debrief[k]||'').trim()){r.debrief[k]=v;n++}};put('asked',c.rec.theyAsked.join('\n'));put('well',c.rec.well.join('\n'));put('owed',c.rec.points.join('\n'));
 Store.item('jobs',job);render();toast(n?'Added to the round’s debrief. Fields you had filled in were left as they were.':'The round’s debrief was already filled in, so nothing was changed.')}
function callNext(){const c=S.ui.call,job=c&&jobById(c.jobId);if(!job||!c.rec.nextSteps.length)return;job.next=c.rec.nextSteps[0].slice(0,300);Store.item('jobs',job);render();toast('Next step set on the Dashboard. Add a follow-up date there.')}
async function copyFollow(){const c=S.ui.call;if(!c)return;const s=($('#cfSubj')||{}).value??c.rec.subject,b=($('#cfBody')||{}).value??c.rec.body,bad=strayNums(s+'\n'+b,c.extra+'\n'+((jobById(c.jobId)||{}).jdText||''));
 if(bad.length&&!S.ui.draftNumsOk){toast('Check the highlighted numbers first, then tick that they are right.','bad');return}
 try{await navigator.clipboard.writeText((s?s+'\n\n':'')+b);toast('Copied. Personalize it and send it yourself.')}catch(e){toast('Copy was blocked. Select the text and copy it by hand.','bad')}}
function vCallOut(){const c=S.ui.call;if(!c)return '';const r=c.rec,job=jobById(c.jobId),round=job&&prepOf(job).rounds.find(x=>x.id===r.roundId),bad=strayNums(r.subject+'\n'+r.body,c.extra+'\n'+((job||{}).jdText||'')),li=(t,a,cl)=>a.length?'<h3>'+t+'</h3><ul'+(cl?' class="'+cl+'"':'')+'>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';
 return '<div class="card proposal"><h2>Call review</h2>'+(r.summary?'<p>'+esc(r.summary)+'</p>':'')+li('What went well',r.well,'good')+li('Do better next time',r.improve)+li('What they asked',r.theyAsked)+li('What you learned',r.learned)+li('Next steps mentioned',r.nextSteps)
  +'<div class="row">'+(job&&r.nextSteps.length?'<button data-act="callNext">Use the first as my next step</button>':'')+(round?'<button data-act="callToRound">Add to the round’s debrief</button>':'')+'</div></div>'
  +'<div class="card"><h2>Follow-up email</h2>'+li('Points to cover',r.points)+'<p class="small">A draft from what was said on the call. Make it yours, then copy it and send it from your own email.</p><label>Subject<input type="text" id="cfSubj" value="'+esc(r.subject)+'"></label><label>Message<textarea id="cfBody" style="min-height:200px">'+esc(r.body)+'</textarea></label>'
  +(bad.length?'<div class="banner">These numbers were not said on the call or in your facts: '+bad.map(n=>'<b>'+esc(n)+'</b>').join(', ')+'.<label style="flex-direction:row;align-items:center;gap:8px;margin-top:8px"><input type="checkbox" data-chg="draftNumsOk"'+(S.ui.draftNumsOk?' checked':'')+'> I checked these numbers and they are true</label></div>':'')
  +'<div class="row"><button class="primary" data-act="copyFollow">Copy</button><button class="quiet" data-act="dropCall">Done</button></div></div>'}
function vCalls(){const wh=WH.get(),job=jobById(D('cJob')),rounds=job?prepOf(job).rounds:[],recOn=!!Rec.mr;let h='<div class="stack">';
 h+='<div class="card"><h2>Write to someone</h2><p class="lede">Cover letters and outreach notes from your approved facts, shaped to the posting. You copy and send them yourself.</p><div class="grid2"><label>Job<select id="oJob" data-draft="oJob">'+jobOptions('oJob','Choose a job')+'</select></label><label>What to write<select id="oKind" data-draft="oKind">'+DRAFT_KINDS.map(k=>'<option value="'+k[0]+'"'+((D('oKind')||'cover')===k[0]?' selected':'')+'>'+k[1]+'</option>').join('')+'</select></label><label>To (optional)<input type="text" id="oWho" data-draft="oWho" value="'+esc(D('oWho'))+'" placeholder="Name, and how you know them"></label></div><label>Anything to mention (optional, your own words)<textarea id="oNotes" data-draft="oNotes" style="min-height:70px" placeholder="We met at the partner summit in October.">'+esc(D('oNotes'))+'</textarea></label><div class="row"><button class="primary" data-act="writeDraft">Write draft</button></div></div>'+vDraftOut();
 const oj=jobById(D('oJob')),saved=oj?draftsOf(oj):[];if(saved.length)h+='<div class="card"><h2>Saved drafts for this job</h2>'+saved.map(x=>'<details class="item"><summary><b>'+esc((DRAFT_KINDS.find(k=>k[0]===x.kind)||DRAFT_KINDS[0])[1])+'</b> <span class="small">'+esc(new Date(x.at).toLocaleDateString())+(x.who?', to '+esc(x.who):'')+'</span></summary>'+(x.subject?'<p class="small"><b>Subject:</b> '+esc(x.subject)+'</p>':'')+'<div class="draftbox">'+esc(x.body)+'</div><div class="row"><button class="quiet danger" data-act="delDraft" data-id="'+x.id+'">Delete</button></div></details>').join('')+'</div>';
 h+='<div class="card"><h2>Review a call</h2><p class="lede">Bring in the transcript of a recruiter screen, interview or networking call. You get feedback on how it went, what they told you, the next steps and a follow-up email to personalize.</p><div class="grid2"><label>Job (optional)<select id="cJob" data-draft="cJob" data-chg="rerender">'+jobOptions('cJob','Not about one job')+'</select></label>'+(rounds.length?'<label>Interview round (optional)<select id="cRound" data-draft="cRound"><option value="">None</option>'+rounds.map(r=>'<option value="'+r.id+'"'+(D('cRound')===r.id?' selected':'')+'>'+esc((STAGES.find(s=>s[0]===r.stage)||STAGES[5])[1]+(r.who?', '+r.who:''))+'</option>').join('')+'</select></label>':'')+'<label>Kind of call<select id="cKind" data-draft="cKind">'+CALL_KINDS.map(k=>'<option'+(D('cKind')===k?' selected':'')+'>'+k+'</option>').join('')+'</select></label><label>Who was on it (optional)<input type="text" id="cWho" data-draft="cWho" value="'+esc(D('cWho'))+'" placeholder="Jordan, recruiter"></label></div>'
  +'<label>Transcript file from Whisper or a notes app (.txt, .vtt, .srt, .json)<input type="file" id="cFile" data-chg="callFile" accept=".txt,.vtt,.srt,.json,.md,text/plain"></label><label>Or paste the transcript<textarea id="cText" data-draft="cText" style="min-height:140px">'+esc(D('cText'))+'</textarea></label>'
  +'<details class="item"><summary><b>Record a call here</b> <span class="small">(needs a Whisper server to turn audio into text)</span></summary><p class="small">Recording laws differ: in some states everyone on the call must agree. Tell everyone you are recording and get their OK first. This records your microphone only; on a video call, your call app’s own recording or transcript catches both sides better.</p><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" data-chg="recOk"'+(S.ui.recOk?' checked':'')+'> Everyone on this call has agreed to be recorded</label><div class="row">'+(recOn?'<span class="rec"><i></i>Recording</span><button class="primary" data-act="recStop">Stop</button>':'<button data-act="recStart"'+(S.ui.recOk?'':' disabled')+'>Start recording</button>')+(Rec.blob&&!recOn?'<button data-act="recSave">Download the audio</button><button class="primary" data-act="transcribe">Transcribe</button>':'')+'</div>'
  +'<details><summary class="small">Transcription settings</summary><p class="small">A Claude key cannot turn audio into text. Use a Whisper server that accepts OpenAI-style requests: one running on your computer, or OpenAI’s own service with an OpenAI key. The audio goes only to the address you enter.</p><div class="grid2"><label>Server address<input type="url" id="whBase" data-chg="whBase" value="'+esc(wh.base||'')+'" placeholder="http://localhost:9000/v1"></label><label>Model name<input type="text" id="whModel" data-chg="whModel" value="'+esc(wh.model||'')+'" placeholder="as your server lists it"></label><label>Key, if the server needs one (kept until this tab closes)<input type="password" id="whKey" data-chg="whKey" autocomplete="off" value="'+(WH.key?'********':'')+'"></label></div></details></details>'
  +'<div class="row"><button class="primary" data-act="reviewCall">Review this call</button><span class="small">'+(D('cText')?words(D('cText'))+' words':'')+'</span></div></div>'+vCallOut();
 const past=job?callsOf(job):[];if(past.length)h+='<div class="card"><h2>Past calls for this job</h2>'+past.map(x=>'<div class="item"><div class="row"><b style="margin-right:auto">'+esc(new Date(x.at).toLocaleDateString())+', '+esc(x.kind)+(x.who?' with '+esc(x.who):'')+'</b><button data-act="callOpen" data-id="'+x.id+'">Open</button><button class="quiet danger" data-act="delCall" data-id="'+x.id+'">Delete</button></div>'+(x.summary?'<p class="small">'+esc(x.summary)+'</p>':'')+'</div>').join('')+'</div>';
 return h+'</div>'}
