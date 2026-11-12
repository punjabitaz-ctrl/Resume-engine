// Tests load the real page with its own scripts and styles inlined, so one HTML string can be handed to jsdom.
// Each script stays a separate <script> element, in page order, exactly as a browser would run them.
const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
module.exports=()=>read('index.html')
 .replace('<link rel="stylesheet" href="app.css">',()=>'<style>'+read('app.css')+'</style>')
 .replace(/<script src="(js\/[\w-]+\.js)"><\/script>/g,(m,f)=>'<script>'+read(f)+'</script>');
module.exports.code=()=>fs.readdirSync(path.join(root,'js')).sort().map(f=>read('js/'+f)).join('\n');
