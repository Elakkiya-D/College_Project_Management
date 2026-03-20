const router = require('express').Router();
const multer = require('multer');

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin.controller');

const { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin } = require('../controllers/admin.controller');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, updateSclass } = require('../controllers/class.controller');
const { complainCreate, complainList, deleteComplain, deleteComplains } = require('../controllers/complain.controller');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice.controller');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    bulkUploadStudents,
    createStudentByFaculty } = require('../controllers/student.controller');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects, updateSubject, getSubjectsByDepartment } = require('../controllers/subject.controller');
const { facultyRegister, facultyLogIn, getFacultyList, getFacultyDetail, deleteFacultyList, deleteFacultyByClass, deleteFaculty, updateFacultySubject, facultyAttendance, bulkUploadFaculty, updateFacultyV1 } = require('../controllers/faculty.controller');
const { forgotPassword, resetPassword } = require('../controllers/auth-password.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Password recovery
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

const requireAdmin = [requireAuth, requireRole('Admin')];
const requireFaculty = [requireAuth, requireRole('Faculty')];

// Bulk upload
router.post('/student/bulk-upload', upload.single('file'), bulkUploadStudents);
router.post('/faculty/bulk-upload', upload.single('file'), bulkUploadFaculty);

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);

router.get("/Admin/:id", requireAdmin, getAdminDetail)
router.delete("/Admin/:id", requireAdmin, deleteAdmin)
router.put("/Admin/:id", requireAdmin, updateAdmin)

// Student

router.post('/StudentReg', requireAdmin, studentRegister);
router.post('/StudentLogin', studentLogIn)
router.post('/student/create', requireFaculty, createStudentByFaculty);

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", requireAdmin, deleteStudents)
router.delete("/StudentsClass/:id", requireAdmin, deleteStudentsByClass)
router.delete("/Student/:id", requireAdmin, deleteStudent)

router.put("/Student/:id", requireAdmin, updateStudent)

router.put('/UpdateExamResult/:id', requireAdmin, updateExamResult)

router.put('/StudentAttendance/:id', requireAdmin, studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', requireAdmin, clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', requireAdmin, clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', requireAdmin, removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', requireAdmin, removeStudentAttendance)

// Faculty

router.post('/FacultyReg', requireAdmin, facultyRegister);
router.post('/FacultyLogin', facultyLogIn)

router.get("/Faculties/:id", requireAdmin, getFacultyList)
router.get("/Faculty/:id", requireAdmin, getFacultyDetail)

router.delete("/Faculties/:id", requireAdmin, deleteFacultyList)
router.delete("/FacultiesClass/:id", requireAdmin, deleteFacultyByClass)
router.delete("/Faculty/:id", requireAdmin, deleteFaculty)

router.put("/FacultySubject", requireAdmin, updateFacultySubject)
router.put("/Faculty/:id", requireAdmin, updateFacultyV1)

router.post('/FacultyAttendance/:id', requireAdmin, facultyAttendance)

// Notice

router.post('/NoticeCreate', requireAdmin, noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", requireAdmin, deleteNotices)
router.delete("/Notice/:id", requireAdmin, deleteNotice)

router.put("/Notice/:id", requireAdmin, updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

router.delete("/Complain/:id", requireAdmin, deleteComplain);
router.delete("/Complains/:id", requireAdmin, deleteComplains);

// Sclass

router.post('/SclassCreate', requireAdmin, sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", requireAdmin, deleteSclasses)
router.delete("/Sclass/:id", requireAdmin, deleteSclass)
router.put("/Sclass/:id", requireAdmin, updateSclass)

// Subject

router.post('/SubjectCreate', requireAdmin, subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", requireAdmin, deleteSubject)
router.delete("/Subjects/:id", requireAdmin, deleteSubjects)
router.delete("/SubjectsClass/:id", requireAdmin, deleteSubjectsByClass)
router.put("/Subject/:id", requireAdmin, updateSubject)
router.get('/courses/by-department/:id', getSubjectsByDepartment);

// Fee Management
const {
    feeCreate,
    feeList,
    getStudentFees,
    deleteFee,
    createFeeReceipt,
    getStudentReceipts,
    getReceiptById,
} = require('../controllers/fee.controller');

// Admin Fee Routes
router.post('/api/admin/fees/create', feeCreate);
router.get('/api/admin/fees/list', feeList);
router.delete('/api/admin/fees/delete/:id', deleteFee);


// Student Fee Routes
router.get('/api/student/fees/:id', getStudentFees);

// Fee Receipt Routes
router.post('/api/fees/create', createFeeReceipt);
router.get('/api/fees/receipt/:receiptId', getReceiptById);
router.get('/api/fees/:studentId', getStudentReceipts);

// Payment & Billing Routes
const { createPaymentIntent, confirmPaymentIntent, handleStripeWebhook } = require('../controllers/payment.controller');
router.post('/api/payment/create-intent', createPaymentIntent);
router.post('/api/payment/confirm', confirmPaymentIntent);

router.post('/api/webhook', handleStripeWebhook);

// New Attendance Routes
const { markAttendance, getStudentAttendance, getFacultyCourses, getCourseStudents, getAttendanceByCourseAndDate } = require('../controllers/attendanceNew.controller');
router.post('/api/attendance', requireAuth, markAttendance);
router.get('/api/attendance/student', requireAuth, getStudentAttendance);
router.get('/api/attendance/student/:studentId', requireAuth, getStudentAttendance);
router.get('/api/attendance/course/:courseId', requireAuth, getAttendanceByCourseAndDate);
router.get('/api/courses/faculty/:facultyId', requireAuth, getFacultyCourses);
router.get('/api/students/by-course/:courseId', requireAuth, getCourseStudents);

module.exports = router;