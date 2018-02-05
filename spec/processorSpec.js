
const Processor = require('./../processor').Processor;

describe('handler file', () => {
    it('1', (done) => {

        let filemanager = {

        }

        let transporter = {
            getTransport: () => {return }
        }

        let processor = new Processor(filemanager, transporter);
        let data = {
            email: {
                to: '12@qw.ru'
            },
            account: '12'
        };

        processor.processMessage(data, (err) => {

        });

    });

});