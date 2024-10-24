import { Router } from "express";
import messageController from "../controllers/messengerController.js";
import { offeringFilterValidator, quoteValidator, requestForQuoteValidator, validate } from "../middleware/validators.js";
import { verifyToken } from "../middleware/tokenManager.js";
import { checkUserMiddleware } from "../middleware/checkUser.js";
const messengerRoute = Router();

// messengerRoute.post("/filter-offerings", validate(offeringFilterValidator), verifyToken, checkUserMiddleware, messageController.filterOfferings);
messengerRoute.get("/currency-code", verifyToken, checkUserMiddleware, messageController.getCurrencyCode);
messengerRoute.get("/offerings", verifyToken, checkUserMiddleware, messageController.getOfferings);
messengerRoute.post("/offerings", verifyToken, checkUserMiddleware, messageController.getOfferings);
messengerRoute.post("/request-quote", validate(requestForQuoteValidator), verifyToken, checkUserMiddleware, messageController.requestForQuote);
messengerRoute.post("/close-quote", validate(quoteValidator), verifyToken, checkUserMiddleware, messageController.closeQuote);
messengerRoute.post("/accept-quote", validate(quoteValidator), verifyToken, checkUserMiddleware, messageController.acceptQuote);
messengerRoute.get("/active-quotes", verifyToken, checkUserMiddleware, messageController.getActiveQuotes);
messengerRoute.get("/processing-quotes", verifyToken, checkUserMiddleware, messageController.getAllProcessingQuotes)
messengerRoute.get("/transactions", verifyToken, checkUserMiddleware, messageController.getTransactions);


export default messengerRoute;