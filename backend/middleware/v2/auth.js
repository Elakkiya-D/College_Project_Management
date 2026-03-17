const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const User = require("../../models/v2/User");

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return next(new ApiError(401, "Missing Authorization header"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (e) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

function requireRole(...roles) {
  return async (req, _res, next) => {
    try {
      if (!req.auth?.sub) return next(new ApiError(401, "Unauthorized"));
      const user = await User.findById(req.auth.sub);
      if (!user || !user.isActive) return next(new ApiError(401, "Unauthorized"));
      if (!roles.includes(user.role)) return next(new ApiError(403, "Forbidden"));
      req.user = user;
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

module.exports = { requireAuth, requireRole };

