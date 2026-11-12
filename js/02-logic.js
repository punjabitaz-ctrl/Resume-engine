"use strict";
/* ---------- pure logic: dates, keywords, numbers, scoring ---------- */
function dateKey(s){s=String(s||'').toLowerCase();if(!s)return 0;if(/present|current|now/.test(s))return 999912;const y=(s.match(/(19|20)\d{2}/)||[])[0];if(!y)return 0;const mi=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].findIndex(m=>s.includes(m));const mn=(s.match(/\b(0?[1-9]|1[0-2])[\/.-](?:19|20)\d{2}/)||[])[1];return +y*100+(mi>=0?mi+1:(mn?+mn:0))}
function sortedRoles(){return S.roles.slice().sort((a,b)=>(dateKey(b.end)||dateKey(b.start))-(dateKey(a.end)||dateKey(a.start))||dateKey(b.start)-dateKey(a.start))}
function roleDates(r){return [r.start,r.end].filter(Boolean).join(' - ')}
function hasTerm(text,term){const t=norm(term);if(!t)return false;const hay=' '+norm(text)+' ';const forms=[t];if(t.endsWith('s'))forms.push(t.slice(0,-1));else forms.push(t+'s');return forms.some(f=>hay.includes(' '+f+' ')||hay.includes(' '+f+'.')||hay.includes(' '+f+','))}
function kwHit(text,kw){return [kw.term].concat(kw.variants||[]).some(t=>hasTerm(text,t))}
function scoreText(job,text){const kws=(job&&job.analysis&&job.analysis.keywords)||[];let tot=0,got=0;const hit=[],miss=[];for(const k of kws){const w=Math.min(3,Math.max(1,+k.weight||1));tot+=w;if(kwHit(text,k)){got+=w;hit.push(k)}else miss.push(k)}return{pct:tot?Math.round(100*got/tot):0,hit,miss,total:kws.length}}
function nums(s){return (String(s??'').match(/\d[\d,]*(?:\.\d+)?/g)||[]).map(x=>x.replace(/,/g,'').replace(/\.0+$/,''))}
function unverifiedNums(text,evidence){const ev=new Set(nums(evidence));return nums(text).filter(n=>!ev.has(n))}
function factsText(list){return list.map(f=>f.text).join('\n')}
function usableFacts(){return S.facts.filter(f=>f.ok!==false&&!f.interviewOnly)}
function allEvidence(){return factsText(usableFacts())+'\n'+S.roles.map(r=>[r.company,r.title,r.location,r.start,r.end].join(' ')).join('\n')+'\n'+Object.values(S.profile).join(' ')}
function words(s){return (String(s).trim().match(/\S+/g)||[]).length}
function contactLine(){const p=S.profile;return [p.location,p.phone,p.email].concat(p.links||[]).filter(Boolean).join(' | ')}
function resumeText(r){const p=S.profile,L=[];L.push(p.name||'');if(r.headline)L.push(r.headline);L.push(contactLine());if(r.summary){L.push('','SUMMARY',r.summary)}if((r.skills||[]).length){L.push('','SKILLS');for(const g of r.skills)L.push((g.group?g.group+': ':'')+(g.items||[]).join(', '))}if((r.experience||[]).length){L.push('','EXPERIENCE');for(const e of r.experience){L.push('',[e.title,e.company].filter(Boolean).join(', ')+(e.location?' | '+e.location:'')+(e.dates?' | '+e.dates:''));for(const b of e.bullets||[])L.push('• '+b.text)}}if((r.projects||[]).length){L.push('','PROJECTS');for(const x of r.projects)L.push('• '+(x.name?x.name+': ':'')+x.text)}if((r.education||[]).length){L.push('','EDUCATION');for(const x of r.education)L.push(x.text)}if((r.certifications||[]).length){L.push('','CERTIFICATIONS');for(const x of r.certifications)L.push(x.text)}return L.join('\n')}
function flagsFor(r){const byId=Object.fromEntries(S.facts.map(f=>[f.id,f]));const all=allEvidence();const out=[];const chk=(where,text,ev)=>{const bad=unverifiedNums(text,ev);if(bad.length)out.push({where,text,nums:bad})};if(r.summary)chk('summary',r.summary,all);(r.experience||[]).forEach((e,i)=>{const role=S.roles.find(x=>x.id===e.roleId)||{};(e.bullets||[]).forEach((b,j)=>{const cited=(b.facts||[]).map(id=>byId[id]).filter(Boolean);const ev=factsText(cited)+' '+[role.start,role.end,e.dates].join(' ');if(!cited.length){if(unverifiedNums(b.text,all).length)out.push({where:'e'+i+'b'+j,text:b.text,nums:unverifiedNums(b.text,all)});else if(!(b.facts||[]).length)out.push({where:'e'+i+'b'+j,text:b.text,nums:[],nosrc:true})}else chk('e'+i+'b'+j,b.text,ev)})});(r.projects||[]).forEach((x,i)=>chk('p'+i,x.text,all));return out}
/* Words and phrases that read as filler or as machine-written. A term is allowed when the posting itself asks for it. */
const TIRED=['results-driven','results driven','detail-oriented','detail oriented','self-starter','self-starting','dynamic','proven track record','passionate','synergy','synergies','leverage','leveraged','leveraging','spearhead','spearheaded','spearheading','utilize','utilized','utilizing','robust','seamless','seamlessly','cutting-edge','cutting edge','delve','innovative','team player','go-getter','hard-working','highly motivated','fast-paced','thought leader','best-in-class','world-class','game-changing','holistic','orchestrated','championed','pivotal','fostered','harnessed','tapestry','testament','responsible for','duties included','worked on','assisted with','helped with'];
const STOP=new Set('the and for with that this from into over across were was are has have had their them they she his her its our your you who which while when where than then also more most very each per via within through including include about after before during under'.split(' '));
const stem=w=>w.length>4?w.replace(/(ing|ed|es|s)$/,''):w;
function toks(t){return (norm(t).match(/[a-z0-9+#&%.]+/g)||[]).map(w=>w.replace(/^\.+|\.+$/g,'')).filter(w=>w.length>2&&!STOP.has(w)).map(stem)}
function corpus(){const t=S.sources.filter(x=>x&&x.trusted!==false).map(x=>x.text).join('\n');return{words:new Set(toks(t)),nums:new Set(nums(t))}}
/* A fact counts as matching the user's own material when every number in it appears there and at least three quarters of its meaningful words do. */
function matchesSource(text,c){if(nums(text).some(n=>!c.nums.has(n)))return false;const w=toks(text).filter(x=>!/^\d/.test(x));if(!w.length)return true;return w.filter(x=>c.words.has(x)).length/w.length>=0.75}
function atsChecks(r,flags,job){const p=S.profile,t=resumeText(r),w=words(t),out=[],add=(g,ok,label,fix)=>out.push({g,ok:!!ok,label,fix:ok?'':fix||''});
 const bullets=(r.experience||[]).flatMap(e=>e.bullets||[]).map(b=>String(b.text||'')),body=[r.headline,r.summary].concat(bullets,(r.projects||[]).map(x=>x.text)).filter(Boolean).join('\n'),kws=(job&&job.analysis&&job.analysis.keywords)||[];
 // parses cleanly and can be found
 add('ats',p.email&&p.phone,'Contact line has email and phone');
 add('ats',r.summary&&(r.skills||[]).length&&(r.experience||[]).length,'Standard sections: Summary, Skills, Experience');
 add('ats',(r.education||[]).length>0,'Education section present');
 const badDates=(r.experience||[]).filter(e=>!/^[A-Z][a-z]{2} \d{4} - ([A-Z][a-z]{2} \d{4}|Present)$/.test(e.dates||'')).length;
 add('ats',badDates===0,badDates?badDates+' roles have dates that are missing or not in "Mon YYYY - Mon YYYY" form. Fix them in Fact base':'Every role has dates in one plain format');
 const title=job&&job.title?norm(job.title):'';if(title)add('ats',norm([r.headline,r.summary].join(' ')).includes(title),'The posting’s job title appears in the headline or summary','Work the exact job title "'+job.title+'" into the headline, if the facts support that kind of work.');
 const stuffed=kws.filter(k=>{const n=norm(k.term);return n.length>3&&norm(t).split(n).length-1>4}).map(k=>k.term);
 add('ats',!stuffed.length,stuffed.length?'Repeated too often: '+stuffed.slice(0,4).join(', '):'No term is repeated to the point of stuffing','Use each of these terms at most three times: '+stuffed.join(', ')+'.');
 const pairs=kws.map(k=>{const all=[k.term].concat(k.variants||[]),ac=all.find(x=>/^[A-Z0-9&]{2,6}$/.test(x)),lg=all.find(x=>x.split(' ').length>1);return ac&&lg?[ac,lg]:null}).filter(Boolean).filter(([ac,lg])=>hasTerm(t,ac)!==hasTerm(t,lg)&&(hasTerm(t,ac)||hasTerm(t,lg)));
 add('ats',!pairs.length,pairs.length?'Give both the short and long form: '+pairs.slice(0,3).map(x=>x[1]+' ('+x[0]+')').join(', '):'Abbreviations appear with their long form where it matters','Give both forms the first time: '+pairs.map(x=>x[1]+' ('+x[0]+')').join(', ')+'.');
 const odd=[...new Set((t.match(/[^\x09\x0a\x20-\x7e•’à-ÿ]/g)||[]))].filter(ch=>!/[–—]/.test(ch));
 add('ats',!odd.length,odd.length?'Unusual characters that some systems garble: '+odd.slice(0,6).join(' '):'Plain characters only','Replace these characters with plain ones: '+odd.join(' ')+'.');
 add('ats',w<=1100,'Length '+w+' words, about '+Math.max(1,Math.round(w/52)/10)+' pages (target 2 or fewer)','Cut the resume to under 850 words.');
 const numFlags=flags.filter(f=>f.nums.length).length;add('ats',numFlags===0,numFlags?numFlags+' lines contain numbers not found in your fact base':'Every number traces to your fact base');
 // reads like a person wrote it
 const dash=(body.match(/[–—]/g)||[]).length;add('human',!dash,dash?dash+' long dashes in the text':'No long dashes','Remove every em dash and en dash. Use a comma, a period, or the word "to".');
 const allowed=norm(kws.map(k=>k.term).join(' | ')),tired=TIRED.filter(x=>hasTerm(body,x)&&!allowed.includes(norm(x)));
 add('human',!tired.length,tired.length?'Filler or machine-sounding wording: '+tired.slice(0,6).join(', '):'No filler or machine-sounding wording','Replace these with plain, specific wording: '+tired.join(', ')+'.');
 const first=bullets.map(b=>(norm(b).split(' ')[0]||'')),cnt={};first.forEach(x=>{if(x)cnt[x]=(cnt[x]||0)+1});const rep=Object.keys(cnt).filter(k=>cnt[k]>2);
 const sameRole=(r.experience||[]).some(e=>{const f=(e.bullets||[]).map(b=>norm(b.text).split(' ')[0]);return new Set(f).size<f.length});
 add('human',!rep.length&&!sameRole,rep.length?'Bullets keep opening with: '+rep.join(', '):sameRole?'Two bullets under one role open with the same word':'Bullet openings are varied','Vary how bullets open. No verb may open more than two bullets, and never two under the same role.'+(rep.length?' Overused: '+rep.join(', ')+'.':''));
 const me=/\b(i|my|me|we|our)\b/i.test(body);add('human',!me,me?'First-person words (I, my, we, our)':'No first-person wording','Remove first-person words.');
 const lens=bullets.map(words),mean=lens.reduce((a,b)=>a+b,0)/(lens.length||1),sd=Math.sqrt(lens.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(lens.length||1));
 add('human',lens.length<6||sd>=3,lens.length>=6&&sd<3?'Every bullet runs about the same length, which reads as generated':'Bullet lengths vary naturally','Vary bullet length: mix short bullets of 10 to 14 words with fuller ones.');
 const long=lens.filter(x=>x>34).length;add('human',long===0,long?long+' bullets run past 34 words':'Bullets are a scannable length','Shorten any bullet over 30 words.');
 const vague=bullets.filter(b=>!/\d/.test(b)&&!/[A-Z][a-z]+ [A-Z]|[A-Z]{2,}/.test(b.slice(1))).length;
 add('human',bullets.length<4||vague<=bullets.length/2,vague>bullets.length/2?vague+' of '+bullets.length+' bullets name no number, product, partner or place':'Most bullets name something specific','Make bullets specific using only names and numbers already in the cited facts. Drop a bullet rather than leave it generic.');
 return out}
