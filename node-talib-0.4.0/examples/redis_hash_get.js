var redis=require('redis');
var client=redis.createClient();

client.hkeys("GBP",function(err,replies){

    console.log(replies.length + " replies: ");
    replies.forEach(function(reply,i){
        console.log("    " + i + ": " + reply);
    });
});

client.hgetall('GBP',function(error,object){
  console.log(" " + object.amount + " " + object.signal + object.close);
});

client.quit();
