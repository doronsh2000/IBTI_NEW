forex_advisor=function(){

var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var previous_item='';
var in_position='';
var updown=0;
var collection='';
var previous_rsi_1m_level='';
var current_position='';
var mailOptions='';
var RedisEvent=require('redis-event');
var nodemailer=require('../node_modules/nodemailer');


var mongodb=require('mongodb');

var mongo_client=mongodb.MongoClient;

var db_url='mongodb://localhost:27017/forexdb';
  mongo_client.connect(db_url,function(err,db){
if(err){
  console.log('unable to connect to mongodb', err);
} else {
  console.log('connection to mongodb established.',db_url);
}
collection=db.collection('reqHistoryDataAdvisor');

collection.find({forex:{reqid:2,name:'EUR'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;
var closed_arr=marketData[0].close;

closed_arr.forEach(function(item){
    if(previous_item==''){
      previous_item=item;
    } else {
      updown=updown+(item-previous_item);
      previous_item=item;
    }
});
console.log("updown inside find" + updown);
client.set("updown_eur",updown,redis.print);
});

});
}

forex_advisor();
