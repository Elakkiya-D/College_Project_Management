const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const AttendanceSession = require("../../models/v2/AttendanceSession");
const Course = require("../../models/v2/Course");
const Faculty = require("../../models/v2/Faculty");
const Student = require("../../models/v2/Student");

const createOrUpdateAttendanceSession = asyncHandler(async (req, res) => {
  const { courseId, date, records } = req.body;
  if (!courseId || !date || !Array.isArray(records)) throw new ApiError(400, "courseId, date, records[] are required");
  if (!records.length) throw new ApiError(400, "records cannot be empty");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Faculty identity: for now, require FACULTY role and map by user id
  const faculty = await Faculty.findOne({ user: req.user._id });
  if (!faculty) throw new ApiError(403, "Faculty profile not found");
  if (!course.assignedFaculty || course.assignedFaculty.toString() !== faculty._id.toString()) {
    throw new ApiError(403, "Only the assigned faculty can mark attendance for this course");
  }

  // Validate students
  const studentIds = records.map(r => r.studentId);
  const uniqueStudentIds = [...new Set(studentIds.map(String))];
  if (uniqueStudentIds.length !== studentIds.length) throw new ApiError(400, "Duplicate studentId entries are not allowed");

  const students = await Student.find({ _id: { $in: uniqueStudentIds } }).select("_id department enrolledCourses");
  if (students.length !== uniqueStudentIds.length) throw new ApiError(400, "One or more studentIds are invalid");

  const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
  for (const sid of uniqueStudentIds) {
    const student = studentMap.get(sid);
    const sameDepartment = student.department.toString() === course.department.toString();
    const enrolledInCourse = student.enrolledCourses.some((cid) => cid.toString() === course._id.toString());
    if (!sameDepartment || !enrolledInCourse) {
      throw new ApiError(400, "Attendance can only be marked for students enrolled in this course and department");
    }
  }

  const normalizedRecords = records.map(r => ({
    student: r.studentId,
    status: r.status === "PRESENT" ? "PRESENT" : "ABSENT",
  }));

  const sessionDate = new Date(date);
  if (Number.isNaN(sessionDate.getTime())) throw new ApiError(400, "Invalid date");
  sessionDate.setHours(0, 0, 0, 0);

  const session = await AttendanceSession.findOneAndUpdate(
    { course: course._id, date: sessionDate },
    {
      $set: {
        course: course._id,
        department: course.department,
        date: sessionDate,
        markedBy: faculty._id,
        records: normalizedRecords,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ item: session });
});

const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === "STUDENT") {
    const ownStudentProfile = await Student.findOne({ user: req.user._id }).select("_id");
    if (!ownStudentProfile || ownStudentProfile._id.toString() !== studentId) {
      throw new ApiError(403, "Students can only view their own attendance summary");
    }
  }

  const student = await Student.findById(studentId).populate("enrolledCourses", "name code");
  if (!student) throw new ApiError(404, "Student not found");

  const sessions = await AttendanceSession.find({ course: { $in: student.enrolledCourses } })
    .select("course date records")
    .lean();

  const byCourse = {};
  for (const course of student.enrolledCourses) {
    byCourse[course._id.toString()] = { course, total: 0, present: 0 };
  }

  for (const s of sessions) {
    const cId = s.course.toString();
    const bucket = byCourse[cId];
    if (!bucket) continue;
    bucket.total += 1;
    const rec = (s.records || []).find(r => r.student.toString() === studentId);
    if (rec?.status === "PRESENT") bucket.present += 1;
  }

  const items = Object.values(byCourse).map(b => ({
    course: b.course,
    totalSessions: b.total,
    presentSessions: b.present,
    percentage: b.total ? Math.round((b.present / b.total) * 1000) / 10 : 0,
  }));

  res.status(200).json({ items });
});

module.exports = { createOrUpdateAttendanceSession, getStudentAttendanceSummary };

