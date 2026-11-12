"use strict";
/* ---------- file intake ---------- */
const libs={};function lib(src){return libs[src]||(libs[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete libs[src];rej({code:'lib'})};document.head.appendChild(s)}))}
async function fileToText(file){const n=file.name.toLowerCase();if(n.endsWith('.pdf')){let pj;try{pj=await import('./lib/pdf.min.js')}catch(e){throw{code:'lib'}}pj.GlobalWorkerOptions.workerSrc='lib/pdf.worker.min.js';const pdf=await pj.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;let out='';for(let i=1;i<=pdf.numPages;i++){const tc=await (await pdf.getPage(i)).getTextContent();let last=null;for(const it of tc.items){if(last!==null&&Math.abs(it.transform[5]-last)>2)out+='\n';else if(out&&!out.endsWith('\n')&&!out.endsWith(' '))out+=' ';out+=it.str;last=it.transform[5]}out+='\n\n'}return out}
 if(n.endsWith('.docx')){await lib('lib/mammoth.browser.min.js');return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value}
 if(n.endsWith('.doc'))throw{code:'x',message:'old .doc files are not supported; save as .docx or PDF'};
 return await file.text()}

/* ---------- prompts ---------- */
const NO_INVENT='Use only what the text states. Never infer, round, upgrade or invent a number, title, date, employer, tool or outcome. Copy every figure exactly as written. If something is unclear, leave it out.';
function extractPrompt(src,text,part,parts,tail){return `You are building a structured career fact base for one job seeker from a source document. ${NO_INVENT}

Split the source into atomic, reusable facts: one accomplishment, responsibility, skill group, credential or project per fact. Write each fact as a complete standalone statement that keeps its numbers, scope, partner and product names, and context, so a resume writer can reuse it without seeing the source. Do not merge separate accomplishments. Do not drop detail to be brief.

Roles already in the fact base (if a role in the source is the same job, reuse its company and title strings exactly):
${JSON.stringify(S.roles.map(r=>({company:r.company,title:r.title,start:r.start,end:r.end})))}

Reply with only JSON in this shape:
{"profile":{"name":"","headline":"","email":"","phone":"","location":"","links":[""]},
"roles":[{"company":"","title":"","location":"","start":"Mon YYYY","end":"Mon YYYY or Present"}],
"facts":[{"kind":"achievement|responsibility|skill|project|education|certification|award|summary|other","text":"","company":"","title":"","tags":["2-5 short topical tags"]}]}
For facts tied to a job, set company and title to that role's strings; otherwise leave them empty. Leave unknown profile fields empty.

SOURCE TYPE: ${src.type}
SOURCE TITLE: ${src.title}${parts>1?'\nThis is part '+(part+1)+' of '+parts+' of the source. It may open in the middle of a role; the previous part ended with:\n'+tail+'\n':''}
SOURCE TEXT:
${fence(text)}`}
function jobPrompt(j){return `Analyze this job posting for resume targeting. Reply with only JSON:
{"company":"","title":"","location":"","seniority":"","summary":"two sentences on what this hire must deliver",
"mustHaves":["hard requirements, in the posting's words"],"niceToHaves":[""],
"keywords":[{"term":"exact phrase from the posting","variants":["common equivalent spellings, acronyms or synonyms an ATS or recruiter would also search"],"type":"skill|tool|domain|title|credential|soft","weight":3}]}
Give 20 to 32 keywords, the terms an ATS or recruiter screen would match on. weight 3 = appears in the title or requirements or is repeated, 2 = stated responsibility, 1 = nice to have. Prefer specific multi-word phrases over generic words. Skip boilerplate, benefits and legal text.

${j.company?'COMPANY: '+j.company+'\n':''}${j.title?'TITLE: '+j.title+'\n':''}POSTING:
${fence(String(j.jdText).slice(0,30000))}`}
function interviewPrompt(job){return `You are a resume strategist running an intake interview. Below is the candidate's fact base${job?' and a target job':''}. Ask the 7 questions whose answers would most strengthen the resume: missing numbers (revenue, quota, partner counts, growth, team size, deal size), unclear scope, tools and platforms, and evidence for the target requirements that the fact base does not yet cover. Each question must name the specific role or fact it refers to. Do not ask about anything already answered in the facts.

Reply with only JSON: {"questions":[{"q":"","why":"one short clause on what this unlocks","company":"","title":""}]}

ROLES: ${JSON.stringify(sortedRoles().map(r=>({company:r.company,title:r.title,dates:roleDates(r)})))}
FACTS:
${factLines()}
${job&&job.analysis?'TARGET JOB: '+JSON.stringify({title:job.title,company:job.company,mustHaves:job.analysis.mustHaves,keywords:job.analysis.keywords.map(k=>k.term)}):''}`}
function factsFor(job){const fs=usableFacts(),cap=+AI.cfg.factCap||0;if(!cap||!job||!job.analysis||fs.length<=cap)return fs;const kws=job.analysis.keywords||[],sc=f=>kws.reduce((n,k)=>n+(kwHit(f.text+' '+(f.tags||[]).join(' '),k)?(+k.weight||1):0),0)+(['education','certification','skill'].includes(f.kind)?2:0);return fs.map((f,i)=>({f,i,s:sc(f)})).sort((a,b)=>b.s-a.s||a.i-b.i).slice(0,cap).sort((a,b)=>a.i-b.i).map(x=>x.f)}
function factLines(list){return (list||usableFacts()).map(f=>f.id+' | '+f.kind+' | '+(f.roleId||'-')+' | '+f.text.replace(/\s+/g,' ')).join('\n')}
function writerPrompt(job,extra,prev){const a=job.analysis||{};return `You are a master resume writer with a track record of landing interviews for experienced professionals in any field. Write a bespoke resume for the target job below, built only from the candidate's fact base.

TRUTH RULES (absolute)
- Every line must be supported by the facts you cite. ${NO_INVENT}
- A number may appear only if the same number appears in a fact you cite for that line. No estimates, no ranges, no "approximately".
- If the job requires something the facts do not support, do not write it. List it in "gaps".
- Keep every role's company, title and dates exactly as given. Never retitle a role.

WRITING RULES
- Mirror the posting's exact terms wherever the facts truthfully support them, so ATS and recruiter keyword screens match. Use the posting's phrasing over a synonym.
- Facts of kind "win" are full accomplishment stories in the candidate's own words, with the situation, task, action and result. Build the strongest bullets from them: the action first, the result last, numbers exactly as given. Choose a relevant win over a plain responsibility. One win makes one bullet, or two when it holds two distinct results.
- Bullets: strong verb first, then scope, then result. One idea each, 14 to 30 words. Lead each role with the bullets most relevant to this job. No first person, no filler ("responsible for", "results-driven", "proven track record").
- Recent and relevant roles get 4 to 6 bullets; older or less relevant roles get 1 to 3. Include every role so there are no date gaps, newest first.
- Summary: 3 sentences aimed at this job, opening with the candidate's professional identity in the posting's language, grounded in facts.
- Headline: the target title or closest truthful equivalent, plus 2 or 3 specialties.
- Skills: 3 to 4 groups of the posting's keywords the facts support, most important first.
- ${D('len')==='1'?'Fit one page: about 380 to 480 words in total, 2 to 4 bullets for recent relevant roles and 1 for older ones.':'Fit two pages: about 650 to 850 words in total.'}
- Plain text only. No tables, columns, icons, emoji or special symbols.

HUMAN VOICE (a recruiter must not be able to tell that software helped)
- Never use an em dash or an en dash. Use a comma, a period, or the word "to".
- Use plain verbs a person would say out loud: built, ran, cut, grew, signed, launched, fixed, led, sold, trained, opened, closed. Never use: ${TIRED.join(', ')}.
- No two bullets under one role open with the same word, and no word opens more than two bullets in the whole resume.
- Vary bullet length and shape. Some short, some fuller. Do not give every bullet the same rhythm and do not fall into lists of three.
- Every bullet names something specific from its facts: a partner, a product, a number, a team, a place. If a bullet could sit on anyone's resume, rewrite it from the facts or drop it.
- No claims about personal qualities and no stacked adjectives. Show the work and let it speak.

TRACKING SYSTEMS AND RECRUITER SEARCH
- A tracking system turns the resume into text fields, recruiters search it by job title and skill terms, then a person reads it for a few seconds. Write for all three.
- Put the posting's exact job title in the headline when the facts show the candidate doing that kind of work.
- For each skill the facts support, use the posting's exact phrase once in a sentence about real work and list it under Skills. Never use any term more than three times.
- The first time an abbreviation matters, give both forms, like "Search Engine Optimization (SEO)".
- Write date ranges exactly as given in ROLES.
${standing().length?'\nSTANDING INSTRUCTIONS FROM THE CANDIDATE (follow unless they conflict with the truth rules)\n'+standing().map(m=>'- '+m.text).join('\n'):''}${lessonsFor('resume').length?'\nLEARNED FROM THIS CANDIDATE\'S OWN EDITS AND RESULTS (apply in proportion to strength, 5 is strongest; "avoid" means do less of it; the truth rules always win)\n'+lessonsFor('resume').map(m=>'- ['+m.dir+', strength '+m.strength+'] '+m.text).join('\n'):''}${editPairs().length?'\nRECENT HAND EDITS BY THE CANDIDATE (match the style of the "after" lines)\n'+editPairs().slice(0,6).map(x=>'- before: '+x.before+'\n  after: '+x.after).join('\n'):''}${extra?'\nDIRECTION FOR THIS VERSION\n'+extra:''}

Reply with only JSON in this shape:
{"headline":"","summary":"","skills":[{"group":"","items":[""]}],
"experience":[{"roleId":"","company":"","title":"","location":"","dates":"","bullets":[{"text":"","facts":["fact ids"]}]}],
"projects":[{"name":"","text":"","facts":["fact ids"]}],"education":[{"text":""}],"certifications":[{"text":""}],
"gaps":[{"requirement":"","note":"what evidence would close it"}],"notes":"two sentences on the positioning angle you chose"}

CANDIDATE: ${JSON.stringify({name:S.profile.name,headline:S.profile.headline,location:S.profile.location})}
ROLES: ${JSON.stringify(sortedRoles().map(r=>({roleId:r.id,company:r.company,title:r.title,location:r.location,dates:roleDates(r)})))}
FACTS (id | kind | roleId | text):
${factLines(factsFor(job))}

TARGET JOB: ${JSON.stringify({company:job.company,title:job.title,seniority:a.seniority,summary:a.summary,mustHaves:a.mustHaves,niceToHaves:a.niceToHaves,keywords:(a.keywords||[]).map(k=>({term:k.term,weight:k.weight}))})}
POSTING TEXT:
${fence(String(job.jdText).slice(0,14000))}${prev&&prev.adapt?`\n\nADAPTATION TASK\nBelow is a resume this candidate wrote for a different job. Use it as the starting point for this posting: keep the lines that serve this job, reword them to this posting's terms, reorder for relevance, and replace lines that do not fit with better material from the fact base. Every line must still cite facts and obey the truth rules.\nSTARTING RESUME: ${JSON.stringify(prev.resume)}`:''}${prev&&!prev.adapt?`\n\nREVISION TASK\nBelow is the current draft. Return an improved full resume in the same JSON shape. Keep what already works and keep every line truthful.${prev.terms.length?'\n- Work in these posting terms, which the fact base supports, only in lines whose cited facts support them: '+prev.terms.join('; '):''}${prev.flagged.length?'\n- These lines contain numbers that are not in their cited facts. Correct each to match the facts exactly, or remove the number:\n'+prev.flagged.map(f=>'  * '+f).join('\n'):''}${(prev.style||[]).length?'\n- Also fix these:\n'+prev.style.map(x=>'  * '+x).join('\n'):''}
CURRENT DRAFT: ${JSON.stringify(prev.resume)}`:''}`}
