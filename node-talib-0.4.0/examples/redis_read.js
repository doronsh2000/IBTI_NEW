var redis = require('redis');
var client = redis.createClient(); //creates a new client
var result='';

client.on('connect', function() {
    console.log('connected');
});

client.lpop('forex_buy_and_sell',function(err,reply){
//   console.log(reply);
     result=reply;
//     console.log(result);
});

console.log('result is:' + result);
