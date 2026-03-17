const mongoose = require("mongoose");

const USER_ROLES = ["ADMIN", "FACULTY", "STUDENT"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("v2_user", userSchema);
module.exports.USER_ROLES = USER_ROLES;

