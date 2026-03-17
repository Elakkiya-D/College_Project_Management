const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "v2_student", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "v2_course", required: true, index: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("v2_result", resultSchema);

