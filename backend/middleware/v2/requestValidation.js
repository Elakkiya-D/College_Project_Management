const ApiError = require("../../utils/ApiError");

function requireFields(fields = []) {
  return (req, _res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
    });

    if (missing.length) {
      return next(new ApiError(400, `Missing required field(s): ${missing.join(", ")}`));
    }

    return next();
  };
}

function validateEmailField(fieldName = "email") {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (req, _res, next) => {
    const value = req.body[fieldName];
    if (value === undefined || value === null || value === "") return next();

    if (typeof value !== "string" || !emailRegex.test(value.trim().toLowerCase())) {
      return next(new ApiError(400, `Invalid ${fieldName}`));
    }

    return next();
  };
}

function validateNumberField(fieldName, options = {}) {
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = options;

  return (req, _res, next) => {
    const value = req.body[fieldName];
    if (value === undefined || value === null || value === "") return next();

    const num = Number(value);
    if (!Number.isFinite(num)) return next(new ApiError(400, `${fieldName} must be a number`));
    if (num < min || num > max) return next(new ApiError(400, `${fieldName} must be between ${min} and ${max}`));

    return next();
  };
}

function validateArrayField(fieldName, options = {}) {
  const { required = false } = options;

  return (req, _res, next) => {
    const value = req.body[fieldName];

    if (value === undefined || value === null) {
      if (required) return next(new ApiError(400, `${fieldName} is required`));
      return next();
    }

    if (!Array.isArray(value)) return next(new ApiError(400, `${fieldName} must be an array`));

    return next();
  };
}

module.exports = {
  requireFields,
  validateEmailField,
  validateNumberField,
  validateArrayField,
};
