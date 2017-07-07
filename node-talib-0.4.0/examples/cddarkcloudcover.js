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

function calculate_rsi(){
console.log('calculate rsi is called!');
// Load market data
var collection=db.collection('reqHistoryData');
collection.find({forex:{reqid:3,name:'CAD'}},{reqid:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;
console.log('marketdata from mongo are:',marketData[0].close);


// execute RSI indicator function with time period 9
talib.execute({
    name: "CDLDARKCLOUDCOVER",
    startIdx: 0,
    endIdx: marketData[0].close.length - 1,
    open: marketData[0].open,
    high:  marketData[0].high,
    close:  marketData[0].close,
    low:  marketData[0].low,
    optInPenetration: 0.3
}, function (result) {

    // Show the result array
    console.log("RSI Function Results:");
    console.log(result);
//    console.log(result.result.outReal[result.result.outReal.length-1]);
//    if(result.result.outReal[result.result.outReal.length-1] <20 || result.result.outReal[result.result.outReal.length-1] >80){
//       console.log('RSI in critical peeks. we should buy/sell');
//    }
  });
});
}


//calculate_rsi();
setInterval(calculate_rsi ,2000);

//db.close();

});
