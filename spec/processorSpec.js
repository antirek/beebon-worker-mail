
const Processor = require('./../processor').Processor;

describe('Processor', () => {

    describe('send good', () => {
    
        it('simple mail', (done) => {
            let filemanager = {}

            let transport = {
                sendMail: (message, cb) => {
                    cb(null, 'OK');
                }
            }

            let transporter = {
                getTransport: () => {return transport; }
            }

            let processor = new Processor({}, transporter);
            
            let data = {
                email: {
                    to: '12@qw.ru'
                },
                account: '12'
            };

            processor.processMessage(data, (err) => {
                if (!err) {
                    done();
                }
            });
        });

        it('with files', (done) => {
            let filemanager = {
                getFilePath: () => {
                    return '1'
                }
            }

            let transport = {
                sendMail: (message, cb) => {
                    cb(null, 'OK');
                }
            }

            let transporterWithGoodTransport = {
                getTransport: () => {return Promise.resolve(transport); }
            }

            let processor = new Processor(filemanager, transporterWithGoodTransport);
            
            let data = {
                email: {
                    to: '12@qw.ru',
                    files: ['1']
                },
                account: '12'
            };

            processor.processMessage(data, (err) => {
                if (!err) {
                    done();
                }
            });
        });
    });

    describe('not send, because', () => {

        it('no to', (done) => {
            let processor = new Processor({}, {});
            
            let data = {
                email: {
                    files: ['1']
                },
                account: '12'
            };

            processor.processMessage(data, (err) => {
                if (err) {
                    done();
                }
            });
        });

        it('not set transport for account', (done) => {

            let transporter = {
                getTransport: () => {return null; }
            }

            let processor = new Processor({}, transporter);
            
            let data = {
                email: {
                    to: '1222@nm.ru'
                },
                account: '13'
            };

            processor.processMessage(data, (err) => {
                if (err) {
                    done();
                }
            });
        });

    });

});