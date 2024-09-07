import { Router } from "express";
import messageController from "../controllers/messengerController.js";
import { offeringFilterValidator, quoteValidator, requestForQuoteValidator, validate } from "../middleware/validators.js";
import { verifyToken } from "../middleware/tokenManager.js";

const messengerRoute = Router();

messengerRoute.get("/getofferings", verifyToken, messageController.getOfferings);
messengerRoute.post("/filterofferings", validate(offeringFilterValidator), verifyToken, messageController.filterOfferings);
messengerRoute.post("/requestforquote", validate(requestForQuoteValidator), verifyToken, messageController.requestForQuote);
messengerRoute.post("/closeorder", validate(quoteValidator), verifyToken, messageController.closeQuote);
messengerRoute.post("/acceptorder", validate(quoteValidator), verifyToken, messageController.acceptQuote);

export default messengerRoute;