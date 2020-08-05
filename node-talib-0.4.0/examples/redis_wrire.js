var redis = require('redis');
var client = redis.createClient(); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

client.lpush('forex_buy_and_sell','{"name":"CAD","signal":"BUY"}',function(err,reply){
   console.log(reply);
});
