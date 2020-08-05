var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var previous_rsi_1m_level='';
var RedisEvent=require('redis-event');

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
collection.find({},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;
//console.log('marketdata from mongo are:',result);

// execute RSI indicator function with time period 9
talib.execute({
    name: "RSI",
    startIdx: 0,
    endIdx: marketData[0].close.length - 1,
    inReal: marketData[0].close,
    optInTimePeriod: 9
}, function (result) {

    // Show the result array
    console.log("RSI Function Results:");
    console.log(result);
    console.log(result.result.outReal[result.result.outReal.length-1]);
    current_rsi_1m_level=result.result.outReal[result.result.outReal.length-1];
    
    if(result.result.outReal[result.result.outReal.length-1] <30) {
       console.log('we should go for long');
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
        event.pub('forex_buy_and_sell:app',{

           "name":result.name,
           "reqid":result.reqid,
           "signal":"BUY"
        });
    });

    }
    if (result.result.outReal[result.result.outReal.length-1]> 70){
       console.log('we should go for short');
        
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
        event.pub('forex_buy_and_sell:app',{
           "name":result.name,
           "reqid":result.reqid,
           "signal":"SELL"
        });
     });

    }
  });
});
}


//calculate_rsi();
setInterval(calculate_rsi ,5000);

//db.close();

});
