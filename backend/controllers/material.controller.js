const Material = require("../models/Material.model");
const mongoose = require("mongoose");

// Ensure related models are registered
require("../models/student.model");
require("../models/subject.model");
require("../models/Course.model");
require("../models/faculty.model");

// Create Study Material (Faculty)
exports.createMaterial = async (req, res) => {
    try {
        const { title, description, chapter, course, type, linkUrl, courseModel = 'subject' } = req.body;
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        const role = req.user?.role || req.auth?.role;
        const facultyModel = role === 'Faculty' ? 'faculty' : 'v2_faculty'; 

        if (!title || !chapter || !course || !type) {
            return res.status(400).json({ message: "Title, Chapter, Course, and Type are required" });
        }

        // Security check: Verify faculty is assigned to this course
        const { Faculty, V2Faculty } = require("../models/faculty.model");
        const facultyDoc = (await Faculty.findById(facultyId)) || (await V2Faculty.findOne({ user: facultyId }));
        
        if (!facultyDoc) return res.status(404).json({ message: "Faculty not found" });
        const assignedIds = (facultyDoc.assignedCourses || []).map(id => id.toString());
        const isAssigned = assignedIds.includes(course.toString()) || (facultyDoc.teachSubject?.toString() === course.toString());
        
        if (!isAssigned) {
            return res.status(403).json({ message: "Unauthorized: You are not assigned to this course" });
        }

        let fileUrl = null;
        if (type === "pdf") {
            if (!req.file) return res.status(400).json({ message: "PDF file is required for type 'pdf'" });
            fileUrl = `/uploads/materials/${req.file.filename}`;
        } else if (type === "link") {
            if (!linkUrl) return res.status(400).json({ message: "Link URL is required for type 'link'" });
        } else {
            return res.status(400).json({ message: "Invalid material type" });
        }

        const newMaterial = new Material({
            title,
            description,
            chapter,
            course,
            courseModel,
            faculty: facultyId,
            facultyModel,
            type,
            fileUrl,
            linkUrl: type === "link" ? linkUrl : null
        });

        await newMaterial.save();
        res.status(201).json({ success: true, message: "Study material created", data: newMaterial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get faculty materials (Faculty)
exports.getFacultyMaterials = async (req, res) => {
    try {
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        if (!facultyId) return res.status(401).json({ message: "Unauthorized" });

        const materials = await Material.find({ faculty: facultyId })
            .populate('course')
            .sort({ createdAt: -1 });

        res.status(200).json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get materials for student (Student)
exports.getStudentMaterials = async (req, res) => {
    try {
        const studentId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        if (!studentId) return res.status(401).json({ message: "Unauthorized" });

        const StudentModel = mongoose.model('student');
        let student = await StudentModel.findById(studentId);
        
        if (!student) {
            const V2Student = mongoose.model('v2_student');
            const v2std = await V2Student.findOne({ user: studentId });
            if (!v2std) return res.status(404).json({ message: "Student record not found" });
            
            const materials = await Material.find({ 
                course: { $in: v2std.enrolledCourses }
            }).populate('faculty', 'name').populate('course').sort({ chapter: 1 });

            return res.status(200).json(materials);
        }

        // V1 Logic
        const materials = await Material.find({ 
            $or: [
                { course: { $in: student.courseIds || [] } },
                { course: student.sclassName }
            ]
        }).populate('faculty', 'name').populate('course').sort({ chapter: 1 });

        res.status(200).json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Update material (Faculty)
exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, chapter, type, linkUrl, course } = req.body;
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        const fs = require('fs');
        const path = require('path');

        const material = await Material.findById(id);
        if (!material) return res.status(404).json({ message: "Material not found" });

        if (material.faculty.toString() !== facultyId.toString()) {
            return res.status(403).json({ message: "Unauthorized: You did not create this material" });
        }

        const updateData = {
            title: title || material.title,
            description: description || material.description,
            chapter: chapter || material.chapter,
            course: course || material.course,
            type: type || material.type
        };

        if (type === "pdf" || (!type && material.type === "pdf")) {
            if (req.file) {
                // Delete old file
                if (material.fileUrl) {
                    const oldPath = path.join(__dirname, "..", material.fileUrl);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                updateData.fileUrl = `/uploads/materials/${req.file.filename}`;
                updateData.linkUrl = null;
            }
        } else if (type === "link") {
            updateData.linkUrl = linkUrl || material.linkUrl;
            // Delete old file if switching type
            if (material.fileUrl) {
                const oldPath = path.join(__dirname, "..", material.fileUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.fileUrl = null;
        }

        const updated = await Material.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        res.status(200).json({ success: true, message: "Material updated", data: updated });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
