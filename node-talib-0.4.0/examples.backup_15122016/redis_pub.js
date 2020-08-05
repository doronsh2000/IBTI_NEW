var RedisEvent=require('redis-event');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
event.on('ready',function(){
   event.on('forex_buy_and_sell:app',function(data){
      console.log('setup forex_buy_and_sell channel' + data.name + ' ' + data.signal + data.take_profit +  new Date());
   });

});
