/* --- MERGED V1 Content --- */
const bcrypt = require('bcrypt');
const { Faculty: Faculty } = require('../models/faculty.model');
const Subject = require('../models/subject.model');
const Sclass = require('../models/sclass.model');
const { parseTabularFile } = require('../utils/bulkUploadParser.js');
const { signAuthToken } = require('../utils/authToken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BULK_PASSWORD = process.env.BULK_UPLOAD_DEFAULT_PASSWORD || 'ChangeMe@123';

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const facultyRegister = async (req, res) => {
    console.log("Faculty registration request started...");
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
            return res.status(400).json({ success: false, message: 'name, email, password, and department are required' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const mappedDepartment = await Sclass.findOne({ _id: teachSclass, school });
        if (!mappedDepartment) {
            return res.status(400).json({ success: false, message: 'Selected department mapping is invalid' });
        }

        if (!teachSubject) {
            return res.status(400).json({ success: false, message: 'Course assignment is required for faculty onboarding' });
        }

        const mappedCourse = await Subject.findOne({
            _id: teachSubject,
            sclassName: mappedDepartment._id,
            school,
        });

        if (!mappedCourse) {
            return res.status(400).json({ success: false, message: 'Selected course mapping is invalid' });
        }

        const existingFacultyByEmail = await Faculty.findOne({ email, school });
        if (existingFacultyByEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
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
            assignedCourses: [mappedCourse._id]
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
        const { department } = req.query;
        let query = { school: req.params.id };
        if (department && department !== 'all') {
            query.teachSclass = department;
        }
        let faculty = await Faculty.find(query)
            .populate('teachSubject', 'subName')
            .populate('teachSclass', 'sclassName')
            .populate('assignedCourses', 'subName');
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
            .populate('teachSclass', 'sclassName')
            .populate({
                path: 'assignedCourses',
                populate: { path: 'sclassName', select: 'sclassName' }
            });
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

/* --- MERGED V2 Content --- */
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const bcryptjs = require("bcryptjs");
const User = require('../models/User.model');
const { V2Faculty } = require('../models/faculty.model');
const Department = require('../models/Department.model');
const V2Course = require('../models/Course.model');

// Assign courses to faculty
const assignCourses = async (req, res) => {
    try {
        const { facultyId, courseIds } = req.body;
        if (!facultyId || !courseIds || !Array.isArray(courseIds)) {
            return res.status(400).json({ message: "Faculty ID and course IDs array are required" });
        }

        // Prevent duplicates
        const uniqueCourseIds = [...new Set(courseIds)];

        // Try V1 first
        let faculty = await Faculty.findById(facultyId);
        if (faculty) {
            faculty.assignedCourses = uniqueCourseIds;
            await faculty.save();
            return res.status(200).json({ success: true, message: "Courses assigned successfully", data: faculty });
        }

        // Try V2
        const v2Faculty = await V2Faculty.findById(facultyId);
        if (v2Faculty) {
            v2Faculty.assignedCourses = uniqueCourseIds;
            await v2Faculty.save();
            return res.status(200).json({ success: true, message: "Courses assigned successfully", data: v2Faculty });
        }

        return res.status(404).json({ message: "Faculty not found" });
    } catch (error) {
        console.error("Assign Courses Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch faculty's assigned courses
const getMyCourses = async (req, res) => {
    try {
        const facultyId = (req.user && (req.user.id || req.user._id)) || (req.auth && (req.auth.id || req.auth.sub));
        if (!facultyId) return res.status(401).json({ message: "Unauthorized" });

        // Try V1 (subjects)
        let faculty = await Faculty.findById(facultyId).populate({
            path: 'assignedCourses',
            populate: { path: 'sclassName' }
        });

        if (faculty && faculty.assignedCourses.length > 0) {
            const courses = faculty.assignedCourses.map(c => ({
                _id: c._id,
                name: c.subName,
                code: c.subCode,
                department: c.sclassName?.sclassName || "Unassigned",
                type: 'v1'
            }));
            return res.status(200).json(courses);
        }

        // Try V2 (v2_courses)
        const v2Faculty = await V2Faculty.findOne({ user: facultyId }).populate({
            path: 'assignedCourses',
            populate: { path: 'department' }
        });

        if (v2Faculty && v2Faculty.assignedCourses.length > 0) {
            const courses = v2Faculty.assignedCourses.map(c => ({
                _id: c._id,
                name: c.name,
                code: c.code,
                department: c.department?.name || "Unassigned",
                type: 'v2'
            }));
            return res.status(200).json(courses);
        }

        // Fallback for V1
        if (faculty && faculty.teachSubject) {
            const single = await Subject.findById(faculty.teachSubject).populate('sclassName');
            if (single) {
                return res.status(200).json([{
                    _id: single._id,
                    name: single.subName,
                    code: single.subCode,
                    department: single.sclassName?.sclassName || "Unassigned",
                    type: 'v1'
                }]);
            }
        }

        // Fallback for V2 (Check assignedFaculty in Course)
        if (v2Faculty) {
            const courses = await V2Course.find({ assignedFaculty: v2Faculty._id }).populate('department');
            if (courses.length > 0) {
                return res.status(200).json(courses.map(c => ({
                    _id: c._id,
                    name: c.name,
                    code: c.code,
                    department: c.department?.name || "Unassigned",
                    type: 'v2'
                })));
            }
        }

        return res.status(200).json([]);
    } catch (error) {
        console.error("Get My Courses Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const v1Subjects = await Subject.find().populate("sclassName");
        const v2Courses = await V2Course.find().populate("department");

        const merged = [
            ...v1Subjects.map(s => ({
                _id: s._id,
                name: s.subName,
                code: s.subCode,
                department: s.sclassName?.sclassName || "Unassigned",
                type: 'v1'
            })),
            ...v2Courses.map(c => ({
                _id: c._id,
                name: c.name,
                code: c.code,
                department: c.department?.name || "Unassigned",
                type: 'v2'
            }))
        ];

        res.status(200).json(merged);
    } catch (err) {
        console.error("All Courses Error:", err);
        res.status(500).json({ message: "Error fetching courses" });
    }
};

const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, phone, departmentId, designation } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(400, "Email already exists");

  const department = await Department.findById(departmentId);
  if (!department) throw new ApiError(404, "Department not found");

  const passwordHash = await bcryptjs.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "FACULTY",
  });

  const created = await V2Faculty.create({
    user: user._id,
    phone: phone ? String(phone).trim() : "",
    department: department._id,
    designation: designation ? String(designation).trim() : "",
  });

  const item = await V2Faculty.findById(created._id)
    .populate("user", "name email role isActive")
    .populate("department", "name code");

  res.status(201).json({ item });
});

const listFaculty = asyncHandler(async (_req, res) => {
  const items = await V2Faculty.find()
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("assignedCourses", "name code")
    .sort({ createdAt: -1 });
  res.status(200).json({ items });
});

const getFaculty = asyncHandler(async (req, res) => {
  const item = await V2Faculty.findById(req.params.id)
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate({
      path: "assignedCourses",
      populate: { path: "department", select: "name code" }
    });
  if (!item) throw new ApiError(404, "V2Faculty not found");
  res.status(200).json({ item });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, departmentId, designation, isActive } = req.body;

  const faculty = await V2Faculty.findById(id);
  if (!faculty) throw new ApiError(404, "V2Faculty not found");

  if (departmentId) {
    const dep = await Department.findById(departmentId);
    if (!dep) throw new ApiError(404, "Department not found");
    faculty.department = departmentId;
  }
  if (phone !== undefined) faculty.phone = phone;
  if (designation !== undefined) faculty.designation = designation;

  await faculty.save();

  const userUpdate = {};
  if (name !== undefined) userUpdate.name = name;
  if (email !== undefined) userUpdate.email = String(email).toLowerCase().trim();
  if (isActive !== undefined) userUpdate.isActive = !!isActive;

  if (Object.keys(userUpdate).length) {
    const user = await User.findById(faculty.user);
    if (!user) throw new ApiError(500, "V2Faculty user missing");
    Object.assign(user, userUpdate);
    await user.save();
  }

  const item = await V2Faculty.findById(id).populate("user", "name email role isActive").populate("department", "name code");
  res.status(200).json({ item });
});

const deleteFacultyV2 = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faculty = await V2Faculty.findById(id);
  if (!faculty) throw new ApiError(404, "V2Faculty not found");

  await V2Faculty.findByIdAndDelete(id);
  await User.findByIdAndDelete(faculty.user);
  res.status(200).json({ ok: true });
});

const updateFacultyV1 = async (req, res) => {
    const { id } = req.params;
    console.log("Faculty Update Request:", id, req.body);
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        const result = await Faculty.findByIdAndUpdate(id,
            { $set: req.body },
            { new: true });
        
        if (!result) {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }

        const finalResult = result.toObject();
        delete finalResult.password;
        
        console.log("Faculty Updated Successfully:", id);
        return res.status(200).json({
            success: true,
            data: finalResult
        });
    } catch (error) {
        console.error("Faculty Update Error:", error);
        res.status(500).json({ success: false, message: "Faculty update failed", error: error.message });
    }
}

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
  assignCourses,
  getMyCourses,
  getAllCourses,
  createFaculty,
  listFaculty,
  getFaculty,
  updateFaculty,
  updateFacultyV1,
  deleteFacultyV2: deleteFacultyV2
};
