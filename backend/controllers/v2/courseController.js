const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const Course = require("../../models/v2/Course");
const Department = require("../../models/v2/Department");
const Faculty = require("../../models/v2/Faculty");

const listCourses = asyncHandler(async (_req, res) => {
  const items = await Course.find()
    .populate("department", "name code")
    .populate({ path: "assignedFaculty", populate: { path: "user", select: "name email" } })
    .sort({ createdAt: -1 });
  res.status(200).json({ items });
});

const getCourse = asyncHandler(async (req, res) => {
  const item = await Course.findById(req.params.id)
    .populate("department", "name code")
    .populate({ path: "assignedFaculty", populate: { path: "user", select: "name email" } });
  if (!item) throw new ApiError(404, "Course not found");
  res.status(200).json({ item });
});

const createCourse = asyncHandler(async (req, res) => {
  const { name, code, credits, departmentId, assignedFacultyId } = req.body;
  if (!name || !code || credits === undefined || !departmentId) throw new ApiError(400, "name, code, credits, departmentId are required");

  const numericCredits = Number(credits);
  if (!Number.isFinite(numericCredits) || numericCredits < 0 || numericCredits > 30) {
    throw new ApiError(400, "credits must be between 0 and 30");
  }

  const dep = await Department.findById(departmentId);
  if (!dep) throw new ApiError(404, "Department not found");

  let faculty = null;
  if (assignedFacultyId) {
    faculty = await Faculty.findById(assignedFacultyId);
    if (!faculty) throw new ApiError(404, "Faculty not found");
    if (faculty.department.toString() !== dep._id.toString()) {
      throw new ApiError(400, "Assigned faculty must belong to the selected department");
    }
  }

  const course = await Course.create({
    name,
    code,
    credits: numericCredits,
    department: departmentId,
    assignedFaculty: faculty ? faculty._id : null,
  });

  res.status(201).json({ item: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, credits, departmentId, assignedFacultyId } = req.body;

  const course = await Course.findById(id);
  if (!course) throw new ApiError(404, "Course not found");

  if (departmentId) {
    const dep = await Department.findById(departmentId);
    if (!dep) throw new ApiError(404, "Department not found");
    course.department = departmentId;

    if (course.assignedFaculty) {
      const assignedFaculty = await Faculty.findById(course.assignedFaculty).select("department");
      if (assignedFaculty && assignedFaculty.department.toString() !== departmentId.toString()) {
        throw new ApiError(400, "Assigned faculty department must match course department");
      }
    }
  }
  if (assignedFacultyId !== undefined) {
    if (assignedFacultyId === null || assignedFacultyId === "") {
      course.assignedFaculty = null;
    } else {
      const faculty = await Faculty.findById(assignedFacultyId);
      if (!faculty) throw new ApiError(404, "Faculty not found");
      if (faculty.department.toString() !== course.department.toString()) {
        throw new ApiError(400, "Assigned faculty must belong to the course department");
      }
      course.assignedFaculty = faculty._id;
    }
  }
  if (name !== undefined) course.name = name;
  if (code !== undefined) course.code = code;
  if (credits !== undefined) {
    const numericCredits = Number(credits);
    if (!Number.isFinite(numericCredits) || numericCredits < 0 || numericCredits > 30) {
      throw new ApiError(400, "credits must be between 0 and 30");
    }
    course.credits = numericCredits;
  }

  await course.save();
  const item = await Course.findById(id)
    .populate("department", "name code")
    .populate({ path: "assignedFaculty", populate: { path: "user", select: "name email" } });
  res.status(200).json({ item });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Course not found");
  res.status(200).json({ ok: true });
});

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };

