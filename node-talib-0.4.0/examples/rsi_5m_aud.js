 //var talib = require("../build/Release/talib");
 var talib = require("../../node_modules/talib/build/Release/talib");

var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var updown_aud;
var signal;
var in_position='';
var previous_rsi_1m_level='';
var current_position='';
var mailOptions='';
var RedisEvent=require('redis-event');
var nodemailer=require('../node_modules/nodemailer');
var take_profit_signal='';
var start_position_close;
var start_rsi;
var last_green_bar_open;
var last_red_bar_open;

/*
process.argv.forEach(function(val,index,array){
   if(index==2)
      if(val=='down'){
          console.log("it's down");
         updown_aud =-3;
      }
      if(val=='up'){
          console.log("it's up");
          updown_aud=3;
      }
});

*/

var smtpConfig = {
    host: 'localhost',
    port: 20
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
collection.find({forex:{reqid:5,name:'AUD'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;


    in_position='';
    console.log('aud is currently not in position &  in_position is:' + in_position + ' '+ new Date());
/*

        //recovery code after node restart or failure
        fs.exists('AUD-BUY.lock',function(exists){
            if(exists){
                current_position="BUY";
                signal='BUY';
                console.log('set current_position=' + current_position + '; set signal=' + signal);
            }
          });

        fs.exists('AUD-SELL.lock',function(exists){
            if(exists){
                current_position="SELL";
                signal='SELL';
                console.log('set current_position=' + current_position + '; set signal=' + signal);
            }
          });

*/

// if(   (last_green_bar_open > marketData[0].close[marketData[0].close.length-1]) && take_profit_signal=='BUY'  ){

/*
 if(   (last_green_bar_open > marketData[0].close[marketData[0].close.length-1]) && take_profit_signal=='BUY'  ){

         console.log('exiting LONG!!- AUD');
          fs.appendFileSync('./signals.txt','exiting LONG!!- AUD' + new Date() + ' \n');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
          event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'AUD',
              "reqid":5,
              "signal":"SELL",
              "take_profit":"true",
              "close":  marketData[0].high[marketData[0].high.length-1]
            });
           });

         take_profit_signal='';
         current_position='';
        // setTimeout(function(){process.exit(100)},100);

    }

 //if( (  last_red_bar_open < marketData[0].close[marketData[0].close.length-1]) && take_profit_signal=='SELL' ){

  if( (  last_red_bar_open < marketData[0].close[marketData[0].close.length-1]) && take_profit_signal=='SELL' ){
          
          console.log('exiting SHORT!! - AUD');
          fs.appendFileSync('./signals.txt','exiting SHORT!! - AUD' + new Date() + '\n');
var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'AUD',
              "reqid":5,
              "signal":"BUY",
              "take_profit":"true",
              "close":  marketData[0].low[marketData[0].low.length-1]
           });
        });

         take_profit_signal='';
         current_position='';
         // setTimeout(function(){process.exit(100)},100);

    }

*/

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
    console.log('AUD');
    

    current_rsi_1m_level=result.result.outReal[result.result.outReal.length-1];
    previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-2];
    double_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-3];    
    triple_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-4];
    quad_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-5];
    fifth_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-6];
    sixth_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-7];
    seventh_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-8];

    

    console.log('start_position_close is: ' + start_position_close);
    console.log('current AUD close is: ' + marketData[0].close[marketData[0].close.length-1]);
    console.log('current AUD high is: ' +  marketData[0].high[marketData[0].high.length-1]);
    console.log('current AUD low is: ' +  marketData[0].low[marketData[0].low.length-1]);

/*
   if ( marketData[0].close[marketData[0].close.length-1] -  marketData[0].open[marketData[0].open.length-1] >= 0 ){
        console.log('THIS IS A GREEEN BAR!');
        last_green_bar_open=marketData[0].open[marketData[0].open.length-1];
      if (current_position == 'BUY') {
var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'AUD',
              "reqid":5,
              "signal":"SELL",
              "close":  marketData[0].low[marketData[0].low.length-1],
              "change_stop": "yes"
           });
        });
      }     

   }

    if (  marketData[0].close[marketData[0].close.length-1] -  marketData[0].open[marketData[0].open.length-1] <0  ){
        console.log('THIS IS A RED BAR!');
        last_red_bar_open=marketData[0].open[marketData[0].open.length-1];
    if (current_position == 'SELL') {
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'AUD',
              "reqid":5,
              "signal":"BUY",
              "close":  marketData[0].high[marketData[0].high.length-1],
              "change_stop": "yes"
           });
        });
     }
   }


*/

//      if (updown_aud>0 || signal=='SELL'){
 // if  ( current_rsi_1m_level-triple_previous_rsi_1m_level>20 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>20 || current_rsi_1m_level-fifth_previous_rsi_1m_level >20 || (previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>15) || ( double_previous_rsi_1m_level<35 && current_rsi_1m_level-double_previous_rsi_1m_level>15 ) || ( triple_previous_rsi_1m_level<35 && current_rsi_1m_level-triple_previous_rsi_1m_level>15) || (quad_previous_rsi_1m_level<35 && current_rsi_1m_level-quad_previous_rsi_1m_level>15)  && take_profit_signal=='' )  {

      


//    if (  marketData[0].close[marketData[0].close.length-1] -  marketData[0].open[marketData[0].open.length-2] > 0  && ( current_rsi_1m_level <40 || current_rsi_1m_level  > 60)  && take_profit_signal=='') {


    if (  marketData[0].close[marketData[0].close.length-1] -  marketData[0].open[marketData[0].open.length-2] > 0  && (   marketData[0].close[marketData[0].close.length-1] -  marketData[0].open[marketData[0].open.length-1] > 0 &&   marketData[0].open[marketData[0].open.length-2] -  marketData[0].close[marketData[0].close.length-2] > 0) ) {

// if (   last_red_bar_open < marketData[0].close[marketData[0].close.length-1] > 0 &&  marketData[0].close[marketData[0].close.length-1]- marketData[0].open[marketData[0].open.length-1] > 0.000100 && marketData[0].close[marketData[0].close.length-1]- marketData[0].open[marketData[0].open.length-1] <0.001  ) {


       if(current_position=="BUY"){
             console.log("we are already in a AUD-BUY position. don't send message to process new orders!");
      } else {


          signal='BUY';
         /*
          if( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15){ 
               mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'AUD-BUY',
                 text:     'reason:current_rsi_1m_level-double_previous_rsi_1m_level>15'
              };
          } else {
         
              mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'AUD-BUY',
                 text:     'reason:previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>10).....'
              };
          }
*/
          in_position='Y';

          console.log('aud in BUY & in_position is:' + in_position + ' '+ new Date());


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
          fs.appendFileSync('./signals.txt','aud in BUY & in_position is:' + in_position + ' '+ new Date()  + '\n');

          fs.writeFileSync('AUD-BUY.lock');
          fs.exists('AUD-SELL.lock',function(exists){
             if(exists){
                fs.unlinkSync('AUD-SELL.lock');
                console.log('we are in a long. created AUD-BUY.lock for recovery & deleted AUD-SELL.lock');
             }
          });


        
        current_position="BUY";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'AUD',
              "reqid":5,
              "signal":"BUY",
              "close":  marketData[0].close[marketData[0].close.length-1]
           });
        });
        } 
      }
  //  }
  //      if (updown_aud<0 || signal=='BUY'){
  // if (triple_previous_rsi_1m_level-current_rsi_1m_level>20 || quad_previous_rsi_1m_level-current_rsi_1m_level>20 || fifth_previous_rsi_1m_level-current_rsi_1m_level>20 || (previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>20) ||( double_previous_rsi_1m_level>65 && double_previous_rsi_1m_level-current_rsi_1m_level>15 ) || (triple_previous_rsi_1m_level>65 && triple_previous_rsi_1m_level-current_rsi_1m_level>15 ) || (quad_previous_rsi_1m_level>65 && quad_previous_rsi_1m_level-current_rsi_1m_level>15) && ( take_profit_signal=='' )){

        

 // if ((  marketData[0].open[marketData[0].open.length-2] - marketData[0].close[marketData[0].close.length-1] > 0 )  || ( marketData[0].open[marketData[0].open.length-1] - marketData[0].close[marketData[0].close.length-1] > 0 &&  marketData[0].open[marketData[0].open.length-2] - marketData[0].close[marketData[0].close.length-2] > 0  ) && ( take_profit_signal=='' )){

// if (  marketData[0].open[marketData[0].open.length-2] - marketData[0].close[marketData[0].close.length-1] > 0 &&  ( current_rsi_1m_level>60 || current_rsi_1m_level <40)  &&  take_profit_signal=='' ){


 if (  marketData[0].close[marketData[0].close.length-1] - marketData[0].open[marketData[0].open.length-2] < 0 &&  ( marketData[0].close[marketData[0].close.length-2] - marketData[0].open[marketData[0].open.length-2] > 0 &&  marketData[0].open[marketData[0].open.length-1] - marketData[0].close[marketData[0].close.length-1] > 0) ){

// if (  last_green_bar_open > marketData[0].close[marketData[0].close.length-1] > 0 &&  marketData[0].open[marketData[0].open.length-1]- marketData[0].close[marketData[0].close.length-1] > 0.000100  &&  marketData[0].open[marketData[0].open.length-1]- marketData[0].close[marketData[0].close.length-1] < 0.001 ){



        if(current_position=="SELL"){
             console.log("we are already in a AUD-SELL position. don't send message to process new orders!");

        } else {


          signal='SELL';
          /*if(triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15 ){
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'AUD-SELL',
              text:     'reason:double_previous_rsi_1m_level-current_rsi_1m_level>15'
           };
         } else {
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'AUD-SELL',
              text:     'reason:previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>10'
            };
         }
*/
          console.log('aud in SELL & in_position is:' + in_position + ' '+ new Date());

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
          fs.appendFileSync('./signals.txt','aud in SELL & in_position is:' + in_position + ' '+ new Date()  + '\n');


          fs.writeFileSync('AUD-SELL.lock');
          fs.exists('AUD-BUY.lock',function(exists){
             if(exists){
                fs.unlinkSync('AUD-BUY.lock');
                console.log('we are in a long. created AUD-SELL.lock for recovery & deleted AUD-BUY.lock');
             }
          });

      
        current_position="SELL";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'AUD',
              "reqid":5,
              "signal":"SELL",
              "close":  marketData[0].close[marketData[0].close.length-1]
           });
        });
       }
 //   }
  }
  });
});
}


//calculate_rsi();
//var event=new RedisEvent('localhost',['forex_buy_and_sell']);
//event.on('ready',function(){
   setInterval(calculate_rsi ,300000);
//});
//db.close();

});
