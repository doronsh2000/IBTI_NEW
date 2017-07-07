var fs=require('fs');
var temp_arr=[];
var hold_keys=[];
var lines=fs.readFileSync('signals.txt','utf-8').toString().split("\n");
//lines=lines.toString().split(",");
for (var i=lines.length-1;i>-1;i--){
//     console.log(lines[i]);
      temp_arr=lines[i].split(",");
   //  console.log(temp_arr);
     for (key in hold_keys){
       if(key==temp_arr[0]){
          console.log(key);
       } else {
          hold_keys.temp_arr[0]=temp_arr[1];
       }
     }
} 

console.log(hold_keys);
