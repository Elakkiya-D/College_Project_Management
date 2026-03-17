const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const requireAuth = (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

    if (!token) {
        return next(new ApiError(401, 'Missing Authorization header'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = payload;
        return next();
    } catch (error) {
        return next(new ApiError(401, 'Invalid or expired token'));
    }
};

const requireRole = (...roles) => (req, _res, next) => {
    if (!req.auth?.role) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    if (!roles.includes(req.auth.role)) {
        return next(new ApiError(403, 'Forbidden'));
    }

    return next();
};

module.exports = { requireAuth, requireRole };
