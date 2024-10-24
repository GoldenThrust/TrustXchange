import { Router } from "express";
import { loginValidator, resetPasswordValidator, signupValidator, validate } from "../middleware/validators.js";
import authContoller from "../controllers/authenticationController.js";
import { verifyToken } from "../middleware/tokenManager.js";
import { upload } from "../utils/constants.js";
import { checkUserMiddleware } from "../middleware/checkUser.js";
const authRoutes = Router();

authRoutes.post('/register', upload.single('image'), validate(signupValidator), authContoller.register)
authRoutes.post('/login', validate(loginValidator), authContoller.login)
authRoutes.get('/logout', verifyToken, authContoller.logout)
authRoutes.get('/verify', verifyToken, checkUserMiddleware, authContoller.verify)
authRoutes.get('/activate/:token', authContoller.activateAccount)
authRoutes.post('/resend-activate', authContoller.resendActivationEmail)
authRoutes.post('/forgot-password', authContoller.forgotPassword)
authRoutes.post('/reset-password/:token', validate(resetPasswordValidator), authContoller.resetPassword)
authRoutes.post('/update-profile', upload.single('image'), verifyToken, checkUserMiddleware, authContoller.updateProfilePics)

export default authRoutes;