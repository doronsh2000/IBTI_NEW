var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var in_position='';
var previous_rsi_1m_level='';
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

function calculate_rsi(){
//console.log('calculate rsi is called!');
// Load market data
var collection=db.collection('reqHistoryData');
collection.find({forex:{reqid:2,name:'EUR'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;


    in_position='';
    console.log('eur is currently not in position &  in_position is:' + in_position + ' '+ new Date());


        //recovery code after node restart or failure
        fs.exists('EUR-BUY.lock',function(exists){
            if(exists){
                console.log('set current_position=BUY');
                current_position="BUY";
            }
          });

        fs.exists('EUR-SELL.lock',function(exists){
            if(exists){
                console.log('set current_position=SELL');
                current_position="SELL";
            }
          });



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
    console.log('EUR');


    current_rsi_1m_level=result.result.outReal[result.result.outReal.length-1];
    previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-2];
    double_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-3];    
    triple_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-4];
    quad_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-5];
 
    console.log('start_position_close is: ' + start_position_close);
    console.log('current EUR close is: ' + marketData[0].close[marketData[0].close.length-1]);

    if(marketData[0].close[marketData[0].close.length-1] - start_position_close > 0.00050 && take_profit_signal=='BUY' ){
         console.log('exiting!! i got my win in LONG!!- EUR');
          fs.appendFileSync('./signals.txt','take profit in signal EUR - we shoud win on long' + new Date() + '\n');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
          event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'EUR',
              "reqid":2,
              "signal":"SELL",
              "take_profit":"true"
            });
           });

         take_profit_signal='';
         //current_position='';
         // process.exit(100);
    }
    if(start_position_close - marketData[0].close[marketData[0].close.length-1] > 0.00050 && take_profit_signal=='SELL'){
         console.log('exiting!! i got my win in SHORT!! - EUR');
          fs.appendFileSync('./signals.txt','take profit in signal EUR - we shoud win on short' + new Date() + '\n');
var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'EUR',
              "reqid":2,
              "signal":"BUY",
              "take_profit":"true"
           });
        });

         take_profit_signal='';
        // current_position='';
         //process.exit(100);
    }


      if (  ( current_rsi_1m_level-triple_previous_rsi_1m_level>20 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>20 ) || (previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>20) || ( double_previous_rsi_1m_level<35 && current_rsi_1m_level-double_previous_rsi_1m_level>20 ) || ( triple_previous_rsi_1m_level<35 && current_rsi_1m_level-triple_previous_rsi_1m_level>20) || (quad_previous_rsi_1m_level<35 && current_rsi_1m_level-quad_previous_rsi_1m_level>20) ) {
          
      if(current_position=="BUY"){
             console.log("we are already in a EUR-BUY position. don't send message to process new orders!");
      } else {

          if( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15){ 
               mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'EUR-BUY',
                 text:     'reason:current_rsi_1m_level-double_previous_rsi_1m_level>15'
              };
          } else {
         
              mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'EUR-BUY',
                 text:     'reason:previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>10).....'
              };
          }

          in_position='Y';

          console.log('eur in BUY & in_position is:' + in_position + ' '+ new Date());


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
          fs.appendFileSync('./signals.txt','eur in BUY & in_position is:' + in_position + ' '+ new Date()  + '\n');

          fs.writeFileSync('EUR-BUY.lock');
          fs.exists('EUR-SELL.lock',function(exists){
             if(exists){
                fs.unlinkSync('EUR-SELL.lock');
                console.log('we are in a long. created EUR-BUY.lock for recovery & deleted EUR-SELL.lock');
             }
          });


        
        current_position="BUY";
var event=new RedisEvent('localhost',['forex_buy_and_sell']);

        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'EUR',
              "reqid":2,
              "signal":"BUY"
           });
        });
        } 
      }
        if(( triple_previous_rsi_1m_level-current_rsi_1m_level>20 || quad_previous_rsi_1m_level-current_rsi_1m_level>20 )|| (previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>20) ||( double_previous_rsi_1m_level>65 && double_previous_rsi_1m_level-current_rsi_1m_level>20 ) || (triple_previous_rsi_1m_level>65 && triple_previous_rsi_1m_level-current_rsi_1m_level>20 ) || (quad_previous_rsi_1m_level>65 && quad_previous_rsi_1m_level-current_rsi_1m_level>20)){

        if(current_position=="SELL"){
             console.log("we are already in a EUR-SELL position. don't send message to process new orders!");
        } else if( in_position=='Y'){
             console.log('exiting! process will restart by cron.we are in the middle of a BUY position. SELL algo is also match, but we would like to avoid duplicates');
             fs.appendFileSync('./signals.txt','exiting! process will restart by cron.we are in the middle of a EUR-BUY position.SELL algo is also match, but we would like to avoid duplicates'  + '\n');
            process.exit(50);

        } else {
          if(triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15 ){
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'EUR-SELL',
              text:     'reason:double_previous_rsi_1m_level-current_rsi_1m_level>15'
           };
         } else {
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'EUR-SELL',
              text:     'reason:previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>10'
            };
         }

          console.log('eur in SELL & in_position is:' + in_position + ' '+ new Date());

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
          fs.appendFileSync('./signals.txt','eur in SELL & in_position is:' + in_position + ' '+ new Date()  + '\n');


          fs.writeFileSync('EUR-SELL.lock');
          fs.exists('EUR-BUY.lock',function(exists){
             if(exists){
                fs.unlinkSync('EUR-BUY.lock');
                console.log('we are in a long. created EUR-SELL.lock for recovery & deleted EUR-BUY.lock');
             }
          });

      
        current_position="SELL";
var event=new RedisEvent('localhost',['forex_buy_and_sell']);

        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'EUR',
              "reqid":2,
              "signal":"SELL"
           });
        });
       }
    }
  });
});
}


//calculate_rsi();
//var event=new RedisEvent('localhost',['forex_buy_and_sell']);
//event.on('ready',function(){
   setInterval(calculate_rsi ,10000);
//});
//db.close();

});
