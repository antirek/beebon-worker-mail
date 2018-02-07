const console = require('tracer').colorConsole();
const entries = require('object.entries');
const path = require('path');
const fs = require('fs');

class FileManager {

    constructor (config) {
        this.config = config;
    }

    getFilePath(file) {
        return path.join(this.config.filestore, file.id.toString());
    }
}

class Transporter {
    constructor (transports) {
        this.transports = transports;
    }

    getTransport(account) {
        return this.transports[account];
    }
}

class Processor {

    constructor (filemanager, transporter) {
        this.filemanager = filemanager;
        this.transporter = transporter;
        this.self = this;
    }

    getTransport (messageData) {
        return new Promise((resolve, reject) => {
            if (!messageData && !messageData.account) {
                reject("no account in message");
            }
            let transport = this.transporter.getTransport(messageData.account);

            if (!transport) {
                reject("no transport for account: " + messageData.account);
            }
            resolve(transport);
        });
    }

    appendFiles (messageData) {
        return new Promise((resolve, reject) => {
            if (messageData.email.files) {
                let attachments = messageData.email.files
                    .filter((file) => {
                        let filepath = this.filemanager.getFilePath(file);
                        return file.name && file.id && fs.readFileSync(filepath).length;
                    })
                    .map((file) => {
                        return {
                            filename: file.name,
                            path: this.filemanager.getFilePath(file)
                        }
                    });
                messageData.email.attachments = attachments;
            } else {
                console.log('no files attached')
            }
            resolve(messageData);
        });
    }

    checkRecipients (messageData) {
        return new Promise((resolve, reject) => {
            let to = messageData.email.to;
            function isBlankString(str) {
                return (!str || /^\s*$/.test(str));
            }

            function isEmptyArray(arr) {
                return arr === undefined || arr.length == 0;
            }

            if (isBlankString(to) || isEmptyArray(to)) {
                reject('empty email to');
            }
            resolve(messageData);
        });
    }

    send (messageData) {
        return this.getTransport(messageData)
            .then((transport) => {
                return new Promise((resolve, reject) => {
                    transport.sendMail(messageData.email, (err, info) => {
                        if (err) {
                            console.log('send email error:', err);
                            reject(err);
                        }

                        console.log('transport send email, result:', info);
                        resolve();
                    });
                })
            });
    }

    processMessage(messageData, done) {
        console.log('start process message:', messageData);        
        this.checkRecipients(messageData)
            .then(message => {
                return this.appendFiles(message);
            })
            .then(message => {
                return this.send(message);
            })
            .then(() => {
                console.log('end process');
                done()
            })
            .catch((err) => {
                console.log('err:', err);
                console.log('end process');
                done(err);
            });
    }
}

module.exports = {
    FileManager, Processor, Transporter
}