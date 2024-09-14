import { Router } from "express";
import messageController from "../controllers/messengerController.js";
import { offeringFilterValidator, quoteValidator, requestForQuoteValidator, validate } from "../middleware/validators.js";
import { verifyToken } from "../middleware/tokenManager.js";

const messengerRoute = Router();

messengerRoute.get("/currency-code", verifyToken, messageController.getCurrencyCode);
messengerRoute.get("/offerings", verifyToken, messageController.getOfferings);
messengerRoute.post("/offerings", verifyToken, messageController.getOfferings);
messengerRoute.post("/filter-offerings", validate(offeringFilterValidator), verifyToken, messageController.filterOfferings);
messengerRoute.post("/request-quote", validate(requestForQuoteValidator), verifyToken, messageController.requestForQuote);
messengerRoute.post("/close-quote", validate(quoteValidator), verifyToken, messageController.closeQuote);
messengerRoute.post("/accept-quote", validate(quoteValidator), verifyToken, messageController.acceptQuote);
messengerRoute.get("/active-quotes", verifyToken, messageController.getActiveQuotes);
messengerRoute.get("/transactions", verifyToken, messageController.getTransactions);
messengerRoute.get("/getpfistats", messageController.getAllPFIStats);

export default messengerRoute;