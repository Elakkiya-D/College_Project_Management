const mongoose = require('mongoose');

// --- V1 Faculty Schema ---
const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Faculty' },
    designation: { type: String, default: 'Faculty' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    teachSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
    teachSclass: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
    attendance: [
        {
            date: { type: Date, required: true },
            presentCount: { type: String },
            absentCount: { type: String },
        },
    ],
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'subject' }]
}, { timestamps: true });

// --- V2 Faculty Schema ---
const v2FacultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "v2_user", required: true, unique: true, index: true },
    phone: { type: String, trim: true, default: "" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "v2_department", required: true, index: true },
    designation: { type: String, trim: true, default: "" },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "v2_course" }]
  },
  { timestamps: true }
);

module.exports = {
  Faculty: mongoose.models.faculty || mongoose.model('faculty', facultySchema),
  V2Faculty: mongoose.models.v2_faculty || mongoose.model("v2_faculty", v2FacultySchema)
};
