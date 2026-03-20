const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
  },
  chapter: {
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
  type: {
    type: String,
    enum: ["pdf", "link"],
    required: true
  },
  fileUrl: {
    type: String, // for PDF
  },
  linkUrl: {
    type: String, // for website link
  }
}, { timestamps: true });

module.exports = mongoose.model("Material", materialSchema);
