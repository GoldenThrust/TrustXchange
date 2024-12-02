import { Router } from "express";
import pfiReviewController from "../controllers/pfiReviewController.js";
import { reviewValidator, validate } from "../middleware/validators.js";
import { verifyToken } from "../middleware/tokenManager.js";
import { checkUserMiddleware } from "../middleware/checkUser.js";

const reviewsRoute = Router()

reviewsRoute.get('/', pfiReviewController.getReview);
reviewsRoute.post('/', verifyToken, checkUserMiddleware, validate(reviewValidator), pfiReviewController.reviewPFI);
reviewsRoute.get("/get-pfistats", pfiReviewController.getAllPFIStats);


export default reviewsRoute;