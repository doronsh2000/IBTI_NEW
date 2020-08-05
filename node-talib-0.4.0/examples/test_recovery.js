var fs=require('fs');
var regexp=require('node-regexp');
var re=regexp().must('gbp').ignoreCase().toRegExp();

name="GBP";
signal="BUY";

if(fs.existsSync(name+"-"+'BUY.lock') || fs.existsSync(name+"-"+'SELL.lock')){

console.log('file with coin' + name + ' exists!');
}

var res= re.test("GBP-SELL");
console.log('res of regex is:'  + res);

var re=regexp().must('cad').ignoreCase().toRegExp();
var res= re.test("CAD-BUY");
console.log('res of regex is:'  + res);



//var path=require('path');
  fs.exists('gbi-buy.lock',function(exists){
    if(exists){
       console.log('set current_position=BUY');
    }
    
  });
  fs.exists('gbi-sell.lock',function(exists){
    if(exists){
       console.log('set current_position=SELL');
    }
  });
//  fs.writeFileSync('gbi-buy.lock');
