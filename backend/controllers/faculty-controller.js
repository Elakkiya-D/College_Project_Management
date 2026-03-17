const bcrypt = require('bcrypt');
const Faculty = require('../models/facultySchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');
const { parseTabularFile } = require('../utils/bulkUploadParser.js');
const { signAuthToken } = require('../utils/authToken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BULK_PASSWORD = process.env.BULK_UPLOAD_DEFAULT_PASSWORD || 'ChangeMe@123';

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const facultyRegister = async (req, res) => {
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = normalizeText(req.body.password);
    const role = normalizeText(req.body.role) || 'Faculty';
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

        const existingFacultyByEmail = await Faculty.findOne({ email, school });
        if (existingFacultyByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const faculty = new Faculty({
            name,
            email,
            password: hashedPass,
            role,
            school,
            teachSubject: mappedCourse._id,
            teachSclass: mappedDepartment._id,
            designation,
        });

        let result = await faculty.save();
        await Subject.findByIdAndUpdate(mappedCourse._id, { faculty: faculty._id });
        result.password = undefined;
        return res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const facultyLogIn = async (req, res) => {
    try {
        let faculty = await Faculty.findOne({ email: req.body.email });
        if (faculty) {
            const validated = await bcrypt.compare(req.body.password, faculty.password);
            if (validated) {
                faculty = await faculty.populate('teachSubject', 'subName sessions');
                faculty = await faculty.populate('school', 'schoolName');
                faculty = await faculty.populate('teachSclass', 'sclassName');
                faculty.password = undefined;
                const token = signAuthToken({
                    sub: faculty._id.toString(),
                    role: faculty.role || 'Faculty',
                    school: faculty.school?._id?.toString() || faculty.school?.toString(),
                });
                res.send({ user: faculty, token });
            } else {
                res.send({ message: 'Invalid password' });
            }
        } else {
            res.send({ message: 'Faculty not found' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getFacultyList = async (req, res) => {
    try {
        let faculty = await Faculty.find({ school: req.params.id })
            .populate('teachSubject', 'subName')
            .populate('teachSclass', 'sclassName');
        if (faculty.length > 0) {
            let modifiedFaculty = faculty.map((member) => {
                return { ...member._doc, password: undefined };
            });
            res.send(modifiedFaculty);
        } else {
            res.send({ message: 'No faculty found' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getFacultyDetail = async (req, res) => {
    try {
        let faculty = await Faculty.findById(req.params.id)
            .populate('teachSubject', 'subName sessions')
            .populate('school', 'schoolName')
            .populate('teachSclass', 'sclassName');
        if (faculty) {
            faculty.password = undefined;
            res.send(faculty);
        } else {
            res.send({ message: 'No faculty found' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateFacultySubject = async (req, res) => {
    const { facultyId, teachSubject } = req.body;
    try {
        const updatedFaculty = await Faculty.findByIdAndUpdate(
            facultyId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { faculty: updatedFaculty._id });

        res.send(updatedFaculty);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);

        if (deletedFaculty) {
            await Subject.updateOne(
                { faculty: deletedFaculty._id },
                { $unset: { faculty: 1 } }
            );
        }

        res.send(deletedFaculty);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFacultyList = async (req, res) => {
    try {
        const facultyList = await Faculty.find({ school: req.params.id });
        const deletionResult = await Faculty.deleteMany({ school: req.params.id });

        if ((deletionResult.deletedCount || 0) === 0) {
            res.send({ message: 'No faculty found to delete' });
            return;
        }

        const facultyIds = facultyList.map((member) => member._id);
        if (facultyIds.length) {
            await Subject.updateMany(
                { faculty: { $in: facultyIds } },
                { $unset: { faculty: 1 } }
            );
        }

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFacultyByClass = async (req, res) => {
    try {
        const facultyList = await Faculty.find({ teachSclass: req.params.id });
        const deletionResult = await Faculty.deleteMany({ teachSclass: req.params.id });

        if ((deletionResult.deletedCount || 0) === 0) {
            res.send({ message: 'No faculty found to delete' });
            return;
        }

        const facultyIds = facultyList.map((member) => member._id);
        if (facultyIds.length) {
            await Subject.updateMany(
                { faculty: { $in: facultyIds } },
                { $unset: { faculty: 1 } }
            );
        }

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const facultyAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.send({ message: 'Faculty not found' });
        }

        const existingAttendance = faculty.attendance.find(
            (record) => record.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            faculty.attendance.push({ date, status });
        }

        const result = await faculty.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
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

            const existingFaculty = await Faculty.findOne({ email, school: adminID });
            if (existingFaculty) {
                report.failedCount += 1;
                report.errors.push({ row: row.rowNumber, message: `Email already exists: ${email}` });
                continue;
            }

            const faculty = new Faculty({
                name,
                email,
                password: defaultPasswordHash,
                role: 'Faculty',
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
    facultyRegister,
    facultyLogIn,
    getFacultyList,
    getFacultyDetail,
    updateFacultySubject,
    deleteFaculty,
    deleteFacultyList,
    deleteFacultyByClass,
    facultyAttendance,
    bulkUploadFaculty,
};
