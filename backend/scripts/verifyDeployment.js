require('dotenv').config();
const mongoose = require('mongoose');

const Department = require('../models/Department.model');
const { V2Faculty: Faculty } = require('../models/faculty.model');
const Course = require('../models/Course.model');
const { V2Student: Student } = require('../models/student.model');

const mongoUri = process.env.MONGO_URI || process.env.mongo;

async function verifyDeployment() {
    if (!mongoUri) {
        throw new Error('Missing MONGO_URI connection string in environment.');
    }

    await mongoose.connect(mongoUri);

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((item) => item.name).sort();

    const expectedCollections = {
        departments: ['departments', 'v2_departments'],
        faculty: ['faculty', 'v2_faculties'],
        courses: ['courses', 'v2_courses'],
        students: ['students', 'v2_students'],
    };

    const resolvedCollections = Object.fromEntries(
        Object.entries(expectedCollections).map(([key, candidates]) => [
            key,
            candidates.filter((name) => collectionNames.includes(name)),
        ])
    );

    const departments = await Department.find().select('_id').lean();
    const departmentIdSet = new Set(departments.map((item) => String(item._id)));

    const facultyRecords = await Faculty.find().select('_id department').lean();
    const invalidFaculty = facultyRecords.filter((item) => !departmentIdSet.has(String(item.department)));

    const courseRecords = await Course.find()
        .select('_id department assignedFaculty')
        .populate({ path: 'assignedFaculty', select: 'department' });
    const invalidCourses = courseRecords.filter((item) => {
        if (!departmentIdSet.has(String(item.department))) return true;
        if (!item.assignedFaculty) return false;

        return String(item.assignedFaculty.department) !== String(item.department);
    });

    const studentRecords = await Student.find()
        .select('_id department enrolledCourses')
        .populate({ path: 'enrolledCourses', select: 'department' });
    const invalidStudents = studentRecords.filter((item) => {
        if (!departmentIdSet.has(String(item.department))) return true;

        return item.enrolledCourses.some((course) => String(course.department) !== String(item.department));
    });

    const summary = {
        collections: {
            available: collectionNames,
            resolved: resolvedCollections,
        },
        counts: {
            departments: departments.length,
            faculty: facultyRecords.length,
            courses: courseRecords.length,
            students: studentRecords.length,
        },
        relationships: {
            facultyToDepartment: invalidFaculty.length === 0,
            courseToDepartment: invalidCourses.length === 0,
            studentToDepartmentAndCourse: invalidStudents.length === 0,
            invalidFacultyCount: invalidFaculty.length,
            invalidCourseCount: invalidCourses.length,
            invalidStudentCount: invalidStudents.length,
        },
    };

    console.log(JSON.stringify(summary, null, 2));

    await mongoose.disconnect();

    if (invalidFaculty.length || invalidCourses.length || invalidStudents.length) {
        process.exit(1);
    }
}

verifyDeployment().catch(async (error) => {
    console.error(error.message || error);

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    process.exit(1);
});