const mongoose = require('mongoose');

// --- V1 Student Schema ---
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    rollNum: { type: String, required: true },
    registerNumber: { type: String, trim: true, default: null },
    password: { type: String, required: true },
    sclassName: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    role: { type: String, default: "Student" },
    phone: { type: String, default: null },
    year: { type: String, default: null },
    semester: { type: String, default: null },
    gender: { type: String, default: null },
    address: { type: String, default: null },
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'subject' }],
    departmentId: { type: String, default: null },
    departmentName: { type: String, default: null },
    courseId: { type: String, default: null },
    courseName: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'faculty', default: null },
    examResult: [
        {
            subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
            marksObtained: { type: Number, default: 0 }
        }
    ],
    attendance: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['Present', 'Absent'], required: true },
        subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true }
    }]
}, { timestamps: true });

// Ensure no identical roll numbers exist inside the same school configuration
studentSchema.index({ rollNum: 1, school: 1 }, { unique: true });
// Keep email unique inside a school while allowing missing values for legacy records
studentSchema.index({ email: 1, school: 1 }, { unique: true, sparse: true });

// --- V2 Student Schema ---
const v2StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "v2_user", required: true, unique: true, index: true },
    registerNumber: { type: String, required: true, trim: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "v2_course", index: true }],
  },
  { timestamps: true }
);

v2StudentSchema.index({ registerNumber: 1 }, { unique: true });

module.exports = {
  Student: mongoose.models.student || mongoose.model("student", studentSchema),
  V2Student: mongoose.models.v2_student || mongoose.model("v2_student", v2StudentSchema)
};
