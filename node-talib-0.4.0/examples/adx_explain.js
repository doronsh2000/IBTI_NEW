var talib = require("../build/Release/talib"),
    util = require('util');
var functions = talib.functions;

// Display module version
console.log();
console.log("TALib Version: " + talib.version);

// Display ADX indicator function specifications
console.log(util.inspect(talib.explain("CDLEVENINGSTAR"), { depth:3 }));
