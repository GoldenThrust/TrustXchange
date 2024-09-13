import { TbdexHttpClient, Rfq, Quote, Order, OrderStatus, Close, Offering } from '@tbdex/http-client';
import { PresentationExchange } from '@web5/credentials';
import { pfiDids } from "../utils/constants.js";
import { DidDht } from "@web5/dids";
import User from '../models/user.js';
import Transactions from '../models/transactions.js';
import { mongoDB, redisDB } from "../config/db.js";
import { getSecondsRemaining } from '../utils/utils.js';


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
            const user = await User.findById(res.locals.jwtData.id);

            if (!user) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "User not registered OR Token malfunctioned",
                });
            }

            if (!user.active) {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Account is not active",
                });
            }

            const response = {};
            const { vc } = user;
            const offeringsData = await this.fetchAllOfferings();

            Object.entries(offeringsData).forEach(([key, offerings]) => {
                offerings.forEach((offering) => {
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
                });
            });

            return res.json(response);
        } catch (error) {
            console.error("Failed to filter offerings:", error);
            return res.status(500).json({
                status: "ERROR",
                message: "Failed to filter offerings",
            });
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
            const user = await User.findById(res.locals.jwtData.id);

            if (!user) {
                return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
            }

            if (!user.active) {
                return res.status(403).json({ status: "ERROR", message: "Account is not active" });
            }

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

            const user = await User.findById(res.locals.jwtData.id);
            if (!user) {
                return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
            }
            if (!user.active) {
                return res.status(403).json({ status: "ERROR", message: "Account is not active" });
            }

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
                        amount: amount,
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
            let attempts = 0;
            const maxAttempts = 30;
            const delay = 2000;
            let pfiName = '';

            Object.entries(pfiDids).map(async ([key, pfiDid]) => {
                if (pfiDid === offering.metadata.from)
                    pfiName = key;
            });

            while (!quote && attempts < maxAttempts) {
                try {
                    const exchange = await TbdexHttpClient.getExchange({
                        pfiDid: offering.metadata.from,
                        did: resolveDid,
                        exchangeId,
                    });

                    quote = exchange.find((msg) => msg instanceof Quote);

                    for (const message of exchange) {
                        if (message instanceof OrderStatus) {
                            console.log(message.data.orderStatus);
                        }
                        else if (message instanceof Close) {
                            close = message;
                            break;
                        }
                    }

                    if (!quote) {
                        close = exchange.find((msg) => msg instanceof Close);

                        if (close) {
                            break;
                        } else {
                            await new Promise((resolve) => setTimeout(resolve, delay));
                        }
                    }
                } catch (e) {
                    if (e.statusCode === 404 || e.statusCode === 401) {
                    } else {
                        throw e;
                    }
                }

                attempts++;
            }


            if (quote) {
                await redisDB.hset(user._id.toString(), quote.metadata.exchangeId, JSON.stringify({ ...rfq, ...quote, pfiName }));
                res.status(201).json({ ...quote, status: 'OPEN' });
            } else if (close) {
                res.status(200).json({ ...close, status: 'CLOSED' });
            } else {
                res.status(408).json({ status: "ERROR", message: "Timeout waiting for quote" });
            }
        } catch (err) {
            console.error('Failed to create RFQ:', err);
            return res.status(400).json({ error: 'Failed to create RFQ' });
        }
    }

    async closeQuote(req, res) {
        const { pfiDid, exchangeId } = req.body;

        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
        }
        if (!user.active) {
            return res.status(403).json({ status: "ERROR", message: "Account is not active" });
        }

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
            await TbdexHttpClient.submitClose(close);

            let quote = await redisDB.hget(user._id.toString(), exchangeId);
            quote = JSON.parse(quote);

            if (!quote) {
                return res.status(404).json({ status: "ERROR", message: "Quote not found" });
            }

            await Transactions.create({ user, quote, transaction: close, status: 'CLOSED', exchangeId, pfiName: quote.pfiName });
            redisDB.hdel(user._id.toString(), exchangeId)
            res.status(200).json({ ...close, status: "OK" })
        } catch (err) {
            console.error('Failed to close quote:', err);
            return res.status(400).json({ error: 'Failed to close quote' });
        }
    }

    async acceptQuote(req, res) {
        const { pfiDid, exchangeId } = req.body;

        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
        }
        if (!user.active) {
            return res.status(403).json({ status: "ERROR", message: "Account is not active" });
        }

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
                    }
                    else if (message instanceof Close) {
                        close = message;
                        break;
                    }
                }
            }

            const cacheOrder = await redisDB.get(`order_${user._id.toString()}`);

            if (!cacheOrder) {
                await redisDB.set(`order_${user._id.toString()}`, JSON.stringify([exchangeId]), 10 * 24 * 60 * 60);
            } else {
                const parseOrder = JSON.parse(cacheOrder);
                parseOrder.push(exchangeId);
                await redisDB.set(`order_${user._id.toString()}`, JSON.stringify(parseOrder), 10 * 24 * 60 * 60);
            }


            let quote = await redisDB.hget(user._id.toString(), exchangeId);
            quote = JSON.parse(quote);

            if (!quote) {
                return res.status(404).json({ status: "ERROR", message: "Quote not found" });
            }

            await Transactions.create({ user, quote, transaction: close || {}, status, exchangeId, pfiName: quote.pfiName });
            redisDB.hdel(user._id.toString(), exchangeId)

            res.status(200).json({ ...close, status })
        } catch (err) {
            console.error('Failed to accept quote:', err);
            return res.status(400).json({ error: 'Failed to accept quote' });
        }
    }

    async getActiveQuotes(req, res) {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
        }
        if (!user.active) {
            return res.status(403).json({ status: "ERROR", message: "Account is not active" });
        }

        const quotes = await redisDB.hgetall(user._id.toString());

        Object.entries(quotes).forEach(([key, value]) => {
            try {
                quotes[key] = JSON.parse(value);

                if (!getSecondsRemaining(quotes[key].data.expiresAt)) {
                    redisDB.hdel(user._id.toString(), key);
                }
            } catch (error) {
                console.error(`Error parsing value for key ${key}: ${error.message}`);
                redisDB.hdel(user._id.toString(), key);
            }
        })

        res.json(quotes);
    }

    async getTransactions(req, res) {
        const { page, limit } = req.query;

        if (!page || !limit) {
            return res.status(400).json({ status: "ERROR", message: "Page and limit are required" });
        }
        const skip = (page - 1) * limit;

        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
        }
        if (!user.active) {
            return res.status(403).json({ status: "ERROR", message: "Account is not active" });
        }

        const transactions = await Transactions.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));

        const totalTransactions = await Transactions.countDocuments({ user: user._id });

        return res.status(200).json({
            transactions,
            totalPages: Math.ceil(totalTransactions / limit),
            currentPage: Number(page)
        });
    }
}

const messageController = new MessageController();
export default messageController;