const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    code: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 20 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 });

module.exports = mongoose.model("v2_department", departmentSchema);

