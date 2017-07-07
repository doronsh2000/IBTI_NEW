var talib = require("../build/Release/talib");
var fs = require("fs");

// Display module version
console.log();
console.log("TALib Version: " + talib.version);

// Load market data
var marketContents = fs.readFileSync('marketdata.json','utf8'); 
var marketData = JSON.parse(marketContents);

// execute STOCH indicator function with time period 9
talib.execute({
    name: "STOCH",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    high: marketData.high,
    low: marketData.low,
    close: marketData.close,
    optInFastK_Period: 1,
    optInSlowK_Period: 3,
    optInSlowK_MAType: "EMA",
    optInSlowD_Period: 14,
    optInSlowD_MAType: "EMA"
}, function (result) {

    // Show the result array
    console.log("STOCH Function Results:");
    console.log(result);

});
