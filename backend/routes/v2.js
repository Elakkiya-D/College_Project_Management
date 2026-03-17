const router = require("express").Router();

const { requireAuth, requireRole } = require("../middleware/v2/auth");
const { validateObjectIdParam, validateObjectIdBody } = require("../middleware/v2/validate");
const { requireFields, validateEmailField, validateNumberField, validateArrayField } = require("../middleware/v2/requestValidation");

const { signup, login, me } = require("../controllers/v2/authController");
const { listDepartments, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/v2/departmentController");
const { createFaculty, listFaculty, getFaculty, updateFaculty, deleteFaculty } = require("../controllers/v2/facultyController");
const { listCourses, getCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/v2/courseController");
const { createStudent, listStudents, getStudent, updateStudent, deleteStudent } = require("../controllers/v2/studentController");
const { createOrUpdateAttendanceSession, getStudentAttendanceSummary } = require("../controllers/v2/attendanceController");
const { upsertResult, listStudentResults } = require("../controllers/v2/resultController");

// Auth (public)
router.post("/auth/signup", requireFields(["name", "email", "password", "role"]), validateEmailField("email"), signup);
router.post("/auth/login", requireFields(["email", "password"]), validateEmailField("email"), login);

// Auth (protected)
router.get("/auth/me", requireAuth, requireRole("ADMIN", "FACULTY", "STUDENT"), me);

// Department (ADMIN)
router.get("/departments", requireAuth, requireRole("ADMIN"), listDepartments);
router.post("/departments", requireAuth, requireRole("ADMIN"), requireFields(["name", "code"]), createDepartment);
router.put("/departments/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), updateDepartment);
router.delete("/departments/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), deleteDepartment);

// Faculty (ADMIN)
router.get("/faculty", requireAuth, requireRole("ADMIN"), listFaculty);
router.post(
	"/faculty",
	requireAuth,
	requireRole("ADMIN"),
	requireFields(["name", "email", "password", "departmentId"]),
	validateEmailField("email"),
	validateObjectIdBody("departmentId", { required: true }),
	createFaculty
);
router.get("/faculty/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), getFaculty);
router.put(
	"/faculty/:id",
	requireAuth,
	requireRole("ADMIN"),
	validateObjectIdParam("id"),
	validateEmailField("email"),
	validateObjectIdBody("departmentId"),
	updateFaculty
);
router.delete("/faculty/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), deleteFaculty);

// Course (ADMIN)
router.get("/courses", requireAuth, requireRole("ADMIN"), listCourses);
router.get("/courses/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), getCourse);
router.post(
	"/courses",
	requireAuth,
	requireRole("ADMIN"),
	requireFields(["name", "code", "credits", "departmentId"]),
	validateNumberField("credits", { min: 0, max: 30 }),
	validateObjectIdBody("departmentId", { required: true }),
	validateObjectIdBody("assignedFacultyId"),
	createCourse
);
router.put(
	"/courses/:id",
	requireAuth,
	requireRole("ADMIN"),
	validateObjectIdParam("id"),
	validateNumberField("credits", { min: 0, max: 30 }),
	validateObjectIdBody("departmentId"),
	validateObjectIdBody("assignedFacultyId"),
	updateCourse
);
router.delete("/courses/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), deleteCourse);

// Student (ADMIN)
router.get("/students", requireAuth, requireRole("ADMIN"), listStudents);
router.post(
	"/students",
	requireAuth,
	requireRole("ADMIN"),
	requireFields(["name", "email", "password", "registerNumber", "departmentId"]),
	validateEmailField("email"),
	validateObjectIdBody("departmentId", { required: true }),
	validateArrayField("enrolledCourseIds"),
	validateObjectIdBody("enrolledCourseIds", { isArray: true }),
	createStudent
);
router.get("/students/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), getStudent);
router.put(
	"/students/:id",
	requireAuth,
	requireRole("ADMIN"),
	validateObjectIdParam("id"),
	validateEmailField("email"),
	validateObjectIdBody("departmentId"),
	validateArrayField("enrolledCourseIds"),
	validateObjectIdBody("enrolledCourseIds", { isArray: true }),
	updateStudent
);
router.delete("/students/:id", requireAuth, requireRole("ADMIN"), validateObjectIdParam("id"), deleteStudent);

// Attendance (FACULTY)
router.post(
	"/attendance/sessions",
	requireAuth,
	requireRole("FACULTY"),
	requireFields(["courseId", "date", "records"]),
	validateObjectIdBody("courseId", { required: true }),
	validateArrayField("records", { required: true }),
	createOrUpdateAttendanceSession
);
router.get(
	"/attendance/students/:studentId/summary",
	requireAuth,
	requireRole("ADMIN", "FACULTY", "STUDENT"),
	validateObjectIdParam("studentId"),
	getStudentAttendanceSummary
);

// Results (FACULTY)
router.post(
	"/results",
	requireAuth,
	requireRole("FACULTY"),
	requireFields(["studentId", "courseId", "marks"]),
	validateObjectIdBody("studentId", { required: true }),
	validateObjectIdBody("courseId", { required: true }),
	validateNumberField("marks", { min: 0, max: 100 }),
	upsertResult
);
router.get(
	"/results/students/:studentId",
	requireAuth,
	requireRole("ADMIN", "FACULTY", "STUDENT"),
	validateObjectIdParam("studentId"),
	listStudentResults
);

module.exports = router;

