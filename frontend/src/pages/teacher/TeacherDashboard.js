import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TeacherSideBar from './TeacherSideBar';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherViewStudent from './TeacherViewStudent';
import TeacherAssignments from './TeacherAssignments';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';

const TeacherDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Teacher"));
    }, [dispatch, currentUser._id]);

    return (
        <div className="flex min-h-screen bg-gray-50 font-poppins">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar List Wrapper */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <TeacherSideBar />

                {/* Mobile Close Button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white lg:hidden bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all font-bold"
                >
                    <CloseIcon />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Desktop and Mobile Top Header */}
                <header className="bg-gradient-to-r from-[#065F46] via-[#065F46] to-[#F59E0B] shadow-md h-16 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-all lg:hidden"
                        >
                            <MenuIcon />
                        </button>
                        <h1 className="font-semibold text-white tracking-wide lg:hidden text-lg">TEACHER PORTAL</h1>
                        <h1 className="font-semibold text-white tracking-wide hidden lg:block text-lg">Dashboard</h1>
                    </div>
                    <AccountMenu lightTheme={true} />
                </header>

                <main className="flex-1 overflow-auto bg-gray-50 relative">
                    <div className="min-h-full">
                        <Routes>
                            <Route path="/" element={<TeacherHomePage />} />
                            <Route path='*' element={<Navigate to="/" />} />
                            <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                            <Route path="/Teacher/profile" element={<TeacherProfile />} />

                            <Route path="/Teacher/complain" element={<TeacherComplain />} />
                            <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                            <Route path="/Teacher/assignments" element={<TeacherAssignments />} />
                            <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />

                            <Route path="/Teacher/class/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                            <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                            <Route path="/logout" element={<Logout />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default TeacherDashboard;