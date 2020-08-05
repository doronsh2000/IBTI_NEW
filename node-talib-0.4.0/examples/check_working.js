// load the module and display its version
var talib = require('../build/Release/talib');
console.log("TALib Version: " + talib.version);

// Display all available indicator function names
var functions = talib.functions;
for (i in functions) {
    console.log(functions[i].name);
}

var function_desc = talib.explain("RSI");
console.dir(function_desc);


var function_desc = talib.explain("ADX");
console.dir(function_desc);

