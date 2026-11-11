// Simulates a genuine user tap. Ordinary dispatched events are untrusted, exactly like script-made clicks in a browser;
// this reaches into jsdom's internals to produce a trusted one. The app itself has no equivalent.
const utils=require('jsdom/lib/jsdom/living/generated/utils.js');
module.exports=(w,el)=>{if(!el)throw new Error('tap: no element');const ev=new w.MouseEvent('click',{bubbles:true,cancelable:true});const impl=utils.implForWrapper(ev);impl.isTrusted=true;utils.implForWrapper(el)._dispatch(impl)};
