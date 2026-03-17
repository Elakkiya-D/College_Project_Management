const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');
const { parseTabularFile } = require('../utils/bulkUploadParser.js');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BULK_PASSWORD = process.env.BULK_UPLOAD_DEFAULT_PASSWORD || 'ChangeMe@123';

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const teacherRegister = async (req, res) => {
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = normalizeText(req.body.password);
    const role = normalizeText(req.body.role) || 'Teacher';
    const school = normalizeText(req.body.school);
    const teachSubject = normalizeText(req.body.teachSubject);
    const teachSclass = normalizeText(req.body.teachSclass);
    const designation = normalizeText(req.body.designation) || 'Faculty';

    try {
        if (!name || !email || !password || !school || !teachSclass) {
            return res.status(400).json({ message: 'name, email, password, and department are required' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const mappedDepartment = await Sclass.findOne({ _id: teachSclass, school });
        if (!mappedDepartment) {
            return res.status(400).json({ message: 'Selected department mapping is invalid' });
        }

        if (!teachSubject) {
            return res.status(400).json({ message: 'Course assignment is required for faculty onboarding' });
        }

        const mappedCourse = await Subject.findOne({
            _id: teachSubject,
            sclassName: mappedDepartment._id,
            school,
        });

        if (!mappedCourse) {
            return res.status(400).json({ message: 'Selected course mapping is invalid' });
        }

        const existingTeacherByEmail = await Teacher.findOne({ email, school });
        if (existingTeacherByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({
            name,
            email,
            password: hashedPass,
            role,
            school,
            teachSubject: mappedCourse._id,
            teachSclass: mappedDepartment._id,
            designation,
        });

        let result = await teacher.save();
        await Subject.findByIdAndUpdate(mappedCourse._id, { teacher: teacher._id });
        result.password = undefined;
        return res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

const bulkUploadFaculty = async (req, res) => {
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
        const defaultPasswordHash = await bcrypt.hash(DEFAULT_BULK_PASSWORD, 10);

        for (const row of parsedRows) {
            const name = normalizeText(row.values.name);
            const email = normalizeEmail(row.values.email);
            const departmentName = normalizeText(row.values.department);
            const designation = normalizeText(row.values.designation);

            if (!name || !email || !departmentName || !designation) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: 'Missing required columns: name, email, department, designation',
                });
                continue;
            }

            if (!EMAIL_REGEX.test(email)) {
                report.failedCount += 1;
                report.errors.push({ row: row.rowNumber, message: 'Invalid email format' });
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
            if (seenEmails.has(emailKey)) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: 'Duplicate email found in upload file',
                });
                continue;
            }

            const existingFaculty = await Teacher.findOne({ email, school: adminID });
            if (existingFaculty) {
                report.failedCount += 1;
                report.errors.push({ row: row.rowNumber, message: `Email already exists: ${email}` });
                continue;
            }

            const faculty = new Teacher({
                name,
                email,
                password: defaultPasswordHash,
                role: 'Teacher',
                designation,
                school: adminID,
                teachSclass: mappedDepartment._id,
            });

            try {
                await faculty.save();
                seenEmails.add(emailKey);
                report.insertedCount += 1;
            } catch (saveError) {
                report.failedCount += 1;
                report.errors.push({
                    row: row.rowNumber,
                    message: saveError?.message || 'Unable to save faculty record',
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Faculty bulk upload completed',
            data: {
                ...report,
                defaultPassword: DEFAULT_BULK_PASSWORD,
            },
        });
    } catch (error) {
        const isClientError = /required|invalid file format|empty|unable to read/i.test(error.message || '');
        return res.status(isClientError ? 400 : 500).json({
            success: false,
            message: error.message || 'Unable to process faculty bulk upload',
        });
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    bulkUploadFaculty,
};