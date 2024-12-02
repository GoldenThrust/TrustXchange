import { createTransport } from "nodemailer";
import { redisDB } from "./db.js"
import { Dev, hostUrl } from "../utils/constants.js";
import crypto from "crypto";

class MailService {
  constructor() {
    this.hostUrl = hostUrl;
    const configOptions = Dev ? {
      host: 'localhost',
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },

    } : {
      service: "Gmail",
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    }

    this.transporter = createTransport(configOptions);
  }
  async sendActivationEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const verificationLink = `${this.hostUrl}/activate-account?token=${token}`;

    const mailTemplate = `
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
        <h1 style="text-align: center; color: #333;">Welcome to TrustXchange!</h1>
        <h2 style="color: #555;">Verify Your Email Address</h2>
        <p style="font-size: 16px; color: #555;">
          Hello ${user.name || 'User'},<br><br>
          Thank you for signing up for TrustXchange! Please confirm your email address to complete your registration.
        </p>
        <p style="text-align: center;">
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Your Email
          </a>
        </p>
        <p style="font-size: 14px; color: #999; text-align: center;">
          This link will expire in 24 hours. If you didn’t request this, please ignore this email.
        </p>
      </div>
    </body>`;

    await redisDB.set(token, user.email, 24 * 60 * 60);

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
          return reject(err);
        }
        return resolve(result);
      });
    });
  }
  async sendResetPasswordEmail(user) {
    const token = crypto.randomBytes(16).toString("hex");
    const resetPasswordLink = `${this.hostUrl}/reset-password?token=${token}`;

    const mailTemplate = `
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h1 style="text-align: center; color: #333;">Reset Your Password</h1>
      <h2 style="color: #555;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #555;">
        Hello ${user.name || 'User'},<br><br>
        We received a request to reset your password. Click the button below to reset your password.
      </p>
      <p style="text-align: center;">
        <a href="${resetPasswordLink}" style="background-color: #ff6f61; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 14px;                                                                 color: #999; text-align: center;">
        This link will expire in 1 hour. If you didn’t request this, please ignore this email.
      </p>
    </div>
  </body>`;

    await redisDB.set(token, user.email, 1 * 60 * 60);

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
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  async sendQuoteStatus(user, message, status) {
    const mailTemplate = `
    <body style="font-family: Arial, sans-serif;">
      <h1 style="color: #0046b8;">TrustXchange</h1>
      <h2>Quote Status Update</h2>
      <p>Dear ${user.name},</p>
      <p>We would like to inform you that the status of your quote request is: 
          <a href="${this.hostUrl}/dashboard"><strong style="color: #0046b8;">${status}</strong>.</p></a>
      <p>${message}</p>
      <p>If you have any questions or need further assistance, feel free to 
         <a href="${this.hostUrl}/contact-support">contact our support team</a>.</p>
      <p>Thank you for choosing TrustXchange!</p>
      <footer>
        <p>Best regards,</p>
        <p>The TrustXchange Team</p>
      </footer>
    </body>
    `;

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `Quote Status Update: ${status}`,
      text: `Dear ${user.name},\n\nThe status of your quote request is: ${status}.\n\n${message}\n\nFor further assistance, contact our support team.\n\nBest regards,\nTrustXchange Team`,
      html: mailTemplate,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, async (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  async sendTransactionSuccess(user, quote) {
    const transactionDate = new Date().toLocaleDateString();

    const mailTemplate = `
    <body style="font-family: Arial, sans-serif;">
      <h1 style="color: #0046b8;">TrustXchange</h1>
      <h2>Transaction Successful</h2>
      <p>Dear ${user.name},</p>
      <p>We are happy to inform you that your recent transaction has been processed successfully.</p>
      <p><strong>Transaction Details:</strong></p>
      <ul>
        <li>Transaction Date: ${transactionDate}</li>
        <li>Transaction Flow: ${quote.payin.amount} ${quote.payin.currencyCode} → ${quote.payout.amount} ${quote.payout.currencyCode}</li>
        <li>Status: <strong style="color: green;">Success</strong></li>
      </ul>
      <p>If you have any questions or concerns, feel free to 
         <a href="${this.hostUrl}/contact-support">contact our support team</a>.</p>
      <p>Thank you for choosing TrustXchange for your transaction!</p>
      <footer>
        <p>Best regards,</p>
        <p>The TrustXchange Team</p>
      </footer>
    </body>
    `;

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Transaction Successful",
      text: `Dear ${user.name},\n\nYour transaction has been successfully processed.\n\nTransaction Details:\nTransaction Date: ${transactionDate}\nTransaction Flow: ${quote.payin.amount} ${quote.payin.currencyCode} -> ${quote.payout.amount} ${quote.payout.currencyCode}\nStatus: Success\n\nThank you for choosing TrustXchange!\n\nBest regards,\nThe TrustXchange Team`,
      html: mailTemplate,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, async (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }
}

const mail = new MailService();
export default mail;
