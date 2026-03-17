const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const bcryptjs = require("bcryptjs");
const User = require("../../models/v2/User");
const Faculty = require("../../models/v2/Faculty");
const Department = require("../../models/v2/Department");

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

  const created = await Faculty.create({
    user: user._id,
    phone: phone ? String(phone).trim() : "",
    department: department._id,
    designation: designation ? String(designation).trim() : "",
  });

  const item = await Faculty.findById(created._id)
    .populate("user", "name email role isActive")
    .populate("department", "name code");

  res.status(201).json({ item });
});

const listFaculty = asyncHandler(async (_req, res) => {
  const items = await Faculty.find()
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .sort({ createdAt: -1 });
  res.status(200).json({ items });
});

const getFaculty = asyncHandler(async (req, res) => {
  const item = await Faculty.findById(req.params.id)
    .populate("user", "name email role isActive")
    .populate("department", "name code");
  if (!item) throw new ApiError(404, "Faculty not found");
  res.status(200).json({ item });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, departmentId, designation, isActive } = req.body;

  const faculty = await Faculty.findById(id);
  if (!faculty) throw new ApiError(404, "Faculty not found");

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
    if (!user) throw new ApiError(500, "Faculty user missing");
    Object.assign(user, userUpdate);
    await user.save();
  }

  const item = await Faculty.findById(id).populate("user", "name email role isActive").populate("department", "name code");
  res.status(200).json({ item });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faculty = await Faculty.findById(id);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  await Faculty.findByIdAndDelete(id);
  await User.findByIdAndDelete(faculty.user);
  res.status(200).json({ ok: true });
});

module.exports = { createFaculty, listFaculty, getFaculty, updateFaculty, deleteFaculty };

