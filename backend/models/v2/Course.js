const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    code: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 20 },
    credits: { type: Number, required: true, min: 0, max: 30 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: "v2_faculty", default: null, index: true },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ department: 1, name: 1 });

module.exports = mongoose.model("v2_course", courseSchema);

