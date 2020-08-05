var talib = require("../build/Release/talib");
var fs = require("fs");
var redis=require('redis');
var client=redis.createClient();
var in_position='';
var previous_rsi_1m_level='';
var current_position='';
var mailOptions='';
var RedisEvent=require('redis-event');
var nodemailer=require('../node_modules/nodemailer');

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
collection.find({forex:{reqid:3,name:'CAD'}},{forex:1,close:1,open:1,low:1,high:1}).toArray(function(err,result){
var marketData=result;


    in_position='';
    console.log('cad is currently not in position &  in_position is:' + in_position + ' '+ new Date());


        //recovery code after node restart or failure
        fs.exists('CAD-BUY.lock',function(exists){
            if(exists){
                console.log('set current_position=BUY');
                current_position="BUY";
            }
          });

        fs.exists('CAD-SELL.lock',function(exists){
            if(exists){
                console.log('set current_position=SELL');
                current_position="SELL";
            }
          });



//console.log('marketdata from mongo are:',result);


// execute SMA indicator function with time period 9
talib.execute({
    name: "SMA",
    startIdx: 0,
    endIdx: marketData[0].close.length - 1,
    inReal: marketData[0].close,
    optInTimePeriod: 9
}, function (result) {


    // Show the result array
    console.log("SMA Function Results:");
    console.log(result);
    console.log(result.result.outReal[result.result.outReal.length-1]);
    console.log('CAD');


    current_rsi_1m_level=result.result.outReal[result.result.outReal.length-1];
    previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-2];
    double_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-3];    
    triple_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-4];
    quad_previous_rsi_1m_level=result.result.outReal[result.result.outReal.length-5];

      if (  ( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15) || (previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>15) || ( double_previous_rsi_1m_level<35 && current_rsi_1m_level-double_previous_rsi_1m_level>15 ) || ( triple_previous_rsi_1m_level<35 && current_rsi_1m_level-triple_previous_rsi_1m_level>15) || (quad_previous_rsi_1m_level<35 && current_rsi_1m_level-quad_previous_rsi_1m_level>15) ) {
          
      if(current_position=="BUY"){
             console.log("we are already in a CAD-BUY position. don't send message to process new orders!");
      } else {

          if( current_rsi_1m_level-triple_previous_rsi_1m_level>15 ||  current_rsi_1m_level-quad_previous_rsi_1m_level>15){ 
               mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'CAD-BUY',
                 text:     'reason:current_rsi_1m_level-double_previous_rsi_1m_level>15'
              };
          } else {
         
              mailOptions={
                 from:    '"Nodejs APP" <root@localhost>',
                 to:      'doronsh2000@yahoo.com',
                 subject: 'CAD-BUY',
                 text:     'reason:previous_rsi_1m_level <35 && current_rsi_1m_level-previous_rsi_1m_level>10).....'
              };
          }

          in_position='Y';

          console.log('cad in BUY & in_position is:' + in_position + ' '+ new Date());


          console.log('we should go for long');
/*
          transport.sendMail(mailOptions,function(error,info){
          if(error){
              return console.log(error);
          }
          console.log('Message send:' + info.response);
          });
*/
          // write to file to see why emails duplicates
          fs.appendFileSync('./signals.txt','cad in BUY & in_position is:' + in_position + ' '+ new Date()  + '\n');

          fs.writeFileSync('CAD-BUY.lock');
          fs.exists('CAD-SELL.lock',function(exists){
             if(exists){
                fs.unlinkSync('CAD-SELL.lock');
                console.log('we are in a long. created CAD-BUY.lock for recovery & deleted CAD-SELL.lock');
             }
          });


        
        current_position="BUY";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{

              "name":'CAD',
              "reqid":3,
              "signal":"BUY"
           });
        });
        } 
      }
        if(( triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15)|| (previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>15) ||( double_previous_rsi_1m_level>65 && double_previous_rsi_1m_level-current_rsi_1m_level>15 ) || (triple_previous_rsi_1m_level>65 && triple_previous_rsi_1m_level-current_rsi_1m_level>15 ) || (quad_previous_rsi_1m_level>65 && quad_previous_rsi_1m_level-current_rsi_1m_level>15)){

        if(current_position=="SELL"){
             console.log("we are already in a CAD-SELL position. don't send message to process new orders!");
        } else if( in_position=='Y'){
             console.log('exiting! process will restart by cron.we are in the middle of a BUY position. SELL algo is also match, but we would like to avoid duplicates');
             fs.appendFileSync('./signals.txt','exiting! process will restart by cron.we are in the middle of a EUR-BUY position.SELL algo is also match, but we would like to avoid duplicates'  + '\n');
            process.exit(50);

        } else {
          if(triple_previous_rsi_1m_level-current_rsi_1m_level>15 || quad_previous_rsi_1m_level-current_rsi_1m_level>15 ){
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'CAD-SELL',
              text:     'reason:double_previous_rsi_1m_level-current_rsi_1m_level>15'
           };
         } else {
            mailOptions={
              from:    '"Nodejs APP" <root@localhost>',
              to:      'doronsh2000@yahoo.com',
              subject: 'CAD-SELL',
              text:     'reason:previous_rsi_1m_level > 65 && previous_rsi_1m_level- current_rsi_1m_level>10'
            };
         }

          console.log('cad in SELL & in_position is:' + in_position + ' '+ new Date());

          console.log('we should go for short');
       /*
          transport.sendMail(mailOptions,function(error,info){
          if(error){
              return console.log(error);
          }
          console.log('Message send:' + info.response);
          });
       */
           // write to file to see why emails duplicates
          fs.appendFileSync('./signals.txt','cad in SELL & in_position is:' + in_position + ' '+ new Date()  + '\n');


          fs.writeFileSync('CAD-SELL.lock');
          fs.exists('CAD-BUY.lock',function(exists){
             if(exists){
                fs.unlinkSync('CAD-BUY.lock');
                console.log('we are in a long. created CAD-SELL.lock for recovery & deleted CAD-BUY.lock');
             }
          });

      
        current_position="SELL";
        var event=new RedisEvent('localhost',['forex_buy_and_sell']);
        event.on('ready',function(){
           event.pub('forex_buy_and_sell:app',{
              "name":'CAD',
              "reqid":3,
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
