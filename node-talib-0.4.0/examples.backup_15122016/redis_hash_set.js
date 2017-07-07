var redis=require('redis');
var client=redis.createClient();

 client.hmset("GBP","amount",100000,"close","1.5555",redis.print);
 client.hset("GBP","signal","SELL",redis.print);
 
 client.hincrby("GBP","amount",-50000);
 client.quit();
