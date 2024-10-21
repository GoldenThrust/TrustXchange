import { TbdexHttpClient, Rfq, Order, OrderStatus, Close } from '@tbdex/http-client';
import { PresentationExchange } from '@web5/credentials';
import { pfiDids } from "../utils/constants.js";
import { DidDht } from "@web5/dids";
import Transactions from '../models/transactions.js';
import { redisDB } from "../config/db.js";
import { getSecondsRemaining, pollRFQ } from '../utils/utils.js';
import websocket from '../config/websocket.js';
import mail from '../config/mail.js';
import { RFQQueue } from '../worker.js';


class MessageController {
    constructor() {
        this.getOfferings = this.getOfferings.bind(this);
        this.getCurrencyCode = this.getCurrencyCode.bind(this);
        this.filterOfferings = this.filterOfferings.bind(this);
    }

    async fetchAllOfferings() {
        let response = {};
        const offering = JSON.parse(await redisDB.get('offerings'));


        if (!offering) {
            const promises = Object.entries(pfiDids).map(async ([key, pfiDid]) => {
                const offerings = await TbdexHttpClient.getOfferings({ pfiDid });
                response[key] = offerings;
            });

            await Promise.all(promises);

            redisDB.set('offerings', JSON.stringify(response), 24 * 60 * 60);
        } else {
            response = offering;
        }

        return response;
    }
    async getOfferings(req, res) {
        try {
            const user = req.user;
            const { payinCurrencyCode, payoutCurrencyCode, minUnit, maxUnit, pfi } = req.body;

            const response = {};
            const { vc } = user;
            const offeringsData = await this.fetchAllOfferings();

            let minPaymentUnit = 0;
            let maxPaymentUnit = -Infinity;
            const payIn = new Set();
            const payOut = new Set();

            Object.entries(offeringsData).forEach(([key, offerings]) => {
                if (pfi && pfi !== key) return;
                offerings.forEach((offering) => {
                    const payoutUnitsPerPayinUnit = offering.data.payoutUnitsPerPayinUnit;

                    payIn.add(offering.data.payin.currencyCode);
                    maxPaymentUnit = Math.max(maxPaymentUnit, payoutUnitsPerPayinUnit);

                    if (payinCurrencyCode && offering.data.payin.currencyCode !== payinCurrencyCode) return;
                    payOut.add(offering.data.payout.currencyCode);

                    if (payoutCurrencyCode && offering.data.payout.currencyCode !== payoutCurrencyCode) return;
                    if (minUnit && payoutUnitsPerPayinUnit < minUnit) return;
                    minPaymentUnit = Math.min(minPaymentUnit, payoutUnitsPerPayinUnit);

                    if (maxUnit && payoutUnitsPerPayinUnit > maxUnit) return;

                    try {
                        PresentationExchange.satisfiesPresentationDefinition({
                            vcJwts: vc,
                            presentationDefinition: offering.data.requiredClaims,
                        });

                        if (!response[key]) response[key] = [];
                        response[key].push({ ...offering, verificationFailed: false });
                    } catch (e) {
                        console.error(`Verification failed for offering ${offering.id}:`, e);
                        if (!response[key]) response[key] = [];
                        response[key].push({ ...offering, verificationFailed: true });
                    }
                });
            });

            res.json({
                status: "SUCCESS", offerings: response, paymentUnit: {
                    minPaymentUnit, maxPaymentUnit
                }, paymentsCurrency: {
                    payIn: Array.from(payIn), payOut: Array.from(payOut)
                }
            });
        } catch (error) {
            console.error('Error fetching offerings:', error);
            res.status(500).json({ status: "ERROR", message: "Internal server error" });
        }
    }

    async getCurrencyCode(req, res) {
        try {
            const payIn = new Set();
            const payOut = new Set();

            const offeringsData = await this.fetchAllOfferings();


            Object.entries(offeringsData).map(([key, offerings]) => {
                offerings.forEach(offering => {
                    payIn.add(offering.data.payin.currencyCode)
                    payOut.add(offering.data.payout.currencyCode)
                });
            })

            const response = {
                payIn: [...payIn],
                payOut: [...payOut]
            }

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch currency code' });
        }
    }

    async filterOfferings(req, res) {
        try {
            const user = req.user;
            const { payinCurrencyCode, payoutCurrencyCode } = req.body;

            const response = {};
            const { vc } = user;
            const offeringsData = await this.fetchAllOfferings();


            Object.entries(offeringsData).map(([key, offerings]) => {
                offerings.forEach(offering => {
                    if (offering.data.payin.currencyCode === payinCurrencyCode && offering.data.payout.currencyCode === payoutCurrencyCode) {
                        try {
                            PresentationExchange.satisfiesPresentationDefinition({
                                vcJwts: vc,
                                presentationDefinition: offering.data.requiredClaims,
                            });

                            if (!response[key]) response[key] = [];
                            response[key].push({ ...offering, verificationFailed: false });
                        } catch (e) {
                            if (!response[key]) response[key] = [];
                            response[key].push({ ...offering, verificationFailed: true });
                        }
                    }
                });
            });

            return res.json(response);
        } catch (error) {
            console.error('Failed to filter offerings:', error);
            return res.status(500).json({ error: 'Failed to filter offerings' });
        }
    }

    async requestForQuote(req, res) {
        try {
            const { amount, payinKind, payoutKind } = req.body;
            const offering = JSON.parse(req.body.offering);
            const payinPaymentDetails = JSON.parse(req.body.payinPaymentDetails);
            const payoutPaymentDetails = JSON.parse(req.body.payoutPaymentDetails);

            const user = req.user;
            const { did, vc } = user;

            const selectedCredentials = PresentationExchange.selectCredentials({
                vcJwts: vc,
                presentationDefinition: offering.data.requiredClaims,
            });

            const resolveDid = await DidDht.import({ portableDid: did })

            const rfq = Rfq.create({
                metadata: {
                    to: offering.metadata.from,
                    from: did.uri,
                    protocol: '1.0',
                },
                data: {
                    offeringId: offering.metadata.id,
                    payin: {
                        kind: payinKind,
                        amount: String(Number(amount) - (Number(amount) * 0.03)),
                        paymentDetails: payinPaymentDetails,
                    },
                    payout: {
                        kind: payoutKind,
                        paymentDetails: payoutPaymentDetails,
                    },
                    claims: selectedCredentials
                },
            });

            await rfq.verifyOfferingRequirements(offering);
            await rfq.sign(resolveDid);


            await TbdexHttpClient.createExchange(rfq);

            const exchangeId = rfq.exchangeId;
            let quote = null;
            let close = null;
            let pfiName = '';

            Object.entries(pfiDids).map(async ([key, pfiDid]) => {
                if (pfiDid === offering.metadata.from)
                    pfiName = key;
            });

            const options = {
                pfiDid: offering.metadata.from,
                did: resolveDid,
                exchangeId,
            }

            const response = await pollRFQ(user, rfq, pfiName, options, 30);

            if (response.quote) {
                quote = response.quote;
                res.status(201).json({ ...quote, status: 'OPEN', message: 'Quote received successfully' });
            } else if (response.close) {
                close = response.close;
                res.status(400).json({ ...close, status: 'CLOSED', message: "Quote Has been Closed" });
            } else {
                res.status(408).json({ status: "ERROR", message: "Timeout waiting for quote" });
                RFQQueue.add({ options, rfq, pfiName, did, user_id: user });
            }
        } catch (err) {
            console.error('Failed to create RFQ:', err);
            return res.status(500).json({ error: 'Failed to create RFQ' });
        }
    }

    async closeQuote(req, res) {
        const { pfiDid, exchangeId } = req.body;

        const user = req.user;

        const { did } = user;
        try {
            const resolveDid = await DidDht.import({ portableDid: did })

            const close = Close.create({
                metadata: {
                    from: did.uri,
                    to: pfiDid,
                    exchangeId,
                    protocol: '1.0'
                },
                data: { reason: 'Canceled by customer' }
            });

            await close.sign(resolveDid);
            const response = await TbdexHttpClient.submitClose(close);

            let quote = await redisDB.hget(user._id.toString(), exchangeId);
            quote = JSON.parse(quote);

            if (!quote) {
                return res.status(404).json({ status: "ERROR", message: "Quote not found" });
            }

            quote.privateData = {};

            await Transactions.create({ user, quote, transaction: close, status: 'CLOSED', exchangeId, pfiName: quote.pfiName });
            redisDB.hdel(user._id.toString(), exchangeId)
            res.status(200).json({ ...close, status: "OK" })
        } catch (err) {
            redisDB.hdel(user._id.toString(), exchangeId)
            console.error('Failed to close quote:', err);
            return res.status(400).json({ error: 'Failed to close quote' });
        }

        websocket.emitCloseQuote();
    }

    async acceptQuote(req, res) {
        const data = req.body;

        const { pfiDid, exchangeId } = data;
        data.status = 'IN_PROGRESS';

        const user = req.user;
        const key = `processing_quote_${user._id.toString()}`;

        await redisDB.hset(key, exchangeId, JSON.stringify(data))

        const { did } = user;
        try {
            const resolveDid = await DidDht.import({ portableDid: did })

            const order = Order.create({
                metadata: {
                    from: did.uri,
                    to: pfiDid,
                    exchangeId: exchangeId,
                    protocol: "1.0"
                }
            });

            await order.sign(resolveDid);
            await TbdexHttpClient.submitOrder(order);

            let close;
            let status;
            while (!close) {
                const exchange = await TbdexHttpClient.getExchange({
                    pfiDid: pfiDid,
                    did: resolveDid,
                    exchangeId: order.exchangeId

                });

                for (const message of exchange) {
                    if (message instanceof OrderStatus) {
                        status = message.data.orderStatus;
                        websocket.emitQuoteStatus(status, exchangeId);
                    }
                    else if (message instanceof Close) {
                        close = message;
                        break;
                    }
                }
            }

            mail.sendTransactionSuccess(user, data)

            let quote = await redisDB.hget(user._id.toString(), exchangeId);
            quote = JSON.parse(quote);

            if (!quote) {
                return res.status(404).json({ status: "ERROR", message: "Quote not found" });
            }

            quote.privateData = {};


            await Transactions.create({ user, quote, transaction: close || {}, status, exchangeId, pfiName: quote.pfiName });

            await redisDB.hdel(key, exchangeId);
            await redisDB.hdel(user._id.toString(), exchangeId)
            res.status(200).json({ ...close, status })
        } catch (err) {
            await redisDB.hdel(user._id.toString(), exchangeId)
            await redisDB.hdel(key, exchangeId);
            console.error('Failed to accept quote:', err);
            return res.status(400).json({ error: 'Failed to accept quote' });
        }
    }

    async getAllProcessingQuotes(req, res) {
        const user = req.user;

        const quotes = await redisDB.hgetall(`processing_quote_${user._id.toString()}`);

        Object.entries(quotes).forEach(([key, value]) => {
            try {
                quotes[key] = JSON.parse(value);

                if (!getSecondsRemaining(quotes[key].expiresAt)) {
                    redisDB.hdel(user._id.toString(), key);
                }
            } catch (error) {
                console.error(`Error parsing value for key ${key}: ${"Internal Server Error"}`);
                redisDB.hdel(user._id.toString(), key);
            }
        })

        if (!quotes) {
            return res.status(200).json([]);
        }

        return res.json(quotes);

    }

    async getActiveQuotes(req, res) {
        const user = req.user;

        const quotes = await redisDB.hgetall(user._id.toString());

        Object.entries(quotes).forEach(([key, value]) => {
            try {
                quotes[key] = JSON.parse(value);

                if (!getSecondsRemaining(quotes[key].data.expiresAt)) {
                    redisDB.hdel(user._id.toString(), key);
                }
            } catch (error) {
                console.error(`Error parsing value for key ${key}: ${"Internal Server Error"}`);
                redisDB.hdel(user._id.toString(), key);
            }
        })

        res.json(quotes);
    }

    async getTransactions(req, res) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const user = req.user;

        const transactions = await Transactions.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const totalTransactions = await Transactions.countDocuments({ user: user._id });

        return res.status(200).json({
            transactions,
            totalTransactions,
            currentPage: page
        });
    }
    async getAllPFIStats(req, res) {
        try {
            const pfiStats = await Transactions.aggregate([
                {
                    $group: {
                        _id: "$pfiName",
                        totalTransactions: { $sum: 1 },
                        canceledTransactions: {
                            $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalTransactions: 1,
                        canceledTransactions: 1,
                        successRate: {
                            $cond: [
                                { $gt: ["$totalTransactions", 0] },
                                { $multiply: [{ $divide: [{ $subtract: ["$totalTransactions", "$canceledTransactions"] }, "$totalTransactions"] }, 100] },
                                0
                            ]
                        },
                        cancellationRate: {
                            $cond: [
                                { $gt: ["$totalTransactions", 0] },
                                { $multiply: [{ $divide: ["$canceledTransactions", "$totalTransactions"] }, 100] },
                                0
                            ]
                        }
                    }
                }
            ]);

            return res.status(200).json(pfiStats.map(pfi => ({
                pfiName: pfi._id,
                totalTransactions: pfi.totalTransactions,
                canceledTransactions: pfi.canceledTransactions,
                successRate: pfi.successRate.toFixed(2),
                cancellationRate: pfi.cancellationRate.toFixed(2)
            })))
        } catch (error) {
            console.error('Error fetching PFI stats:', error);
            res.status(500).json(error);
        }
    }

}

const messageController = new MessageController();
export default messageController;