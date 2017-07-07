var dateformat=require('dateformat');
var now=new Date();

console.log(dateformat(now,"yyyymmdd H:MM:ss"));
require('colors');
var _ = require('lodash');


var mongodb=require('mongodb');

var mongo_client=mongodb.MongoClient;

var db_url='mongodb://localhost:27017/forexdb';

mongo_client.connect(db_url,function(err,db){
if(err){
  console.log('unable to connect to mongodb', err);
} else {
  console.log('connection to mongodb established.',db_url);
}

var collection=db.collection('forex_history');

function forex_setup(){
  var CAD={_id:3,name:'CAD_History_1H',reqid:3,close:[],open:[],low:[],high:[],volume:[]};
  collection.insert(CAD,function(err,result){
  if(err){
    console.log(err);
  }else {
    console.log('Inserted %d documents into the forex collection.the documents inserted with "_id" are:',result.length,result);
  }
});

}

//forex_setup();


var ib = new (require('..'))({
  // clientId: 0,
  // host: '127.0.0.1',
  // port: 7496
}).on('error', function (err) {
  console.error(err.message.red);
}).on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
  if (_.includes([-1], open)) {
    console.log('endhistoricalData');
  } else {
    console.log(
    '%s %s%d %s%s %s%d %s%d %s%d %s%d %s%d %s%d %s%d %s%d',
    '[historicalData]'.cyan,
    'reqId='.bold, reqId,
    'date='.bold, date,
    'open='.bold, open,
    'high='.bold, high,
    'low='.bold, low,
    'close='.bold, close,
    'volume='.bold, volume,
    'barCount='.bold, barCount,
    'WAP='.bold, WAP,
    'hasGaps='.bold, hasGaps
    );
var str="'open':" + open + ",'close':" + close + ",'low':" + low + ",'high':" + high;
console.log("string str is" + str);

collection.update({name:'CAD_History_1H'},{$push: { close: close,open:open,low:low,high:high,volume:volume}},function(err,numUpdated){
   if(err){
      console.log(err);
   }else if(numUpdated){
      console.log('Updated Successfully %d documents.',numUpdated);
   } else {
      console.log('No document found with defined "find" critria!');
   }
});

}
});

ib.connect();

// tickerId, contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate
//ib.reqHistoricalData(1, ib.contract.stock('SPY','SMART','USD'), '20160308 12:00:00',durationStr='1800 S',barSizeSetting='1 secs',whatToShow='TRADES',useRTH=1,formatDate=1);  
ib.reqHistoricalData(1,  ib.contract.forex('CAD'),dateformat(now,"yyyymmdd H:MM:ss"),durationStr='1 D',barSizeSetting='1 hour',whatToShow='MIDPOINT',useRTH=1,formatDate=1);
//ib.reqHistoricalData(1,  ib.contract.forex('CAD'),'20160923 17:00:00',durationStr='7200 S',barSizeSetting='1 hour',whatToShow='ASK',useRTH=1,formatDate=1);
ib.on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
  if (_.includes([-1], open)) {
    //ib.cancelHistoricalData(1);  // tickerId
    ib.disconnect();
  }
});



//  ib.disconnect();
});
