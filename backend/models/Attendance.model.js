const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'studentModel',
    required: true
  },
  studentModel: {
    type: String,
    required: true,
    enum: ['student', 'v2_student'],
    default: 'student'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'courseModel',
    required: true
  },
  courseModel: {
    type: String,
    required: true,
    enum: ['subject', 'v2_course'],
    default: 'subject'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'facultyModel',
    required: true
  },
  facultyModel: {
    type: String,
    required: true,
    enum: ['faculty', 'v2_faculty'],
    default: 'faculty'
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true
  }
}, { timestamps: true });

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
