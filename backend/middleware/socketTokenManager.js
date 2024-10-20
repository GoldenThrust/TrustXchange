import { COOKIE_NAME } from "../utils/constants.js";
import jwt from "jsonwebtoken";

export default function socketAuthenticateToken(socket, next) {
  const token = socket.request.signedCookies[COOKIE_NAME]
  if (!token || token.trim() === "") {
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtData = jwt.verify(token, jwtSecret);
    socket.user = jwtData;
    return next();
  } catch (error) {
    next();
    return console.error(error);
  }
}