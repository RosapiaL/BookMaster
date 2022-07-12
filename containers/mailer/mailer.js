const amqp = require('amqplib/callback_api');
const nodemailer = require("nodemailer");

const usermail = process.env.MAILUSER;
const passmail = process.env.MAILPASS;

const usernamerabbit = process.env.RABBITUSER;
const passwordrabbit = process.env.RABBITPASS;


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: usermail,
        pass: passmail
    }
});
 

function inviaEmail(destinatario){
    let message = {
        from: 'BookMaster <sender@example.com>',
        to: '<'+destinatario+'>',
        subject: 'Benvenuto su BookMaster',
        text: 'Hello to myself!',
        html: '<h1>Benvenuto su BookMaster</h1><br><p1>BookMaster è la tua libreria digitale</p1>'
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
        }
    
        console.log('Message sent: %s', info.messageId);
    });
}



amqp.connect('amqp://'+usernamerabbit+':'+passwordrabbit+'@rabbit', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'mail';

        channel.assertQueue(queue, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            try{
                inviaEmail(msg.content.toString());
            }catch(e){
                console.log(e);
            }
            console.log(" [x] Received %s", msg.content.toString());

        }, {
            noAck: true
        });
    });
});