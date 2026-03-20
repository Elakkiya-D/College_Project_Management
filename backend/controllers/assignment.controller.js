const Assignment = require("../models/Assignment.model");
const Submission = require("../models/Submission.model");
const mongoose = require("mongoose");

// Force register models to avoid MissingSchemaError
require("../models/student.model");
require("../models/subject.model");
require("../models/Course.model");
require("../models/faculty.model");

// Create assignment (Faculty)
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, course, dueDate, courseModel = 'subject' } = req.body;
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        const role = req.user?.role || req.auth?.role;
        const facultyModel = role === 'Faculty' ? 'faculty' : 'v2_faculty'; 

        if (!title || !description || !course || !dueDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newAssignment = new Assignment({
            title,
            description,
            course,
            courseModel,
            faculty: facultyId,
            facultyModel,
            dueDate: new Date(dueDate)
        });

        await newAssignment.save();
        res.status(201).json({ success: true, message: "Assignment created", data: newAssignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get faculty's assignments
exports.getFacultyAssignments = async (req, res) => {
    try {
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        if (!facultyId) return res.status(401).json({ message: "Unauthorized" });

        const assignments = await Assignment.find({ faculty: facultyId })
            .populate('course')
            .sort({ createdAt: -1 });

        const assignmentsWithCount = await Promise.all(assignments.map(async (asgn) => {
            const count = await Submission.countDocuments({ assignment: asgn._id });
            return { ...asgn.toObject(), submissionCount: count };
        }));

        res.status(200).json(assignmentsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get student's assignments
exports.getStudentAssignments = async (req, res) => {
    try {
        const studentId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        const role = req.user?.role || req.auth?.role;
        const isV2 = role !== 'Student'; 
        
        if (!studentId) return res.status(401).json({ message: "Unauthorized" });

        const StudentModel = mongoose.model('student');
        let student = await StudentModel.findById(studentId);
        
        if (!student) {
            const V2Student = mongoose.model('v2_student');
            const v2std = await V2Student.findOne({ user: studentId });
            if (!v2std) return res.status(404).json({ message: "Student record not found" });
            
            const assignments = await Assignment.find({ 
                course: { $in: v2std.enrolledCourses }
            }).populate('faculty', 'name').populate('course').sort({ dueDate: 1 });

            return res.status(200).json(await mapSubmissions(assignments, studentId));
        }

        const assignments = await Assignment.find({ 
            $or: [
                { course: { $in: student.courseIds || [] } },
                { course: student.sclassName }
            ]
        }).populate('faculty', 'name').populate('course').sort({ dueDate: 1 });

        res.status(200).json(await mapSubmissions(assignments, studentId));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

async function mapSubmissions(assignments, studentId) {
    return await Promise.all(assignments.map(async (asgn) => {
        const submission = await Submission.findOne({ assignment: asgn._id, student: studentId });
        return {
            ...asgn.toObject(),
            status: submission ? 'Submitted' : 'Not submitted',
            submittedAt: submission?.submittedAt,
            fileUrl: submission?.fileUrl
        };
    }));
}

// Submit assignment (Student)
exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const studentId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        const role = req.user?.role || req.auth?.role;
        const studentModel = role === 'Student' ? 'student' : 'v2_student';

        if (!studentId) return res.status(401).json({ message: "Unauthorized" });

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF file" });
        }

        const existing = await Submission.findOne({ assignment: assignmentId, student: studentId });
        if (existing) {
            return res.status(400).json({ message: "You have already submitted this assignment" });
        }

        const submission = new Submission({
            assignment: assignmentId,
            student: studentId,
            studentModel,
            fileUrl: `/uploads/${req.file.filename}`
        });

        await submission.save();
        res.status(201).json({ success: true, message: "Assignment submitted", data: submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// View submissions (Faculty)
exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignment: assignmentId })
            .populate('student', 'name rollNum registerNumber')
            .sort({ submittedAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
