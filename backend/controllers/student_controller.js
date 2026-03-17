const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Faculty = require('../models/facultySchema.js');
const { parseTabularFile } = require('../utils/bulkUploadParser.js');
const { signAuthToken } = require('../utils/authToken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BULK_PASSWORD = process.env.BULK_UPLOAD_DEFAULT_PASSWORD || 'ChangeMe@123';

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const studentRegister = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const registerNumber = normalizeText(req.body.registerNumber || req.body.rollNum);
        const password = normalizeText(req.body.password);
        const adminID = normalizeText(req.body.adminID || req.body.school);
        const requestedDepartmentId = normalizeText(req.body.sclassName || req.body.departmentId || req.body.department);
        const courseId = normalizeText(req.body.courseId);
        const courseName = normalizeText(req.body.courseName || req.body.course);
        const skipCourseValidation = Boolean(req.body.skipCourseValidation);
        const createdBy = normalizeText(req.body.createdBy);

        if (!name || !email || !registerNumber || !password || !adminID || !requestedDepartmentId) {
            return res.status(400).json({ message: 'name, email, registerNumber, password, and department are required' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!skipCourseValidation && !courseId && !courseName) {
            return res.status(400).json({ message: 'Course assignment is required' });
        }

        const mappedDepartment = await Sclass.findOne({
            _id: requestedDepartmentId,
            school: adminID,
        });

        if (!mappedDepartment) {
            return res.status(400).json({ message: 'Selected department mapping is invalid' });
        }

        const existingStudentByRegisterNumber = await Student.findOne({
            rollNum: registerNumber,
            school: adminID,
        });

        if (existingStudentByRegisterNumber) {
            return res.send({ message: 'Register Number already exists' });
        }

        const existingStudentByEmail = await Student.findOne({
            email,
            school: adminID,
        });

        if (existingStudentByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const student = new Student({
            name,
            email,
            rollNum: registerNumber,
            registerNumber,
            password: hashedPass,
            school: adminID,
            sclassName: mappedDepartment._id,
            role: req.body.role || 'Student',
            attendance: Array.isArray(req.body.attendance) ? req.body.attendance : [],
            examResult: Array.isArray(req.body.examResult) ? req.body.examResult : [],
            departmentId: normalizeText(req.body.departmentId) || String(mappedDepartment._id),
            departmentName: normalizeText(req.body.departmentName) || mappedDepartment.sclassName,
            courseId: courseId || null,
            courseName: courseName || null,
            createdBy: createdBy || null,
        });

        let result = await student.save();

        result.password = undefined;
        return res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                const token = signAuthToken({
                    sub: student._id.toString(),
                    role: student.role || 'Student',
                    school: student.school?._id?.toString() || student.school?.toString(),
                });
                res.send({ user: student, token });
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const createStudentByFaculty = async (req, res) => {
    try {
        const facultyId = req.auth?.sub;

        if (!facultyId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const faculty = await Faculty.findById(facultyId)
            .populate('teachSclass', 'sclassName')
            .populate('school', 'schoolName');

        if (!faculty) {
            return res.status(403).json({ message: 'Faculty access denied' });
        }

        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const registerNumber = normalizeText(req.body.registerNumber || req.body.rollNum);
        const departmentId = normalizeText(req.body.departmentId || req.body.sclassName || req.body.department);
        const courseId = normalizeText(req.body.courseId);
        const courseName = normalizeText(req.body.courseName || req.body.course);
        const rawPassword = normalizeText(req.body.password) || DEFAULT_BULK_PASSWORD;

        if (!name || !email || !registerNumber) {
            return res.status(400).json({ message: 'name, email, and registerNumber are required' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!courseId && !courseName) {
            return res.status(400).json({ message: 'Course assignment is required' });
        }

        const mappedDepartment = faculty.teachSclass;
        if (!mappedDepartment?._id) {
            return res.status(400).json({ message: 'Faculty department mapping is missing' });
        }

        if (departmentId && departmentId !== String(mappedDepartment._id)) {
            return res.status(403).json({ message: 'Faculty can only add students to their department' });
        }

        let mappedCourse = null;
        if (courseId) {
            mappedCourse = await Subject.findOne({
                _id: courseId,
                sclassName: mappedDepartment._id,
                school: faculty.school,
            });

            if (!mappedCourse) {
                return res.status(400).json({ message: 'Selected course mapping is invalid' });
            }
        }

        const existingStudentByRegisterNumber = await Student.findOne({
            rollNum: registerNumber,
            school: faculty.school,
        });

        if (existingStudentByRegisterNumber) {
            return res.send({ message: 'Register Number already exists' });
        }

        const existingStudentByEmail = await Student.findOne({
            email,
            school: faculty.school,
        });

        if (existingStudentByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(rawPassword, salt);

        const student = new Student({
            name,
            email,
            rollNum: registerNumber,
            registerNumber,
            password: hashedPass,
            school: faculty.school,
            sclassName: mappedDepartment._id,
            role: 'Student',
            attendance: [],
            examResult: [],
            departmentId: String(mappedDepartment._id),
            departmentName: mappedDepartment.sclassName,
            courseId: courseId || mappedCourse?._id || null,
            courseName: courseName || mappedCourse?.subName || null,
            createdBy: faculty._id,
        });

        const result = await student.save();
        result.password = undefined;
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Unable to create student', error: error.message });
    }
};

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;
    try {
        // Attempt an atomic array update if the subject result already exists
        let student = await Student.findOneAndUpdate(
            { _id: req.params.id, "examResult.subName": subName },
            { $set: { "examResult.$.marksObtained": marksObtained } },
            { new: true }
        );

        if (!student) {
            // Upsert the new record safely avoiding parallel race conditions
            student = await Student.findByIdAndUpdate(
                req.params.id,
                { $push: { examResult: { subName, marksObtained } } },
                { new: true }
            );
        }

        if (!student) {
            return res.send({ message: 'Student not found' });
        }
        return res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        // Create boundaries for exactly matching attendance date to prevent timezone duplicates
        const formattedDate = new Date(date);
        const startOfDay = new Date(formattedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(formattedDate.setHours(23, 59, 59, 999));

        // Attempt Atomic update if session already recorded today
        let student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                "attendance.subName": subName,
                "attendance.date": { $gte: startOfDay, $lte: endOfDay }
            },
            { $set: { "attendance.$.status": status } },
            { new: true }
        );

        if (!student) {
            // Fetch baseline to check safety ceilings (sessions) before purely inserting
            const baseStudent = await Student.findById(req.params.id);
            if (!baseStudent) return res.send({ message: 'Student not found' });

            const subject = await Subject.findById(subName);
            const attendedSessions = baseStudent.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (subject && attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            // Atomic Push without re-triggering save validations on stale documents
            student = await Student.findByIdAndUpdate(
                req.params.id,
                { $push: { attendance: { date: new Date(date), status, subName } } },
                { new: true }
            );
        }

        return res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const bulkUploadStudents = async (req, res) => {
    try {
        const adminID = normalizeText(req.body.adminID || req.body.school || req.body.adminId);
        if (!adminID) {
            return res.status(400).json({ success: false, message: 'adminID is required' });
        }

        const parsedRows = parseTabularFile(req.file);
        if (!parsedRows.length) {
            return res.status(400).json({ success: false, message: 'Uploaded file has no valid data rows' });
        }

        const departments = await Sclass.find({ school: adminID });
        if (!departments.length) {
            return res.status(400).json({ success: false, message: 'No departments found for this admin account' });
        }

        const departmentMap = new Map(
            departments.map((department) => [
                normalizeText(department.sclassName).toLowerCase(),
                department,
            ])
        );

        const report = {
            totalRows: parsedRows.length,
            insertedCount: 0,
            failedCount: 0,
            errors: [],
        };

        const seenEmails = new Set();
        const seenRegisterNumbers = new Set();

        const defaultPasswordHash = await bcrypt.hash(DEFAULT_BULK_PASSWORD, 10);

        for (const row of parsedRows) {
            const name = normalizeText(row.values.name);
            const email = normalizeEmail(row.values.email);
            const registerNumber = normalizeText(row.values.registernumber || row.values.rollnum);
            const departmentName = normalizeText(row.values.department);
            const courseName = normalizeText(row.values.course);

            if (!name || !email || !registerNumber || !departmentName || !courseName) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: 'Missing required columns: name, email, registerNumber, department, course',
                });
                continue;
            }

            if (!EMAIL_REGEX.test(email)) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: 'Invalid email format',
                });
                continue;
            }

            const mappedDepartment = departmentMap.get(departmentName.toLowerCase());
            if (!mappedDepartment) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: `Department not found: ${departmentName}`,
                });
                continue;
            }

            const emailKey = `${adminID}:${email}`;
            const registerNumberKey = `${adminID}:${registerNumber}`;

            if (seenEmails.has(emailKey) || seenRegisterNumbers.has(registerNumberKey)) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: 'Duplicate email or registerNumber found in upload file',
                });
                continue;
            }

            const existingByEmail = await Student.findOne({ email, school: adminID });
            if (existingByEmail) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: `Email already exists: ${email}`,
                });
                continue;
            }

            const existingByRegisterNumber = await Student.findOne({
                rollNum: registerNumber,
                school: adminID,
            });

            if (existingByRegisterNumber) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: `Register number already exists: ${registerNumber}`,
                });
                continue;
            }

            const student = new Student({
                name,
                email,
                rollNum: registerNumber,
                registerNumber,
                password: defaultPasswordHash,
                sclassName: mappedDepartment._id,
                school: adminID,
                role: 'Student',
                attendance: [],
                departmentId: String(mappedDepartment._id),
                departmentName: mappedDepartment.sclassName,
                courseName,
            });

            try {
                await student.save();
                seenEmails.add(emailKey);
                seenRegisterNumbers.add(registerNumberKey);
                report.insertedCount += 1;
            } catch (saveError) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: saveError?.message || 'Unable to save student record',
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Student bulk upload completed',
            data: {
                ...report,
                defaultPassword: DEFAULT_BULK_PASSWORD,
            },
        });
    } catch (error) {
        const isClientError = /required|invalid file format|empty|unable to read/i.test(error.message || '');
        return res.status(isClientError ? 400 : 500).json({
            success: false,
            message: error.message || 'Unable to process student bulk upload',
        });
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    createStudentByFaculty,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,

    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    bulkUploadStudents,
};