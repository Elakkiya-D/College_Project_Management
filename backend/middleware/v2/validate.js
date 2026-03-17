const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiError");

const isObjectId = (value) => typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

function validateObjectIdParam(paramName = "id") {
  return (req, _res, next) => {
    const value = req.params[paramName];
    if (!isObjectId(value)) return next(new ApiError(400, `Invalid ${paramName}`));
    return next();
  };
}

function validateObjectIdBody(fieldName, options = {}) {
  const { required = false, isArray = false } = options;

  return (req, _res, next) => {
    const value = req.body[fieldName];

    if (value === undefined || value === null || value === "") {
      if (required) return next(new ApiError(400, `${fieldName} is required`));
      return next();
    }

    if (isArray) {
      if (!Array.isArray(value)) return next(new ApiError(400, `${fieldName} must be an array`));
      const invalid = value.some((item) => !isObjectId(item));
      if (invalid) return next(new ApiError(400, `One or more values in ${fieldName} are invalid`));
      return next();
    }

    if (!isObjectId(value)) return next(new ApiError(400, `Invalid ${fieldName}`));
    return next();
  };
}

module.exports = {
  validateObjectIdParam,
  validateObjectIdBody,
};
