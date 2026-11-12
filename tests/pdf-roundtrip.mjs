// The PDF the app writes must be readable by the PDF reader the app ships. Runs both real libraries in Node.
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const dir=path.dirname(fileURLToPath(import.meta.url));const file=path.join(dir,'out','tpl-classic.pdf');
if(!fs.existsSync(file)){console.log('FAIL no exported PDF found; run tests/versions.js first');process.exit(1)}
const pj=await import(path.join(dir,'../lib/pdf.min.js'));
pj.GlobalWorkerOptions.workerSrc=path.join(dir,'../lib/pdf.worker.min.js');
const pdf=await pj.getDocument({data:new Uint8Array(fs.readFileSync(file)),isEvalSupported:false,useWorkerFetch:false,disableFontFace:true}).promise;
let out='';for(let i=1;i<=pdf.numPages;i++){const tc=await (await pdf.getPage(i)).getTextContent();let last=null;for(const it of tc.items){if(last!==null&&Math.abs(it.transform[5]-last)>2)out+='\n';else if(out&&!out.endsWith('\n')&&!out.endsWith(' '))out+=' ';out+=it.str;last=it.transform[5]}out+='\n\n'}
const good=out.includes('Sample Person')&&/EXPERIENCE/.test(out)&&out.includes('Signed 12 new distribution partners');
console.log((good?'PASS ':'FAIL ')+'the bundled PDF reader ('+pj.version+') reads back the PDF the app exports: '+out.split('\n').filter(Boolean).length+' lines');if(!good){console.log(out.slice(0,400));process.exit(1)}
