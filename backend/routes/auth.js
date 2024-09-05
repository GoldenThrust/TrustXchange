import { Router } from "express";
import { loginValidator, signupValidator, validate } from "../middleware/validators";
import authContoller from "../controllers/authenticationController";
import { verifyToken } from "../middleware/tokenManager";
const authRoutes = Router();

auth.post('/register', upload.single('image'), validate(signupValidator), authContoller.register)
auth.post('/login', validate(loginValidator),authContoller.login)
auth.get('/logout', verifyToken, authContoller.logout)
auth.get('/verify', verifyToken, authContoller.verify)
auth.get('/activate', authContoller.activateAccount)
auth.post('/resend-activate', authContoller.resendActivationEmail)
auth.post('/forgot-password', authContoller.forgotPassword)
auth.post('/reset-password', authContoller.resetPassword)


export default authRoutes;