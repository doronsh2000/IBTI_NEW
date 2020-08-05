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

/*
client.on('connect',function(){
  console.log('connected');
});

client.rpop('forex1',function(err,reply){
    if(reply){
        var jsonContent={'reqId':'3','open':'1.30828','close':'1.30828','low':'1.30828','high':'1.30828'};
        console.log("reqId is: " , jsonContent.reqId);
        calculate_rsi();
          
    }
    else { console.log('probably empty Redis List Queue')};
});

*/ 

function calculate_rsi(){
// Load market data
var collection=db.collection('forex');
var marketData=collection.find({});
console.log('marketdata from mongo are:', marketData);


// execute RSI indicator function with time period 9
talib.execute({
    name: "RSI",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: 9
}, function (result) {

    // Show the result array
    console.log("RSI Function Results:");
    console.log(result);

});

}

db.close();
});

