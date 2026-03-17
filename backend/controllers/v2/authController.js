const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const User = require("../../models/v2/User");
const Department = require("../../models/v2/Department");
const Faculty = require("../../models/v2/Faculty");
const Student = require("../../models/v2/Student");
const Course = require("../../models/v2/Course");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, departmentId, phone, designation, registerNumber, enrolledCourseIds } = req.body;
  if (!name || !email || !password || !role) throw new ApiError(400, "name, email, password, role are required");
  if (String(password).length < 6) throw new ApiError(400, "password must be at least 6 characters");

  if (!["ADMIN", "FACULTY", "STUDENT"].includes(role)) throw new ApiError(400, "Invalid role");

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(400, "Email already exists");

  const passwordHash = await bcryptjs.hash(password, 10);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role });

  // Optional profile creation
  if (role === "FACULTY" || role === "STUDENT") {
    if (!departmentId) throw new ApiError(400, "departmentId is required");
    const department = await Department.findById(departmentId);
    if (!department) throw new ApiError(404, "Department not found");
  }

  if (role === "FACULTY") {
    await Faculty.create({
      user: user._id,
      department: departmentId,
      phone: phone || "",
      designation: designation || "",
    });
  }

  if (role === "STUDENT") {
    if (!registerNumber) throw new ApiError(400, "registerNumber is required");

    const safeEnrolledCourseIds = Array.isArray(enrolledCourseIds) ? enrolledCourseIds : [];
    if (safeEnrolledCourseIds.length) {
      const courses = await Course.find({ _id: { $in: safeEnrolledCourseIds } }).select("_id department");
      if (courses.length !== safeEnrolledCourseIds.length) throw new ApiError(400, "One or more enrolledCourseIds are invalid");
      const hasCrossDepartmentCourse = courses.some((course) => course.department.toString() !== departmentId.toString());
      if (hasCrossDepartmentCourse) throw new ApiError(400, "Student can only enroll in courses from the same department");
    }

    await Student.create({
      user: user._id,
      department: departmentId,
      registerNumber,
      enrolledCourses: safeEnrolledCourseIds,
    });
  }

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials");

  const ok = await bcryptjs.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = signToken(user);
  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

module.exports = { signup, login, me };

