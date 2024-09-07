import { body, validationResult } from "express-validator";

// Middleware for handling validation results
export function validate(validations) {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        break;
      }
    }
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    return res.status(422).json({ status: "ERROR", message: errors.array()[0]['msg'] });
  };
};
import { check } from 'express-validator';

export const requestForQuoteValidator = [
    check('offering')
        .isString().withMessage('Offering must be a string')
        .notEmpty().withMessage('Offering is required'),

    check('amount')
        .isNumeric().withMessage('Amount must be a number')
        .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),

    check('payinpaymentDetails')
        .isString().withMessage('Pay-in Payment Details must be a string')
        .notEmpty().withMessage('Pay-in Payment Details is required'),

    check('payoutPaymentDetails')
        .isString().withMessage('Payout Payment Details must be a string')
        .notEmpty().withMessage('Payout Payment Details is required'),

    check('payinkind')
        .isString().withMessage('Pay-in Kind must be a string')
        .notEmpty().withMessage('Pay-in Kind is required'),

    check('payoutKind')
        .isString().withMessage('Payout Kind must be a string')
        .notEmpty().withMessage('Payout Kind is required'),
];


export const quoteValidator = [
    check('pfiDid')
        .isString().withMessage('pfiDid must be a string')
        .notEmpty().withMessage('pfiDid is required'),

    check('exchangeId')
        .notEmpty().withMessage('exchangeId is required')
        .isString().withMessage('exchangeId must be a string or a valid identifier'),
];


export const resetPasswordValidator = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password should contain at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
]


export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  ...resetPasswordValidator,
];

export const signupValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[a-zA-Z]+( [a-zA-Z]+){1,2}$/)
    .withMessage("Name should consist of a first name, an optional middle name, and a last name, separated by a single space each."),

  body("phonenumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("state")
    .trim()
    .optional()
    .isAlpha()
    .withMessage("State should contain only letters"),

  body("zip")
    .trim()
    .optional()
    .isPostalCode('any')
    .withMessage("Please provide a valid postal code"),

  body("countrycode")
    .trim()
    .notEmpty()
    .withMessage("Country code is required"),

  body().custom((value, { req }) => {
    if (!req.file) {
      throw new Error('Please provide a profile picture');
    }
    return true;
  }),

  ...loginValidator,
];


export const offeringFilterValidator = [
  body('payinCurrencyCode')
  .trim()
  .notEmpty()
  .withMessage("Please provide a payin currency code")
  .isLength({ min: 3, max: 3 })
  .withMessage("Payin currency code should be 3 characters long"),
  body('payoutCurrencyCode')
  .trim()
  .notEmpty()
  .withMessage("Please provide a payout currency code")
  .isLength({ min: 3, max: 3 })
  .withMessage("Payout currency code should be 3 characters long"),
]