const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const Department = require("../../models/v2/Department");

const listDepartments = asyncHandler(async (_req, res) => {
  const items = await Department.find().sort({ name: 1 });
  res.status(200).json({ items });
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) throw new ApiError(400, "name and code are required");
  const department = await Department.create({ name, code, description });
  res.status(201).json({ item: department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, description } = req.body;
  const updated = await Department.findByIdAndUpdate(
    id,
    { $set: { ...(name !== undefined ? { name } : {}), ...(code !== undefined ? { code } : {}), ...(description !== undefined ? { description } : {}) } },
    { new: true, runValidators: true }
  );
  if (!updated) throw new ApiError(404, "Department not found");
  res.status(200).json({ item: updated });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Department.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Department not found");
  res.status(200).json({ ok: true });
});

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };

