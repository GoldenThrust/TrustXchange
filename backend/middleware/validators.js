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
// Login validator can be reused for both login and signup
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  ...resetPasswordValidator,
];

// Sign-up validator
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
