const jwt = require('jsonwebtoken');

const getJwtExpiry = () => process.env.JWT_EXPIRES_IN || '7d';

const signAuthToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: getJwtExpiry(),
    });
};

module.exports = { signAuthToken };
