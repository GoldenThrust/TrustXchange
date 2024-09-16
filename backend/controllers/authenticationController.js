import User from "../models/user.js";
import { hash, verify } from "argon2";
import { createToken } from "../middleware/tokenManager.js";
import { COOKIE_NAME, countryCode } from "../utils/constants.js";
import { DidDht } from "@web5/dids";
import { getVCTokens } from "../utils/token.js";
import mail from "../config/mail.js";
import { redisDB } from "../config/db.js";

class AuthenticationController {
    async verify(req, res) {
        try {
            const user = await User.findById(res.locals.jwtData.id);
            if (!user) {
                return res.status(401).send({ "message": "User not registered OR Token malfunctioned" });
            }

            if (user._id.toString() !== res.locals.jwtData.id) {
                return res.status(403).send("Permissions didn't match");
            }

            const { name, email, address, image, city, state, country, zip, did } = user;

            return res
                .status(200)
                .json({ status: "OK", message: { name, email, address, image, city, state, country, zip, did: did.uri } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "ERROR", message: error.message });
        }
    }

    async register(req, res) {
        try {
            const { name, email, password, phonenumber, address, city, state, zip, countrycode } = req.body;
            const country = countryCode[countrycode]
            let image = '';
            if (req.file) {
                image = req.file.path;
            }

            const existingUser = await User.findOne({
                $or: [{ email }, { phonenumber }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(403).json({ status: "ERROR", message: "Email is already registered" });
                }
                if (existingUser.phonenumber === phonenumber) {
                    return res.status(403).json({ status: "ERROR", message: "Phone number is already registered" });
                }
            }

            const hashedPassword = await hash(password);

            const did = await DidDht.create({
                options: {
                    publish: true,
                },
            })
            const storeDid = await did.export();

            const vc = await getVCTokens(name, countrycode, storeDid.uri);


            const user = new User({ name, email, password: hashedPassword, phonenumber, image, address, city, state, zip, country, did: storeDid, vc: [vc] });
            await user.save();

            // send email to activate user account
            try {
                await mail.sendActivationEmail(user)
            } catch (error) {
                return res.status(500).json({ status: "ERROR", message: "Failed to send activation link" });
            }

            return res
                .status(201)
                .json({ status: "OK", message: "We've sent an activation link to your email. Please check your inbox to activate your account." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "ERROR", message: error.message });
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
                return res.status(403).json({ status: "ERROR", message: "Account is not active" })
            }

            const isPasswordCorrect = await verify(user.password, password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ status: "ERROR", message: "Password is incorrect" })
            }

            res.clearCookie(COOKIE_NAME, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                domain: req.loc,
                signed: true,
                path: "/",
            });

            const token = createToken(user._id.toString(), user.email, user.did, "7d");
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);

            res.cookie(COOKIE_NAME, token, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                path: "/",
                domain: req.loc,
                expires,
                signed: true,
            });

            const { name, address, image, city, state, country, zip, did } = user;

            return res
                .status(200)
                .json({ status: "OK", message: { name, email, address, image, city, state, country, zip, did: did.uri } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "ERROR", message: error.message });
        }
    }


    async logout(req, res) {
        try {
            const user = await User.findById(res.locals.jwtData.id);
            if (!user) {
                return res.status(401).send({ "message": "User not registered OR Token malfunctioned" });
            }

            if (user._id.toString() !== res.locals.jwtData.id) {
                return res.status(403).send("Permissions didn't match");
            }

            res.clearCookie(COOKIE_NAME, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                domain: req.loc,
                signed: true,
                path: "/",
            });


            return res
                .status(200)
                .json({ status: "OK" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "ERROR", message: error.message });
        }
    }

    async resendActivationEmail(req, res) {
        const email = req.body.email;

        const user = await User.findOne({ email });

        if (user.active) {
            return res.json({ status: "ERROR", message: "Account is already activate" });
        }

        try {
            await mail.sendActivationEmail(user)
        } catch (error) {
            res.json({ status: "ERROR", message: "Failed to send activation link" });
        }


        res.json({ status: "OK", message: "We've sent an activation link to your email. Please check your inbox to activate your account." });
    }


    async activateAccount(req, res) {
        const authtoken = req.params.token;

        const mail = await redisDB.get(authtoken);

        if (!mail) {
            return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
        }

        const user = await User.findOneAndUpdate(
            { email: mail },
            { $set: { active: true } },
            { new: true }
        );

        if (!user) {
            return res.status(500).json({ status: "ERROR", message: "User not found" });
        }


        res.clearCookie(COOKIE_NAME, {
            secure: true,
            sameSite: "none",
            httpOnly: true,
            domain: req.loc,
            signed: true,
            path: "/",
        });

        const token = createToken(user._id.toString(), user.email, user.did, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
            secure: true,
            sameSite: "none",
            httpOnly: true,
            path: "/",
            domain: req.loc,
            expires,
            signed: true,
        });

        await redisDB.del(token);
        const { name, email, address, image, city, state, country, zip, did, vc } = user;

        return res
            .status(200)
            .json({ message: "OK", user: { name, email, address, image, city, state, country, zip, did: did.uri } });
    }


    async forgotPassword(req, res) {
        const email = req.body.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered" });
        }

        try {
            await mail.sendResetPasswordEmail(user);
        } catch (error) {
            res.status(500).json({ status: "ERROR", message: "Failed to send password link" });
        }

        res.json({ status: "OK", message: "We've sent a password reset link to your email. Please check your inbox to reset your password." });
    }


    async resetPassword(req, res) {
        const { password } = req.body;
        const token = req.params.token;
        const email = await redisDB.get(token);
        console.log(token, email);
        if (!email) {
            return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
        }

        const hashedPassword = await hash(password);
        await User.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        await redisDB.del(token);
        res.status(201).json({ status: "OK", message: "Password reset successfully" })
    }
}

const authContoller = new AuthenticationController();

export default authContoller;