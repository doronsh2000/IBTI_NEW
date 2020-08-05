const fs=require('fs');
content={
           "name":"CAD",
	   "signal": "SELL"
        };
fs.appendFileSync('queue_file.txt',JSON.stringify(content) );
