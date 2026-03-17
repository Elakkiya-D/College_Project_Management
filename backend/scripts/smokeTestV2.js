require('dotenv').config();
const mongoose = require('mongoose');

const { startServer } = require('../index');
const User = require('../models/v2/User');
const Department = require('../models/v2/Department');
const Faculty = require('../models/v2/Faculty');
const Course = require('../models/v2/Course');
const Student = require('../models/v2/Student');

const PORT = Number(process.env.PORT || 5000);
const BASE_URL = process.env.SMOKE_TEST_BASE_URL || `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${JSON.stringify(data)}`);
    }

    return data;
}

async function run() {
    const createdIds = {
        adminUserId: null,
        departmentId: null,
        facultyId: null,
        facultyUserId: null,
        courseId: null,
        studentId: null,
        studentUserId: null,
    };

    let server;

    try {
        if (!process.env.SMOKE_TEST_BASE_URL) {
            server = await startServer();
        }

        const uniqueSuffix = Date.now().toString().slice(-8);
        const adminEmail = `verification.admin.${uniqueSuffix}@example.com`;
        const facultyEmail = `verification.faculty.${uniqueSuffix}@example.com`;
        const studentEmail = `verification.student.${uniqueSuffix}@example.com`;
        const departmentCode = `VD${uniqueSuffix.slice(-4)}`;
        const courseCode = `CRS${uniqueSuffix.slice(-4)}`;
        const registerNumber = `REG${uniqueSuffix}`;

        const signup = await request('/api/v2/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Verification Admin',
                email: adminEmail,
                password: 'StrongPass123',
                role: 'ADMIN',
            }),
        });

        createdIds.adminUserId = signup.user.id;

        const authHeaders = {
            Authorization: `Bearer ${signup.token}`,
        };

        const createdDepartment = await request('/api/v2/departments', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                name: `Verification Department ${uniqueSuffix}`,
                code: departmentCode,
                description: 'Automated deployment verification department',
            }),
        });

        createdIds.departmentId = createdDepartment.item._id;

        await request(`/api/v2/departments/${createdIds.departmentId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                description: 'Updated by automated deployment verification',
            }),
        });

        const departmentList = await request('/api/v2/departments', {
            headers: authHeaders,
        });

        if (!departmentList.items.some((item) => item._id === createdIds.departmentId)) {
            throw new Error('Created department was not returned by listDepartments');
        }

        const createdFaculty = await request('/api/v2/faculty', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                name: 'Verification Faculty',
                email: facultyEmail,
                password: 'StrongPass123',
                departmentId: createdIds.departmentId,
                designation: 'Verifier',
                phone: '9000000000',
            }),
        });

        createdIds.facultyId = createdFaculty.item._id;
        createdIds.facultyUserId = createdFaculty.item.user._id;

        await request(`/api/v2/faculty/${createdIds.facultyId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                designation: 'Senior Verifier',
            }),
        });

        const fetchedFaculty = await request(`/api/v2/faculty/${createdIds.facultyId}`, {
            headers: authHeaders,
        });

        if (fetchedFaculty.item.department._id !== createdIds.departmentId) {
            throw new Error('Faculty department relationship validation failed');
        }

        const createdCourse = await request('/api/v2/courses', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                name: `Verification Course ${uniqueSuffix}`,
                code: courseCode,
                credits: 4,
                departmentId: createdIds.departmentId,
                assignedFacultyId: createdIds.facultyId,
            }),
        });

        createdIds.courseId = createdCourse.item._id;

        await request(`/api/v2/courses/${createdIds.courseId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                credits: 5,
            }),
        });

        const createdStudent = await request('/api/v2/students', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                name: 'Verification Student',
                email: studentEmail,
                password: 'StrongPass123',
                registerNumber,
                departmentId: createdIds.departmentId,
                enrolledCourseIds: [createdIds.courseId],
            }),
        });

        createdIds.studentId = createdStudent.item._id;
        createdIds.studentUserId = createdStudent.item.user._id;

        await request(`/api/v2/students/${createdIds.studentId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                registerNumber: `${registerNumber}-U`,
                enrolledCourseIds: [createdIds.courseId],
            }),
        });

        const fetchedStudent = await request(`/api/v2/students/${createdIds.studentId}`, {
            headers: authHeaders,
        });

        if (!fetchedStudent.item.enrolledCourses.some((item) => item._id === createdIds.courseId)) {
            throw new Error('Student course relationship validation failed');
        }

        const [departmentRecord, facultyRecord, courseRecord, studentRecord] = await Promise.all([
            Department.findById(createdIds.departmentId).lean(),
            Faculty.findById(createdIds.facultyId).lean(),
            Course.findById(createdIds.courseId).lean(),
            Student.findById(createdIds.studentId).lean(),
        ]);

        if (!departmentRecord || !facultyRecord || !courseRecord || !studentRecord) {
            throw new Error('MongoDB persistence verification failed');
        }

        if (String(facultyRecord.department) !== String(createdIds.departmentId)) {
            throw new Error('Faculty to department persistence mismatch');
        }

        if (String(courseRecord.department) !== String(createdIds.departmentId)) {
            throw new Error('Course to department persistence mismatch');
        }

        if (String(courseRecord.assignedFaculty) !== String(createdIds.facultyId)) {
            throw new Error('Course to faculty persistence mismatch');
        }

        if (String(studentRecord.department) !== String(createdIds.departmentId)) {
            throw new Error('Student to department persistence mismatch');
        }

        if (!studentRecord.enrolledCourses.some((item) => String(item) === String(createdIds.courseId))) {
            throw new Error('Student to course persistence mismatch');
        }

        console.log(JSON.stringify({
            ok: true,
            baseUrl: BASE_URL,
            verified: ['auth', 'department CRUD', 'faculty CRUD', 'course CRUD', 'student CRUD', 'MongoDB persistence'],
        }, null, 2));
    } finally {
        if (createdIds.studentId) await Student.findByIdAndDelete(createdIds.studentId);
        if (createdIds.studentUserId) await User.findByIdAndDelete(createdIds.studentUserId);
        if (createdIds.courseId) await Course.findByIdAndDelete(createdIds.courseId);
        if (createdIds.facultyId) await Faculty.findByIdAndDelete(createdIds.facultyId);
        if (createdIds.facultyUserId) await User.findByIdAndDelete(createdIds.facultyUserId);
        if (createdIds.departmentId) await Department.findByIdAndDelete(createdIds.departmentId);
        if (createdIds.adminUserId) await User.findByIdAndDelete(createdIds.adminUserId);

        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) return reject(error);
                    return resolve();
                });
            });
        }

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

run().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});