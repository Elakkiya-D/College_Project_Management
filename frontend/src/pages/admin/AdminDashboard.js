import { useEffect, useState } from 'react';
import { CssBaseline, Box, Drawer } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Logout from '../Logout';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';
import TopNavbar from './TopNavbar';
import SideBar from './SideBar';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowFees from './feeRelated/ShowFees';
import AddFee from './feeRelated/AddFee';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';

const sidebarWidth = 280;

const AdminDashboard = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location.pathname]);

    const handleSidebarToggle = () => {
        setMobileSidebarOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }} className="font-poppins">
            <CssBaseline />
            <TopNavbar onMenuToggle={handleSidebarToggle} />

            <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
                <Box
                    component="aside"
                    className="hidden lg:block border-r border-slate-200 bg-slate-900"
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        height: 'calc(100vh - 64px)',
                        position: 'sticky',
                        top: 64,
                    }}
                >
                    <SideBar />
                </Box>

                <Drawer
                    variant="temporary"
                    open={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            width: sidebarWidth,
                            top: 64,
                            height: 'calc(100vh - 64px)',
                            borderRight: '1px solid #e2e8f0',
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <div className="h-full bg-slate-900">
                        <SideBar />
                    </div>
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 64px)',
                    }}
                    className="bg-slate-50"
                >
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />

                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        {/* Fees */}
                        <Route path="/Admin/fees" element={<ShowFees />} />
                        <Route path="/Admin/addfee" element={<AddFee />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
}

export default AdminDashboard;