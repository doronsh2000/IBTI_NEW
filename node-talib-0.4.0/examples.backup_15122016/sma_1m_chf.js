var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var in_position='';
var previous_sma_1m_level='';
var current_position='';
var mailOptions='';
var RedisEvent=require('redis-event');
var event=new RedisEvent('localhost',['forex_buy_and_sell']);
var nodemailer=require('../node_modules/nodemailer');
var take_profit_signal;
var start_position_close;


var smtpConfig = {
    host: 'localhost',
    port: 25
};

var transport=nodemailer.createTransport(smtpConfig);
var mongodb=require('mongodb');

var mongo_client=mongodb.MongoClient;

var db_url='mongodb://localhost:27017/forexdb';
  mongo_client.connect(db_url,function(err,db){
if(err){
  console.log('unable to connect to mongodb', err);
} else {
  console.log('connection to mongodb established.',db_url);
}

function calculate_sma(){
//console.log('calculate sma is called!');
// Load market data
var collection=db.collection('reqHistoryData');
collection.find({forex:{reqid:6,name:'CHF'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;


    in_position='';
    console.log('chf is currently not in position &  in_position is:' + in_position + ' '+ new Date());


        //recovery code after node restart or failure
        fs.exists('CHF-BUY.lock',function(exists){
            if(exists){
                console.log('set current_position=BUY');
                current_position="BUY";
            }
          });

        fs.exists('CHF-SELL.lock',function(exists){
            if(exists){
                console.log('set current_position=SELL');
                current_position="SELL";
            }
          });



//console.log('marketdata from mongo are:',result);


talib.execute({
    name: "SMA",
    startIdx: 0,
    endIdx: marketData[0].close.length - 1,
    inReal: marketData[0].close,
    optInTimePeriod: 7
}, function (result) {


    // Show the result array
    console.log("SMA Function Results:");
    console.log(result);
    //console.log(result.result.outReal[result.result.outReal.length-1]);
    console.log('CHF');


    current_sma_1m_level=result.result.outReal[result.result.outReal.length-1];
    previous_sma_1m_level=result.result.outReal[result.result.outReal.length-2];
    double_previous_sma_1m_level=result.result.outReal[result.result.outReal.length-3];    
    triple_previous_sma_1m_level=result.result.outReal[result.result.outReal.length-4];
    quad_previous_sma_1m_level=result.result.outReal[result.result.outReal.length-5];
 
    console.log('start_position_close is: ' + start_position_close);
    console.log('current CHF close is: ' + marketData[0].close[marketData[0].close.length-1]);
    console.log('current sma 1m is: ' + current_sma_1m_level);
    console.log('previous sma 1m is: ' + previous_sma_1m_level);
    console.log('double previous sma 1m is: ' + double_previous_sma_1m_level );
    console.log('the sma 1m sign is: ' + (current_sma_1m_level - previous_sma_1m_level));

/*
    if(marketData[0].close[marketData[0].close.length-1] - start_position_close > 0.00100 && take_profit_signal=='BUY' ){
         console.log('exiting!! i got my win in LONG!!- CHF');
          fs.appendFileSync('./signals.txt','take profit in signal CHF - we shoud win on long' + new Date() + ' \n');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
          event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'CHF',
              "reqid":6,
              "signal":"SELL",
              "take_profit":"true"
            });
           });

         take_profit_signal='';
         //current_position='';
         //process.exit(100);
    }
    if(start_position_close - marketData[0].close[marketData[0].close.length-1] > 0.00100 && take_profit_signal=='SELL'){
         console.log('exiting!! i got my win in SHORT!! - CHF');
          fs.appendFileSync('./signals.txt','take profit in signal CHF - we shoud win on short' + new Date() + '\n');
var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'CHF',
              "reqid":6,
              "signal":"BUY",
              "take_profit":"true"
           });
        });

         take_profit_signal='';
         //current_position='';
         //process.exit(100);
    }

*/

          
    if ( current_sma_1m_level- previous_sma_1m_level >0.00005 || current_sma_1m_level-double_previous_sma_1m_level> 0.00005 || current_sma_1m_level-triple_previous_sma_1m_level>0.00005 || current_sma_1m_level-quad_previous_sma_1m_level > 0.00005)  {

      if(current_position=="BUY"){
             console.log("we are already in a CHF-BUY position. don't send message to process new orders!");
      } else {

          if( current_sma_1m_level-triple_previous_sma_1m_level>15 ||  current_sma_1m_level-quad_previous_sma_1m_level>15){ 
               mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'CHF-BUY',
                 text:     'reason:current_sma_1m_level-double_previous_sma_1m_level>15'
              };
          } else {
         
              mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'CHF-BUY',
                 text:     'reason:previous_sma_1m_level <35 && current_sma_1m_level-previous_sma_1m_level>10).....'
              };
          }

          in_position='Y';

          console.log('chf in BUY & in_position is:' + in_position + ' '+ new Date());


          console.log('we should go for long');
          take_profit_signal='BUY';

          start_position_close=marketData[0].close[marketData[0].close.length-1];

/*
          transport.sendMail(mailOptions,function(error,info){
          if(error){
              return console.log(error);
          }
          console.log('Message send:' + info.response);
          });
*/
          // write to file to see why emails duplicates
          fs.appendFileSync('./signals.txt','chf in BUY & in_position is:' + in_position + ' '+ new Date()  + '\n');

          fs.writeFileSync('CHF-BUY.lock');
          fs.exists('CHF-SELL.lock',function(exists){
             if(exists){
                fs.unlinkSync('CHF-SELL.lock');
                console.log('we are in a long. created CHF-BUY.lock for recovery & deleted CHF-SELL.lock');
             }
          });


        
        current_position="BUY";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'CHF',
              "reqid":6,
              "signal":"BUY",
              "close": marketData[0].close[marketData[0].close.length-1]
           });
        });
        } 
      }


  if (  previous_sma_1m_level - current_sma_1m_level >0.00005 || double_previous_sma_1m_level - current_sma_1m_level > 0.00005 || triple_previous_sma_1m_level - current_sma_1m_level >0.00005 || quad_previous_sma_1m_level - current_sma_1m_level> 0.00005)  {

        if(current_position=="SELL"){
             console.log("we are already in a CHF-SELL position. don't send message to process new orders!");
        } else if( in_position=='Y'){
             console.log('exiting! process will restart by cron.we are in the middle of a BUY position. SELL algo is also match, but we would like to avoid duplicates');
             fs.appendFileSync('./signals.txt','exiting! process will restart by cron.we are in the middle of a EUR-BUY position.SELL algo is also match, but we would like to avoid duplicates'  + '\n');
            process.exit(50);

        } else {
          if(triple_previous_sma_1m_level-current_sma_1m_level>15 || quad_previous_sma_1m_level-current_sma_1m_level>15 ){
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'CHF-SELL',
              text:     'reason:double_previous_sma_1m_level-current_sma_1m_level>15'
           };
         } else {
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'CHF-SELL',
              text:     'reason:previous_sma_1m_level > 65 && previous_sma_1m_level- current_sma_1m_level>10'
            };
         }

          console.log('chf in SELL & in_position is:' + in_position + ' '+ new Date());

          console.log('we should go for short');
          take_profit_signal='SELL';

          start_position_close=marketData[0].close[marketData[0].close.length-1];

       /*
          transport.sendMail(mailOptions,function(error,info){
          if(error){
              return console.log(error);
          }
          console.log('Message send:' + info.response);
          });
       */
           // write to file to see why emails duplicates
          fs.appendFileSync('./signals.txt','chf in SELL & in_position is:' + in_position + ' '+ new Date()  + '\n');


          fs.writeFileSync('CHF-SELL.lock');
          fs.exists('CHF-BUY.lock',function(exists){
             if(exists){
                fs.unlinkSync('CHF-BUY.lock');
                console.log('we are in a long. created CHF-SELL.lock for recovery & deleted CHF-BUY.lock');
             }
          });

      
        current_position="SELL";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'CHF',
              "reqid":6,
              "signal":"SELL",
              "close": marketData[0].close[marketData[0].close.length-1]
           });
        });
       }
    }
  });
});
}


//calculate_sma();
//var event=new RedisEvent('localhost',['forex_buy_and_sell']);
//event.on('ready',function(){
   setInterval(calculate_sma ,10000);
//});
//db.close();

});
