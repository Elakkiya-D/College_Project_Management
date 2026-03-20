const Attendance = require("../models/Attendance.model");
const V2Course = require("../models/Course.model");
const mongoose = require("mongoose");
// Register student schemas
require("../models/student.model");

const markAttendance = async (req, res) => {
  try {
    const { course, date, records } = req.body;
    
    if (!course || !date || !records || !Array.isArray(records)) {
        return res.status(400).json({ message: "Invalid request format. Course, Date and Records are required." });
    }

    const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
    if (!facultyId) return res.status(401).json({ message: "Missing faculty ID" });

    // Security check: Verify faculty is assigned to this course
    const { Faculty, V2Faculty } = require("../models/faculty.model");
    const facultyDoc = (await Faculty.findById(facultyId)) || (await V2Faculty.findOne({ user: facultyId }));
    
    if (!facultyDoc) return res.status(404).json({ message: "Faculty not found" });
    const assignedIds = (facultyDoc.assignedCourses || []).map(id => id.toString());
    const isAssigned = assignedIds.includes(course.toString()) || (facultyDoc.teachSubject?.toString() === course.toString());
    
    if (!isAssigned) {
        return res.status(403).json({ message: "Unauthorized: You are not assigned to this course" });
    }

    // Normalize date to midnight
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Detect models
    let cM = 'subject';
    const isV2 = await V2Course.exists({ _id: course });
    if (isV2) cM = 'v2_course';

    for (const r of records) {
        const sId = r.studentId || r.student;
        if (!sId) continue;

        let sM = 'student';
        const v2S = await mongoose.model("v2_student").exists({ user: sId }) || await mongoose.model("v2_student").exists({ _id: sId });
        if (v2S) sM = 'v2_student';

        // Use upsert to prevent duplicates and allow updates
        await Attendance.updateOne(
            { 
                student: sId, 
                course: course, 
                date: selectedDate 
            },
            {
                $set: {
                    studentModel: sM,
                    courseModel: cM,
                    faculty: facultyId,
                    facultyModel: req.user?.role === 'Faculty' ? 'faculty' : 'v2_faculty',
                    status: r.status || 'Present',
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );
    }

    res.status(200).json({ success: true, message: "Attendance published successfully" });

  } catch (error) {
    console.error("Attendance Submission Error:", error);
    res.status(500).json({ message: error.message || "Attendance failed to publish" });
  }
};

const getAttendanceByCourseAndDate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date } = req.query;

        if (!courseId || !date) {
            return res.status(400).json({ message: "Course ID and Date are required" });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0,0,0,0);

        // Required models for population
        require("../models/student.model");
        require("../models/subject.model");
        require("../models/Course.model");

        const records = await Attendance.find({ 
            course: courseId, 
            date: selectedDate 
        })
        .populate({
            path: "student",
            select: "name rollNum registerNumber",
            // Use populate's internal logic since we use refPath in schema
        });

        res.status(200).json(records);
    } catch (err) {
        console.error("Fetch Course Attendance Error:", err);
        res.status(500).json({ message: "Failed to fetch attendance for selected date" });
    }
}

const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
    
    require("../models/student.model");
    require("../models/subject.model");
    require("../models/Course.model");
    require("../models/faculty.model");

    const records = await Attendance.find({ student: studentId })
      .populate({
          path: "course",
          select: "name subName courseName"
      })
      .populate({
          path: "faculty",
          select: "name"
      })
      .sort({ date: -1 });
      
    res.status(200).json(records);
  } catch (err) {
    console.error("Fetch Attendance Error:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

const getFacultyCourses = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const mongoose = require("mongoose");
        
        // V1 Logic
        const Subject = require("../models/subject.model");
        const Faculty = require("../models/faculty.model").Faculty;
        const facultyData = await Faculty.findById(facultyId);
        
        let courses = await Subject.find({ faculty: facultyId });
        
        if (courses.length === 0 && facultyData) {
            // Check if teachSubject is set instead
            if (facultyData.teachSubject) {
                const singleCourse = await Subject.findById(facultyData.teachSubject);
                if (singleCourse) courses.push(singleCourse);
            }
            // Check teachSclass fallback
            if (courses.length === 0 && facultyData.teachSclass) {
                courses = await Subject.find({ sclassName: facultyData.teachSclass });
            }
        }
        
        // V2 Logic
        if (courses.length === 0) {
            try {
                const V2Course = require("../models/Course.model");
                courses = await V2Course.find({ assignedFaculty: facultyId });
                
                // Try by department
                if (courses.length === 0) {
                    const { V2Faculty } = require("../models/faculty.model");
                    const v2Fac = await V2Faculty.findOne({ user: facultyId }) || await V2Faculty.findById(facultyId);
                    
                    if (v2Fac && v2Fac.department) {
                        courses = await V2Course.find({ department: v2Fac.department });
                    }
                }
            } catch (v2Error) {
                // Ignore V2 evaluation errors if V2 isn't strictly set up yet
                console.log("V2 Logic skipped or missing:", v2Error.message);
            }
        }
        
        res.status(200).json({ data: courses });
    } catch(err) {
        console.error("Fetch courses error:", err);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
}

const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        console.log("Fetching students for Course ID:", courseId);
        
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }
        
        const StudentModel = require("../models/student.model");
        const Student = StudentModel.Student;
        const V2Student = StudentModel.V2Student;
        
        const Subject = require("../models/subject.model");
        const V2Course = require("../models/Course.model");
        
        // Try finding as V1 Subject first
        let course = await Subject.findById(courseId);
        let students = [];
        
        if (course) {
            console.log("Detected V1 Subject:", course.subName);
            // Search students matching this sclass OR having this subject in courseIds
            students = await Student.find({
                $or: [
                    { sclassName: course.sclassName },
                    { courseIds: courseId }
                ]
            });
        } else {
            // Try V2 Course
            course = await V2Course.findById(courseId);
            if (course) {
                console.log("Detected V2 Course:", course.name, "Dept:", course.department);
                // Option B: Find students in the same department
                students = await V2Student.find({
                    $or: [
                        { enrolledCourses: courseId },
                        { department: course.department }
                    ]
                }).populate('user', 'name');
                
                // Format V2 students for the frontend to match the expected structure
                students = students.map(s => ({
                    _id: s.user?._id || s._id,
                    name: s.user?.name || "Unknown",
                    registerNumber: s.registerNumber,
                    rollNum: s.registerNumber // for compatibility
                }));
            }
        }
        
        if (!course) {
            console.log("Course not found for ID:", courseId);
            return res.status(404).json({ message: "Course not found" });
        }

        console.log(`Found ${students.length} students`);
        res.status(200).json({ data: students });

    } catch(err) {
        console.error("Failed to fetch students:", err);
        res.status(500).json({ message: "Failed to fetch students" });
    }
}

const updateAttendance = async (req, res) => {
    try {
        const { student, course, date, status } = req.body;
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        
        if (!student || !course || !date || !status) {
            return res.status(400).json({ message: "Student, Course, Date and Status are required" });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0,0,0,0);

        const updated = await Attendance.updateOne(
            { student, course, date: selectedDate },
            { $set: { status, faculty: facultyId, updatedAt: new Date() } },
            { upsert: true }
        );

        res.status(200).json({ success: true, message: "Attendance updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { markAttendance, getStudentAttendance, getFacultyCourses, getCourseStudents, getAttendanceByCourseAndDate, updateAttendance };
