const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
    },
    rollNum: {
        type: String,
        required: true
    },
    registerNumber: {
        type: String,
        trim: true,
        default: null,
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    departmentId: {
        type: String,
        default: null,
    },
    departmentName: {
        type: String,
        default: null,
    },
    courseId: {
        type: String,
        default: null,
    },
    courseName: {
        type: String,
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'faculty',
        default: null,
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }]
}, { timestamps: true });

// Ensure no identical roll numbers exist inside the same school configuration
studentSchema.index({ rollNum: 1, school: 1 }, { unique: true });
// Keep email unique inside a school while allowing missing values for legacy records
studentSchema.index({ email: 1, school: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("student", studentSchema);