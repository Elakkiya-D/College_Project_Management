const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "v2_user", required: true, unique: true, index: true },
    phone: { type: String, trim: true, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    designation: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("v2_faculty", facultySchema);

