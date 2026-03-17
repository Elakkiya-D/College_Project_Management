const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const bcryptjs = require("bcryptjs");
const User = require("../../models/v2/User");
const Student = require("../../models/v2/Student");
const Department = require("../../models/v2/Department");
const Course = require("../../models/v2/Course");

const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    registerNumber,
    departmentId,
    enrolledCourseIds = [],
  } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(400, "Email already exists");

  const department = await Department.findById(departmentId);
  if (!department) throw new ApiError(404, "Department not found");

  if (!Array.isArray(enrolledCourseIds)) throw new ApiError(400, "enrolledCourseIds must be an array");
  if (enrolledCourseIds.length) {
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).select("_id department");
    if (courses.length !== enrolledCourseIds.length) throw new ApiError(400, "One or more enrolledCourseIds are invalid");
    const hasCrossDepartmentCourse = courses.some((course) => course.department.toString() !== department._id.toString());
    if (hasCrossDepartmentCourse) throw new ApiError(400, "Student can only enroll in courses from the same department");
  }

  const passwordHash = await bcryptjs.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "STUDENT",
  });

  const created = await Student.create({
    user: user._id,
    registerNumber: String(registerNumber).trim(),
    department: department._id,
    enrolledCourses: enrolledCourseIds,
  });

  const item = await Student.findById(created._id)
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("enrolledCourses", "name code credits");

  res.status(201).json({ item });
});

const listStudents = asyncHandler(async (_req, res) => {
  const items = await Student.find()
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("enrolledCourses", "name code credits")
    .sort({ createdAt: -1 });
  res.status(200).json({ items });
});

const getStudent = asyncHandler(async (req, res) => {
  const item = await Student.findById(req.params.id)
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("enrolledCourses", "name code credits");
  if (!item) throw new ApiError(404, "Student not found");
  res.status(200).json({ item });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, isActive, registerNumber, departmentId, enrolledCourseIds } = req.body;

  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, "Student not found");

  if (registerNumber !== undefined) student.registerNumber = registerNumber;

  if (departmentId) {
    const dep = await Department.findById(departmentId);
    if (!dep) throw new ApiError(404, "Department not found");
    student.department = departmentId;
  }

  const effectiveDepartmentId = departmentId || student.department.toString();

  if (enrolledCourseIds !== undefined) {
    if (!Array.isArray(enrolledCourseIds)) throw new ApiError(400, "enrolledCourseIds must be an array");
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).select("_id department");
    if (courses.length !== enrolledCourseIds.length) throw new ApiError(400, "One or more enrolledCourseIds are invalid");
    const hasCrossDepartmentCourse = courses.some((course) => course.department.toString() !== effectiveDepartmentId.toString());
    if (hasCrossDepartmentCourse) throw new ApiError(400, "Student can only enroll in courses from the same department");
    student.enrolledCourses = enrolledCourseIds;
  }

  await student.save();

  const userUpdate = {};
  if (name !== undefined) userUpdate.name = name;
  if (email !== undefined) userUpdate.email = String(email).toLowerCase().trim();
  if (isActive !== undefined) userUpdate.isActive = !!isActive;

  if (Object.keys(userUpdate).length) {
    const user = await User.findById(student.user);
    if (!user) throw new ApiError(500, "Student user missing");
    Object.assign(user, userUpdate);
    await user.save();
  }

  const item = await Student.findById(id)
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("enrolledCourses", "name code credits");
  res.status(200).json({ item });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, "Student not found");
  await Student.findByIdAndDelete(id);
  await User.findByIdAndDelete(student.user);
  res.status(200).json({ ok: true });
});

module.exports = { createStudent, listStudents, getStudent, updateStudent, deleteStudent };

