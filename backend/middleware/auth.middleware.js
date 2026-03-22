const jwt = require("jsonwebtoken");
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model'); // assuming user hasn't been migrated yet, this might error if it was

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : authHeader;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = payload;
        
        // Task 11 Fix: set req.user and map sub -> id
        req.user = {
            ...payload,
            id: payload.id || payload.sub,
            _id: payload._id || payload.sub
        };
        
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const requireRole = (...roles) => async (req, res, next) => {
    try {
        const tokenRole = req.auth?.role;
        
        // If a role exists in the token, validate it immediately
        if (tokenRole) {
            if (!roles.includes(tokenRole)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            // Optional: attach user lookup if needed by specific routes, but let's pass it
            return next();
        }

        // V2 Fallback: If no role in token, lookup the user in V2 User collection
        if (req.auth?.sub) {
            const user = await User.findById(req.auth.sub);
            if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized" });
            if (!roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
            req.user = user;
            return next();
        }

        return res.status(401).json({ message: "Unauthorized" });
    } catch (e) {
        return next(e);
    }
};

module.exports = { requireAuth, requireRole };
