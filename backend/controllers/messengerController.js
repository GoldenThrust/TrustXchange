import { TbdexHttpClient, Rfq, Quote, Order, OrderStatus, Close, Message, resolveDid } from '@tbdex/http-client';
import { PresentationExchange } from '@web5/credentials';
import { hostUrl, pfiDids } from "../utils/constants.js";
import User from '../models/user.js';
import modelOrder from '../models/order.js';
class MessageController {
    constructor() {
        this.getOfferings = this.getOfferings.bind(this);
        this.filterOfferings = this.filterOfferings.bind(this);
    }
    async fetchAllOfferings() {
        const promises = Object.entries(pfiDids).map(async ([key, pfiDid]) => {
            const offerings = await TbdexHttpClient.getOfferings({ pfiDid });
            return { key, offerings };
        });

        return Promise.all(promises);
    }

    async getOfferings(req, res) {
        try {
            const response = await this.fetchAllOfferings();
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch offerings' });
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

            offeringsData.forEach(({ key, offerings }) => {
                const filteredOfferings = offerings.filter(offering =>
                    offering.data.payin.currencyCode === payinCurrencyCode &&
                    offering.data.payout.currencyCode === payoutCurrencyCode
                );

                if (filteredOfferings.length > 0) {
                    if (!response[key]) {
                        response[key] = [];
                    }

                    filteredOfferings.forEach(offering => {
                        try {
                            PresentationExchange.satisfiesPresentationDefinition({
                                vcJwts: vc,
                                presentationDefinition: offering.data.requiredClaims,
                            });

                            response[key].push({
                                key,
                                offering,
                                verificationFailed: false
                            });
                        } catch (e) {
                            response[key].push({
                                key,
                                offering,
                                verificationFailed: true,
                            });
                        }
                    });
                }
            });

            return res.json(response);
        } catch (error) {
            console.error('Failed to filter offerings:', error);
            return res.status(500).json({ error: 'Failed to filter offerings' });
        }
    }
    async requestForQuote(req, res) {
        try {
            const { offering, amount, payinpaymentDetails, payoutPaymentDetails, payinkind, payoutKind } = req.body;

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

            // Create an RFQ (Request for Quote)
            const rfq = Rfq.create({
                metadata: {
                    to: offering.metadata.from,
                    from: did.uri,
                    protocol: '1.0',
                },
                data: {
                    offeringId: offering.metadata.id,
                    payin: {
                        kind: payinkind,
                        amount: amount,
                        paymentDetails: {
                            ...payinpaymentDetails
                        },
                    },
                    payout: {
                        kind: payoutKind,
                        paymentDetails: {
                            ...payoutPaymentDetails
                        },
                    },
                    claims: selectedCredentials
                },
            });

            await rfq.verifyOfferingRequirements(offering);
            await rfq.sign(did.uri);

            await TbdexHttpClient.createExchange(rfq);

            const exchangeId = rfq.exchangeId;
            let quote = null;
            let close = null;
            let attempts = 0;
            const maxAttempts = 30;
            const delay = 2000;

            while (!quote && attempts < maxAttempts) {
                try {
                    const exchange = await TbdexHttpClient.getExchange({
                        pfiDid: offering.metadata.from,
                        did: did.uri,
                        exchangeId: exchangeId,
                    });

                    quote = exchange.find((msg) => msg instanceof Quote);

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
                res.status(201).json(quote);
            } else if (close) {
                res.status(200).json(close);
            } else {
                res.status(408).json({ status: "ERROR", message: "Timeout waiting for quote" }); // Timeout after max attempts
            }

        } catch (err) {
            console.error('Failed to create RFQ:', err);
            return res.status(500).json({ error: 'Failed to create RFQ' });
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

        const close = Close.create({
            metadata: {
                from: did.uri,
                to: pfiDid,
                exchangeId: exchangeId,
                protocol: '1.0'
            },
            data: { reason: 'Canceled by customer' }
        });

        await close.sign(did);
        await TbdexHttpClient.submitClose(close);

        await modelOrder.create({ user, order: close })
    
        res.status(200).json(close);
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

        const order = Order.create({
            metadata: {
                from: did.uri,
                to: pfiDid,
                exchangeId: exchangeId,
                protocol: "1.0"
            }
        });

        await order.sign(customerDid);
        await TbdexHttpClient.submitOrder(order);

        let close;

        while (!close) {
            const exchange = await TbdexHttpClient.getExchange({
                pfiDid: pfiDid,
                did: customerDid,
                exchangeId: order.exchangeId
            });

            for (const message of exchange) {
                if (message instanceof OrderStatus) {
                    // consider using socket.io
                    orderStatusUpdate = message.data.orderStatus;
                }
                else if (message instanceof Close) {
                    close = message;
                    break;
                }
            }
        }

        await new modelOrder.create({ user, order: close });
        res.status(200).json(close)
    }
}

const messageController = new MessageController();
export default messageController;