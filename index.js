const config = require('config');
const nodeMailer = require('nodemailer');
const kue = require('kue');
const console = require('tracer').colorConsole();
const entries = require('object.entries');
const path = require('path');
const fs = require('fs');

const transports = {};

const Processor = require('./processor').Processor;
const FileManager = require('./processor').FileManager;
const Transporter = require('./processor').Transporter;


for (let [accountName, accountConfig] of entries(config.smtpAccounts)) {
    transports[accountName] = nodeMailer.createTransport(accountConfig.connectionSettings, accountConfig.mailDefaults);
}

let transporter = new Transporter(transports);
let filemanager = new FileManager(config);

let processor = new Processor(filemanager, transporter);

function connect() {
    console.log('start app');
    let queue = kue.createQueue({redis: config.redis});
    queue.process(config.queueName, (job, done) => {
        processor.processMessage(job.data, done)
    });
}

connect();