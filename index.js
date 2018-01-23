const config = require('config');
const nodeMailer = require('nodemailer');
const kue = require('kue');
const console = require('tracer').colorConsole();
const entries = require('object.entries');
const path = require('path');
const fs = require('fs');

const transports = {};

for (let [accountName, accountConfig] of entries(config.smtpAccounts)) {
    transports[accountName] = nodeMailer.createTransport(accountConfig.connectionSettings, accountConfig.mailDefaults);
}

function getFilePath(file) {
    return path.join(config.filestore, file.id.toString());
}

function processMessage(messageData, done) {
    console.log('start process message:', messageData);

    let transport = transports[messageData.account];

    if (!transport) {
        console.log("No transport for account", messageData.account);
        return;
    }

    if (messageData.email.files) {
        let attachments = messageData.email.files
            .filter((file) => { 
                return file.name && file.id && fs.readFileSync(getFilePath(file)).length
            })
            .map((file) => {
                return {
                    filename: file.name,
                    path: getFilePath(file)
                }
            });

        messageData.email.attachments = attachments;
    }

    console.log('start send email:', messageData.email);

    transport.sendMail(messageData.email, (err, info) => {
        if (err) {
            console.log('send email error:', err);
            done(err);
            return
        }

        console.log('transport send email, result:', info);
        done();
    });
}

function connect() {
    console.log('start app');
    let queue = kue.createQueue({redis: config.redis});
    queue.process(config.queueName, (job, done) => {
        processMessage(job.data, done)
    });
}

connect();