import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FacultySideBar from './FacultySideBar';
import FacultyHomePage from './FacultyHomePage';
import FacultyProfile from './FacultyProfile';
import FacultyClassDetails from './FacultyClassDetails';
import FacultyComplain from './FacultyComplain';
import FacultyViewStudent from './FacultyViewStudent';
import FacultyAddStudent from './FacultyAddStudent';
import FacultyAttendance from './FacultyAttendance';
import FacultyAssignments from './FacultyAssignments';
import FacultyMaterials from './FacultyMaterials';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';

const FacultyDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 font-poppins">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <FacultySideBar onNavigate={() => setSidebarOpen(false)} />

                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white lg:hidden bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all font-bold"
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-100 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all lg:hidden"
                        >
                            <MenuIcon />
                        </button>
                        <h1 className="font-semibold text-gray-900 tracking-wide lg:hidden text-lg">FACULTY PORTAL</h1>
                        <h1 className="font-semibold text-gray-900 tracking-wide hidden lg:block text-lg">Dashboard</h1>
                    </div>
                    <AccountMenu />
                </header>

                <main className="flex-1 overflow-auto bg-gray-50 relative">
                    <div className="min-h-full">
                        <Routes>
                            <Route path="/" element={<FacultyHomePage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                            <Route path="/Faculty/dashboard" element={<FacultyHomePage />} />
                            <Route path="/Faculty/profile" element={<FacultyProfile />} />
                            <Route path="/faculty/attendance" element={<FacultyAttendance />} />
                            <Route path="/Faculty/attendance" element={<FacultyAttendance />} />
                            <Route path="/Faculty/complain" element={<FacultyComplain />} />
                            <Route path="/Faculty/class" element={<FacultyClassDetails />} />
                            <Route path="/Faculty/class/student/:id" element={<FacultyViewStudent />} />
                            <Route path="/Faculty/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />
                            <Route path="/Faculty/addstudent" element={<FacultyAddStudent />} />
                            <Route path="/faculty/assignments" element={<FacultyAssignments />} />
                            <Route path="/Faculty/assignments" element={<FacultyAssignments />} />
                            <Route path="/faculty/materials" element={<FacultyMaterials />} />
                            <Route path="/Faculty/materials" element={<FacultyMaterials />} />
                            <Route path="/logout" element={<Logout />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FacultyDashboard;
