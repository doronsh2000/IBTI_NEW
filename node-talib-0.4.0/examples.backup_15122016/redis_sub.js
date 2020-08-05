var RedisEvent=require('redis-event');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
   event.on('ready',function(){
   event.pub('forex_buy_and_sell:app',{
              "name":'CAD',
              "reqid":3,
              "signal":"BUY",
   });
});


setTimeout(function(){console.log('sleeping!')},5000);

//var event=new RedisEvent('localhost',['forex_buy_and_sell']);
   event.on('ready',function(){
   event.pub('forex_buy_and_sell:app',{
              "name":'CAD',
              "reqid":3,
              "signal":"SELL",
              "take_profit":"true"
   });
});
