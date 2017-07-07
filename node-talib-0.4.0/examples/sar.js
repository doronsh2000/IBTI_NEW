var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();

var mongodb=require('mongodb');

var mongo_client=mongodb.MongoClient;

var db_url='mongodb://localhost:27017/forexdb';
  mongo_client.connect(db_url,function(err,db){
if(err){
  console.log('unable to connect to mongodb', err);
} else {
  console.log('connection to mongodb established.',db_url);
}

function calculate_sar(){
console.log('calculate sar is called!');
// Load market data
var collection=db.collection('forex_history');
collection.find({},{reqid:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;
console.log('high for SAR from mongo are:',marketData[0].high);
console.log('low for SAR from mongo are:', marketData[0].low);


// execute SAR indicator function with time period 9
talib.execute({
    name: "SAR",
    startIdx: 0,
    endIdx: marketData[0].high.length - 1,
    high: marketData[0].high,
    low: marketData[0].low,
    optInMaximum: '0.2',
    optInAcceleration: '0.02'
}, function (result) {

    // Show the result array
    console.log("SAR Function Results:");
    console.log(result);
    console.log(result.result.outReal[result.result.outReal.length-1]);
    if(result.result.outReal[result.result.outReal.length-1] <20 || result.result.outReal[result.result.outReal.length-1] >80){
       console.log('SAR in critical peeks. we should buy/sell');
    }
  });
});
}


//calculate_rsi();
setInterval(calculate_sar ,2000);

//db.close();

});
