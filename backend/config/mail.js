import { createTransport, Transporter } from "nodemailer";
import { redisDB } from "./db.js"
import { hostUrl } from "../utils/constants.js";

class MailService {
  constructor() {
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

  sendActivationEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const verificationLink = `${hostUrl}/auth/activate?token=${token}`;

    const mailTemplate =
      `<body>
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 20 hours.</p>
    </body>`

    redisDB.set(token, user.email, 20 * 60 * 60)

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
      html: mailTemplate
    };

    return this.transporter.sendMail(mailOptions, (err, result) => {
      if (err) {
        console.error("Error sending email:", err);
        return Promise.reject(err);
      }
      console.log("Email sent:", result);
      return Promise.resolve();
    });
  }


  sendResetPasswordEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const resetPasswordLink = `${hostUrl}/reset-password?token=${token}`;

    redisDB.set(token, user.email, 1 * 60 * 60)
    const mailTemplate =
      `<body>
    <h1>Reset Password</h1>
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
    return this.transporter.sendMail(mailOptions, (err, result) => {
      if (err) {
        console.error("Error sending email:", err);
        return Promise.reject(err);
      }
      console.log("Email sent:", result);
      return Promise.resolve();
    });
  }
}

const mail = new MailService();
export default mail;
