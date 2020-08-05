var nodemailer=require('../node_modules/nodemailer');
var send_string="77.51269713419781";

var smtpConfig = {
    host: 'localhost',
    port: 25,
};

var mailOptions={
   from:    '"Nodejs APP" <nodejs@it-tv.co.il',
   to:      'doronsh2000@yahoo.com',
   subject: 'Nodejs test',
   text:    send_string
};

var transport=nodemailer.createTransport(smtpConfig);

transport.sendMail(mailOptions,function(error,info){
   if(error){
      return console.log(error);
   }
  console.log('Message send:' + info.response);
});
