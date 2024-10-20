import Queue from 'bull';
import { Dev } from './utils/constants.js';
import { pollRFQ } from './utils/utils.js';
import mail from './config/mail.js';
import { DidDht } from '@web5/dids';
import User from './models/user.js';


export const RFQQueue = Dev ? new Queue('RFQQueue') : new Queue('RFQQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

RFQQueue.process(async (job) => {
    const { options, rfq, pfiName, did, user } = job.data;

    const resolveDid = await DidDht.import({ portableDid: did })
    options.did = resolveDid;

    const quote = pollRFQ(user, rfq, pfiName, options, 30);

    if (!quote) {
        mail.sendQuoteStatus(user, 'Quote Has been Terminated', 'closed');
        return 'error';
    } else {
        return quote;
    }
})