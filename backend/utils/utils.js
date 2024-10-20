import { Close, Quote, TbdexHttpClient } from "@tbdex/http-client";
import websocket from "../config/websocket.js";
import { redisDB } from "../config/db.js";
import mail from "../config/mail.js";
import User from "../models/user.js";

export function getSecondsRemaining(targetDateStr) {
    const now = new Date().getTime();

    const targetDate = new Date(targetDateStr).getTime();

    const timeDifference = targetDate - now;

    const seconds = Math.floor(timeDifference / 1000);

    return seconds > 0 ? seconds : 0;
}


export async function pollRFQ(user, rfq, pfiName, options, maxAttempts) {
    let attempts = 0;
    let close = null;
    let quote = null;


    while (!quote && attempts < maxAttempts) {
        try {
            const exchange = await TbdexHttpClient.getExchange(options);

            quote = exchange.find((msg) => msg instanceof Quote);

            for (const message of exchange) {
                if (message instanceof Close) {
                    close = message;
                    break;
                }
            }

            if (!quote) {
                close = exchange.find((msg) => msg instanceof Close);

                if (close) {
                    break;
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
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
        if (!websocket.connected) mail.sendQuoteStatus(user, 'Your Quote is now Available', 'opened');
        else websocket.emitRfqResponseStatus('Your Quote is now Available', 'open');

        await redisDB.hset(user._id.toString(), quote.metadata.exchangeId, JSON.stringify({ ...rfq, ...quote, pfiName }));
        return { quote }
    } else if (close) {
        if (!websocket.connected) mail.sendQuoteStatus(user, 'Your Quote has been closed', 'closed');
        else websocket.emitRfqResponseStatus('Your Quote has been closed', 'closed');
        return { close }
    } else {
        return null;
    }
}