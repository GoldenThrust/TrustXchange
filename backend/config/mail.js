import { createTransport } from "nodemailer";
import { redisDB } from "./db.js"
import { hostUrl } from "../utils/constants.js";
import crypto from "crypto";

class MailService {
  constructor() {
    this.hostUrl = hostUrl;
    this.transporter = createTransport({
      service: "Gmail",
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendActivationEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const verificationLink = `${this.hostUrl}/activate-account?token=${token}`;

    const mailTemplate =
      `<body>
      <h1>TrustXchange</h1>
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    </body>`

    await redisDB.set(token, user.email, 24 * 60 * 60)

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
      html: mailTemplate
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, async (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result);
      });
    })
  }


  async sendResetPasswordEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const resetPasswordLink = `${this.hostUrl}/reset-password?token=${token}`;

    await redisDB.set(token, user.email, 1 * 60 * 60)
    const mailTemplate =
      `<body>
      <h1>TrustXchange</h1>
    <h2>Reset Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetPasswordLink}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    </body>`
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Reset Password",
      text: `Please reset your password by clicking the following link: ${resetPasswordLink}`,
      html: mailTemplate
    };
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, async (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result);
      });
    })
  }
}

const mail = new MailService();
export default mail;
