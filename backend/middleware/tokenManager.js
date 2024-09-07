import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../utils/constants.js";

export function createToken(id, email, expiresIn) {
  const payload = { id, email };
  const jwtSecret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn,
  });

  return token;
}

export async function verifyToken(req, res, next) {
  const token = req.signedCookies[COOKIE_NAME];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtData = jwt.verify(token, jwtSecret);
    res.locals.jwtData = jwtData;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token Expired or Invalid" });
  }
}
