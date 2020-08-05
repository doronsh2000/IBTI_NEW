var talib = require("../build/Release/talib");

var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var updown_nzd;
var signal;
var in_position='';
var previous_rsi_1m_level='';
var current_position='';
var mailOptions='';
var RedisEvent=require('redis-event');
var nodemailer=require('../node_modules/nodemailer');
var take_profit=0;
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
collection.find({forex:{reqid:7,name:'NZD'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;


    in_position='';
    console.log('nzd is currently not in position &  in_position is:' + in_position + ' '+ new Date());


        //recovery code after node restart or failure
        fs.exists('NZD-BUY.lock',function(exists){
            if(exists){
                current_position="BUY";
                signal='BUY';
                console.log('set current_position=' + current_position + '; set signal=' + signal);
            }
          });

        fs.exists('NZD-SELL.lock',function(exists){
            if(exists){
                current_position="SELL";
                signal='SELL';
                console.log('set current_position=' + current_position + '; set signal=' + signal);
            }
          });




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
    console.log('NZD');


    current_rsi_1m_level=result.result.outReal[result.result.outReal.length-1];
    previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-2];
    double_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-3];    
    triple_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-4];
    quad_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-5];
    fifth_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-6];

    console.log('start_position_close is: ' + start_position_close);
    console.log('current CAD close is: ' + marketData[0].close[marketData[0].close.length-1]);

    if(marketData[0].close[marketData[0].close.length-1] - start_position_close > 0.00050 && take_profit_signal=='BUY' ){
         console.log('exiting!! i got my win in LONG!!- NZD');
         process.exit(100);
    }
    if(start_position_close - marketData[0].close[marketData[0].close.length-1] > 0.00050 && take_profit_signal=='SELL'){
         console.log('exiting!! i got my win in SHORT!! - NZD');
         process.exit(100);
    }

/*

   fs.exists('/IB_TI/node-talib-0.4.0/examples/NZD.first',function(exists){
        if(!exists){
             signal='';
             console.log('NZD.first not exists. setting signal to null');
        }
    });

    client.get("updown_nzd",function(err,reply){
         console.log(reply);
         if(reply>0){
            console.log("UPPPPPPPPPPPPPPPPP!!!");
         }
        if(reply<0){
            console.log("DOWNNNNNNNNNNNNNNNN!!!");
        }
        updown_nzd=reply;
        });

    //setTimeout(function() {console.log("updown_nzd outside is:" + updown_nzd);},100);

updown_nzd=-1;
console.log('updown_nzd is: ' + updown_nzd);
*/

      if (updown_nzd>0 || signal=='SELL'){
//      if  ( current_rsi_1m_level-triple_previous_rsi_1m_level>20 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>20 || current_rsi_1m_level-fifth_previous_rsi_1m_level >20 || (previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>20) || ( double_previous_rsi_1m_level<35 && current_rsi_1m_level-double_previous_rsi_1m_level>20 ) || ( triple_previous_rsi_1m_level<35 && current_rsi_1m_level-triple_previous_rsi_1m_level>20) || (quad_previous_rsi_1m_level<35 && current_rsi_1m_level-quad_previous_rsi_1m_level>20) )  {

     if  ( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15  ||  current_rsi_1m_level-previous_rsi_1m_level>20 ||  current_rsi_1m_level-double_previous_rsi_1m_level>15 )   {


 
      if(current_position=="BUY"){
             console.log("we are already in a NZD-BUY position. don't send message to process new orders!");
      } else {

          signal='BUY';
          if( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15){ 
               mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'NZD-BUY',
                 text:     'reason:current_rsi_1m_level-double_previous_rsi_1m_level>15'
              };
          } else {
         
              mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'NZD-BUY',
                 text:     'reason:previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>10).....'
              };
          }

          in_position='Y';

          console.log('nzd in BUY & in_position is:' + in_position + ' '+ new Date());


          console.log('we should go for long');
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
          fs.appendFileSync('./signals.txt','nzd in BUY & in_position is:' + in_position + ' '+ new Date()  + '\n');

          fs.writeFileSync('NZD-BUY.lock');
          fs.exists('NZD-SELL.lock',function(exists){
             if(exists){
                fs.unlinkSync('NZD-SELL.lock');
                console.log('we are in a long. created NZD-BUY.lock for recovery & deleted NZD-SELL.lock');
             }
          });


        
        current_position="BUY";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'NZD',
              "reqid":7,
              "signal":"BUY"
           });
        });
        } 
      }
    }
        if (updown_nzd<0 || signal=='BUY'){
//        if ((triple_previous_rsi_1m_level-current_rsi_1m_level>20 || quad_previous_rsi_1m_level-current_rsi_1m_level>20 || fifth_previous_rsi_1m_level-current_rsi_1m_level>20 || (previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>20) ||( double_previous_rsi_1m_level>65 && double_previous_rsi_1m_level-current_rsi_1m_level>20 ) || (triple_previous_rsi_1m_level>65 && triple_previous_rsi_1m_level-current_rsi_1m_level>20 ) || (quad_previous_rsi_1m_level>65 && quad_previous_rsi_1m_level-current_rsi_1m_level>20)) && (updown_nzd <0 )){

       if ( triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15 ||  previous_rsi_1m_level- current_rsi_1m_level>15 || double_previous_rsi_1m_level-current_rsi_1m_level>15 ){


        
        if(current_position=="SELL"){
             console.log("we are already in a NZD-SELL position. don't send message to process new orders!");
        } else if( in_position=='Y'){
             console.log('exiting! process will restart by cron.we are in the middle of a BUY position. SELL algo is also match, but we would like to avoid duplicates');
             fs.appendFileSync('./signals.txt','exiting! process will restart by cron.we are in the middle of a EUR-BUY position.SELL algo is also match, but we would like to avoid duplicates'  + '\n');
            process.exit(50);

        } else {
          signal='SELL';
          if(triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15 ){
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'NZD-SELL',
              text:     'reason:double_previous_rsi_1m_level-current_rsi_1m_level>15'
           };
         } else {
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'NZD-SELL',
              text:     'reason:previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>10'
            };
         }

          console.log('nzd in SELL & in_position is:' + in_position + ' '+ new Date());

          console.log('we should go for short');
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
          fs.appendFileSync('./signals.txt','nzd in SELL & in_position is:' + in_position + ' '+ new Date()  + '\n');


          fs.writeFileSync('NZD-SELL.lock');
          fs.exists('NZD-BUY.lock',function(exists){
             if(exists){
                fs.unlinkSync('NZD-BUY.lock');
                console.log('we are in a long. created NZD-SELL.lock for recovery & deleted NZD-BUY.lock');
             }
          });

      
        current_position="SELL";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'NZD',
              "reqid":7,
              "signal":"SELL"
           });
        });
       }
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
