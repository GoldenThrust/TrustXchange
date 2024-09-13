import cookieParser from "cookie-parser";

export default function socketcookieParser(socket, next) {
    cookieParser(process.env.COOKIE_SECRET)(socket.request, {}, (err) => {
        if (err) {
            console.error("Error parsing cookie:", err);
            return next(err);
        }

        next();
    });
}