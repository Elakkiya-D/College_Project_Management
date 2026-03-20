const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
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
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
