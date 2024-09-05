import User from "../models/user";
import { hash, verify } from "argon2";
import { createToken } from "../middleware/tokenManager";
import { COOKIE_NAME, countryCode } from "../utils/constants";
import { DidDht } from "@web5/dids";
import { getVCTokens } from "../utils/token";
import mail from "../config/mail";
import { redisDB } from "../config/db";

class AuthenticationController {
    async verify(req, res) {
        try {
            const user = await User.findById(res.locals.jwtData.id);

            if (!user) {
                return res.status(401).send("User not registered OR Token malfunctioned");
            }

            if (user._id.toString() !== res.locals.jwtData.id) {
                return res.status(401).send("Permissions didn't match");
            }

            return res
                .status(200)
                .json({ message: "OK", name: user.name, email: user.email });
        } catch (error) {
            console.error(error);
            return res.status(200).json({ message: "ERROR", cause: error.message });
        }
    }

    async register(req, res) {
        try {
            const { firstname, lastname, email, password, phonenumber, address, city, state, zip, countrycode } = req.body;
            const country = countryCode[countrycode]
            const name = `${firstname} ${lastname}`;
            let image = '';
            if (req.file) {
                image = req.file.path;
            }

            const existingUser = await User.findOne({
                $or: [{ email }, { phonenumber }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(401).json({ status: "ERROR", message: "Email is already registered"});
                }
                if (existingUser.phonenumber === phonenumber) {
                    return res.status(401).json({ status: "ERROR", message: "Phone number is already registered"});
                }
            }

            const hashedPassword = await hash(password);

            const did = await DidDht.create({
                options: {
                    publish: true,
                },
            })

            const vc = getVCTokens(name, countrycode, did);

            const user = new User({ name, email, password: hashedPassword, phonenumber, address, city, state, zip, country, did, vc });
            await user.save();

            // send email to activate user account
            try {
                mail.sendActivationEmail(user)
            } catch (error) {
                res.json({ status: "ERROR",  message: error.message });
            }

            return res
                .status(201)
                .json({ status: "OK", message: "We've sent an activation link to your email. Please check your inbox to activate your account." });
        } catch (error) {
            console.error(error);
            return res.status(200).json({ status: "ERROR", message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).send("User not registered");
            }

            if (!user.active) {
                return res.status(403).json({ status: "ERROR", message: "Account is not active"})
            }

            const isPasswordCorrect = await verify(user.password, password);
            if (!isPasswordCorrect) {
                return res.status(403).json({ message: "Password is incorrect"})
            }

            res.clearCookie(COOKIE_NAME, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                domain: "localhost",
                signed: true,
                path: "/",
            });

            const token = createToken(user._id.toString(), user.email, "7d");
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);

            res.cookie(COOKIE_NAME, token, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                path: "/",
                domain: "localhost",
                expires,
                signed: true,
            });

            return res
                .status(201)
                .json({ message: "OK" });
        } catch (error) {
            console.error(error);
            return res.status(200).json({ message: "ERROR", cause: error.message });
        }
    }

    
    async logout(
        req,
        res,
    ) {
        try {
            const user = await User.findById(res.locals.jwtData.id);
            if (!user) {
                return res.status(401).send({ "message": "User not registered OR Token malfunctioned"});
            }

            if (user._id.toString() !== res.locals.jwtData.id) {
                return res.status(401).send("Permissions didn't match");
            }

            res.clearCookie(COOKIE_NAME, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                domain: "localhost",
                signed: true,
                path: "/",
            });


            return res
                .status(200)
                .json({ message: "OK" });
        } catch (error) {
            console.error(error);
            return res.status(200).json({ message: "ERROR", cause: error.message });
        }
    }

    async resendActivationEmail(req, res) {
        const email = req.body.email;

        const user = await User.findOne({ email });

        try {
            mail.sendActivationEmail(user)
        } catch (error) {
            res.json({ status: "ERROR",  message: error.message });
        }


        res.json({ status: "OK", message: "We've sent an activation link to your email. Please check your inbox to activate your account." });
    }

    
    async activateAccount(req, res) {
        const token = req.query.token;

        const email = redisDB.get(token);

        if (!email) {
            return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
        }

        await User.findOneAndUpdate(
            { email },
            { $set: { active: true } },
            { new: true }
        );

        redisDB.del(token);
        res.status(201).json({ status: "OK", message: "Account activated successfully"})
    }


    async forgotPassword(req, res) {
        const email = req.body.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered"});
        }

        try {
            mail.sendResetPasswordEmail(user);
        } catch (error) {
            res.json({ status: "ERROR",  message: error.message });
        }

    
        res.json({ status: "OK", message: "We've sent a password reset link to your email. Please check your inbox to reset your password." });
    }


    async resetPassword(req, res) {
        const { newPassword } = req.body;
        const token = req.query.token;
        const email = redisDB.get(token);
        if (!email) {
            return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
        }
        const hashedPassword = await hash(newPassword);
        await User.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        redisDB.del(token);
        res.status(201).json({ status: "OK", message: "Password reset successfully"})
    }
}

const authContoller = new AuthenticationController();

export default authContoller;