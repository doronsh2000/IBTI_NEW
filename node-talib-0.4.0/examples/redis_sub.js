var RedisEvent=require('redis-event');

var event=new RedisEvent('localhost',['forex_buy_and_sell']);
event.on('ready',function(){
   event.pub('forex_buy_and_sell:app',{
       
           "name":"CAD",
	   "signal":"BUY"
       
   });
});
