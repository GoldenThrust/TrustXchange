import User from '../models/user.js';

export const checkUserMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res.status(401).json({ status: "ERROR", message: "User not registered OR Token malfunctioned" });
        }

        if (!user.active) {
            return res.status(403).json({ status: "ERROR", message: "Account is not active" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ status: "ERROR", message: "Internal server error" });
    }
};
