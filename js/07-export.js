"use strict";
/* ---------- export ---------- */
function fileBase(rec){const job=S.jobs.find(j=>j.id===rec.jobId)||{};return [S.profile.name||'Resume',job.company,job.title].filter(Boolean).join(' - ').replace(/[^\w .&-]+/g,'').replace(/\s+/g,' ').trim().slice(0,90)}
async function save(filename,data){let dl=null;try{dl=window.claude&&claude.use?await claude.use('downloads'):null}catch(e){}if(!dl){if(IN_CLAUDE){toast('Downloads are not available in this view. Use Copy text instead.','bad');return}try{const blob=data instanceof Blob?data:new Blob([data]),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('Saved '+filename)}catch(e){toast('The browser blocked the download.','bad')}return}try{await dl.save({filename,data});toast('Saved '+filename)}catch(e){if(e&&e.code!=='declined')toast('Could not save the file ('+((e&&e.code)||'error')+').','bad')}}
function buildDocx(r,tp){const X=window.docx,P=X.Paragraph,T=X.TextRun,Z=Math.round(tp.size*2+.6),m=tp.margin*20;const run=(t,o)=>new T(Object.assign({text:t,font:tp.docx,size:Z},o||{}));const al=tp.center?X.AlignmentType.CENTER:X.AlignmentType.LEFT;const kids=[];
 for(const b of blocks(r,tp)){
  if(b.t==='name')kids.push(new P({alignment:al,children:[run(b.text,{bold:true,size:Z+13})]}));
  else if(b.t==='headline')kids.push(new P({alignment:al,children:[run(b.text,{size:Z+1})]}));
  else if(b.t==='contact')kids.push(new P({alignment:al,spacing:{after:80},children:[run(b.text,{size:Z-1})]}));
  else if(b.t==='head')kids.push(new P(Object.assign({spacing:{before:tp.rule?200:280,after:70},children:[run(b.text.toUpperCase(),{bold:true,size:Z+1})]},tp.rule?{border:{bottom:{style:X.BorderStyle.SINGLE,size:6,color:'000000',space:1}}}:{})));
  else if(b.t==='para')kids.push(new P({spacing:{after:30},children:[run(b.text)]}));
  else if(b.t==='skill')kids.push(new P({spacing:{after:30},children:(b.group?[run(b.group+': ',{bold:true})]:[]).concat([run(b.text)])}));
  else if(b.t==='role')kids.push(new P({spacing:{before:120,after:40},tabStops:[{type:X.TabStopType.RIGHT,position:12240-2*m}],children:[run(b.left,{bold:true}),run('\t'+b.right)]}));
  else if(b.t==='bullet')kids.push(new P({bullet:{level:0},spacing:{after:30},children:(b.lead?[run(b.lead+': ',{bold:true})]:[]).concat([run(b.text)])}))}
 const p=S.profile;return new X.Document({creator:p.name||'',title:(p.name||'')+' Resume',sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:m,bottom:m,left:m,right:m}}},children:kids}]})}
const pdfSafe=s=>String(s??'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/•/g,'-').replace(/ /g,' ').replace(/[^\x09\x0a\x20-\x7e\xa1-\xff]/g,'');
function buildPdf(r,tp){const doc=new window.jspdf.jsPDF({unit:'pt',format:'letter'});const M=tp.margin,W=612-2*M,BOT=792-M,F=tp.pdf,Z=tp.size;let y=M+10,prev='';const p=S.profile;
 const need=h=>{if(y+h>BOT){doc.addPage();y=M+10}};
 const para=(t,o)=>{o=o||{};const size=o.size||Z;doc.setFont(F,o.bold?'bold':'normal');doc.setFontSize(size);const x=M+(o.indent||0);const lines=doc.splitTextToSize(pdfSafe(t),W-(o.indent||0));const lh=size*1.32;lines.forEach((ln,i)=>{need(lh);if(o.center)doc.text(ln,306,y,{align:'center'});else{if(o.bullet&&i===0)doc.text('•',M+4,y);doc.text(ln,x,y)}y+=lh});y+=o.after||0};
 for(const b of blocks(r,tp)){
  if(b.t==='name')para(b.text,{size:Z+7,bold:true,center:tp.center});
  else if(b.t==='headline')para(b.text,{size:Z+.6,center:tp.center});
  else if(b.t==='contact')para(b.text,{size:Z-.6,center:tp.center,after:2});
  else if(b.t==='head'){y+=tp.rule?8:13;need(34);doc.setFont(F,'bold');doc.setFontSize(Z+.6);doc.text(pdfSafe(b.text.toUpperCase()),M,y);if(tp.rule){y+=4;doc.setLineWidth(.7);doc.line(M,y,M+W,y);y+=12}else y+=14}
  else if(b.t==='para')para(b.text,{after:1});
  else if(b.t==='skill')para((b.group?b.group+': ':'')+b.text,{after:1});
  else if(b.t==='role'){if(prev!=='head')y+=6;need(Z*4);doc.setFont(F,'normal');doc.setFontSize(Z);const dw=doc.getTextWidth(pdfSafe(b.right));doc.text(pdfSafe(b.right),M+W,y,{align:'right'});doc.setFont(F,'bold');doc.splitTextToSize(pdfSafe(b.left),W-dw-14).forEach(ln=>{need(Z*1.32);doc.text(ln,M,y);y+=Z*1.32});y+=1}
  else if(b.t==='bullet')para((b.lead?b.lead+': ':'')+b.text,{bullet:true,indent:14,after:1.5});
  prev=b.t}
 doc.setProperties({title:pdfSafe((p.name||'')+' Resume'),author:pdfSafe(p.name||'')});return doc}
async function exportAs(kind){const rec=S.resumes.find(r=>r.id===S.ui.resId);if(!rec)return;{const sig=numSig(rec.resume);if(sig&&rec.numsOk!==sig){toast('Confirm the numbers in this version first. See "Numbers to confirm" above the resume.','bad');const el=document.getElementById('numcheck');if(el&&el.scrollIntoView)el.scrollIntoView();return}}const base=fileBase(rec);try{if(kind==='docx'){await lib('lib/docx.umd.js');await save(base+'.docx',await window.docx.Packer.toBlob(buildDocx(rec.resume,tplOf(rec))))}else if(kind==='pdf'){await lib('lib/jspdf.umd.min.js');await save(base+'.pdf',buildPdf(rec.resume,tplOf(rec)).output('blob'))}else if(kind==='txt'){await save(base+'.txt',resumeText(rec.resume))}else{try{await navigator.clipboard.writeText(resumeText(rec.resume));toast('Resume text copied')}catch(e){toast('Copy was blocked. Use the TXT download.','bad')}}}catch(e){console.error(scrub((e&&e.code?e.code+' ':'')+((e&&e.message)||e||'')));toast(errCopy(e),'bad')}}
