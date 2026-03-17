const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const Result = require("../../models/v2/Result");
const Student = require("../../models/v2/Student");
const Course = require("../../models/v2/Course");
const Faculty = require("../../models/v2/Faculty");
const { computeGrade } = require("../../utils/grade");

const upsertResult = asyncHandler(async (req, res) => {
  const { studentId, courseId, marks } = req.body;
  if (!studentId || !courseId || marks === undefined) throw new ApiError(400, "studentId, courseId, marks are required");

  const numericMarks = Number(marks);
  if (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > 100) {
    throw new ApiError(400, "marks must be a number between 0 and 100");
  }

  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const faculty = await Faculty.findOne({ user: req.user._id });
  if (!faculty) throw new ApiError(403, "Faculty profile not found");
  if (!course.assignedFaculty || course.assignedFaculty.toString() !== faculty._id.toString()) {
    throw new ApiError(403, "Only the assigned faculty can enter marks for this course");
  }

  const enrolled = student.enrolledCourses.some((cid) => cid.toString() === course._id.toString());
  if (!enrolled) throw new ApiError(400, "Student is not enrolled in this course");

  const grade = computeGrade(numericMarks);

  const item = await Result.findOneAndUpdate(
    { student: student._id, course: course._id },
    { $set: { marks: numericMarks, grade } },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ item });
});

const listStudentResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === "STUDENT") {
    const ownStudentProfile = await Student.findOne({ user: req.user._id }).select("_id");
    if (!ownStudentProfile || ownStudentProfile._id.toString() !== studentId) {
      throw new ApiError(403, "Students can only view their own results");
    }
  }

  const items = await Result.find({ student: studentId }).populate("course", "name code credits").sort({ createdAt: -1 });
  res.status(200).json({ items });
});

module.exports = { upsertResult, listStudentResults };

