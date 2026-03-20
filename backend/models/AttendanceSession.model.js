const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "v2_student", required: true, index: true },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
  },
  { _id: false }
);

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "v2_course", required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    date: { type: Date, required: true, index: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "v2_faculty", required: true, index: true },
    records: { type: [attendanceRecordSchema], default: [] },
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("v2_attendance_session", attendanceSessionSchema);

