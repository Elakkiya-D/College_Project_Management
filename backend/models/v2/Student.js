const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "v2_user", required: true, unique: true, index: true },
    registerNumber: { type: String, required: true, trim: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "v2_course", index: true }],
  },
  { timestamps: true }
);

studentSchema.index({ registerNumber: 1 }, { unique: true });

module.exports = mongoose.model("v2_student", studentSchema);

