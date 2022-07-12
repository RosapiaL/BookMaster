var amqp = require('amqplib/callback_api');
var request = require("request");
const urlParse = require("url-parse");

const usernamedb = process.env.DBUSER;
const passworddb = process.env.DBPASS;

const usernamerabbit = process.env.RABBITUSER;
const passwordrabbit = process.env.RABBITPASS;


function inviaMessaggio(email){
amqp.connect('amqp://'+usernamerabbit+':'+passwordrabbit+'@rabbit', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
    if (error1) {
    throw error1;
    }
    var queue = 'mail';
    var msg = email;

    channel.assertQueue(queue, {
    durable: true
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
    }, 500);
    });
}



function inviaBenvenuto(email){

    var richiestaEmail ={
        url : 'https://www.googleapis.com/oauth2/v2/userinfo',
        headers:{
            Authorization : "Bearer " + email,
        }
    }
    request.get(richiestaEmail,function callback(error,response,body){
        var email = JSON.parse(body).email;
        controllaPresenza(email);
    })
}

function controllaPresenza(email){
    var options = {
        url: 'http://'+usernamedb+":"+passworddb+"@couch:5984/bookmaster/"+email
    }
    request.get(options, function callback(error,response,body){
        var info = JSON.parse(body);
        //console.log(info);
        if(info.error=='not_found'){
            console.log('mando la mail');
            inviaMessaggio(email)
            aggiungiElemento(email);
        }
        
    })
}

function aggiungiElemento(email){
    var options ={
        url:'http://'+usernamedb+":"+passworddb+"@couch:5984/bookmaster/"+email,
        json: true,
        body:{
            "email": email
        }
    }
    request.put(options,function callback(error,response,body){
        console.log("sto inserendo l' email nel db");
        console.log(body);
    })
}

module.exports = {inviaBenvenuto};
