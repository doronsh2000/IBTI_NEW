const fs=require('fs');
const efs=require('extfs');

if(!efs.isEmptySync('./queue_file.txt')){
   var content=fs.readFileSync('./queue_file.txt','utf8');
   var jsonContent=JSON.parse(content);
   console.log(jsonContent.name);
     console.log('empty');
}
