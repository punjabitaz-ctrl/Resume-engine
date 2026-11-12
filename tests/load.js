// Tests load the real page with its own script and styles inlined, so one HTML string can be handed to jsdom.
const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
module.exports=()=>fs.readFileSync(path.join(root,'index.html'),'utf8')
 .replace('<link rel="stylesheet" href="app.css">',()=>'<style>'+fs.readFileSync(path.join(root,'app.css'),'utf8')+'</style>')
 .replace('<script src="app.js"></script>',()=>'<script>'+fs.readFileSync(path.join(root,'app.js'),'utf8')+'</script>');
