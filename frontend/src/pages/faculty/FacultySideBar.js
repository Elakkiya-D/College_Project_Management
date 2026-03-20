import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useSelector } from 'react-redux';

const FacultySideBar = ({ onNavigate }) => {
    const { currentUser } = useSelector((state) => state.user);
    const departmentName = currentUser?.teachSclass?.sclassName || 'Department';
    const location = useLocation();

    const menuItems = [
        { to: '/Faculty/dashboard', label: 'Home', icon: <HomeIcon /> },
        { to: '/Faculty/class', label: departmentName, icon: <ClassOutlinedIcon /> },
        { to: '/Faculty/addstudent', label: 'Add Student', icon: <PersonAddAltOutlinedIcon /> },
        { to: '/faculty/attendance', label: 'Attendance', icon: <AnnouncementOutlinedIcon /> },
        { to: '/faculty/assignments', label: 'Assignments', icon: <AnnouncementOutlinedIcon /> },
        { to: '/Faculty/complain', label: 'Grievances', icon: <AnnouncementOutlinedIcon /> },
        { to: '/Faculty/profile', label: 'Profile', icon: <AccountCircleOutlinedIcon /> },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white/90 overflow-y-auto w-72 px-4 py-6">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold px-2 mb-4">Faculty</div>
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'hover:bg-white/10 hover:translate-x-1'}
                            `}
                        >
                            <span className={`flex items-center justify-center ${isActive ? 'text-blue-600' : 'text-white/70'}`}>
                                {React.cloneElement(item.icon, { fontSize: 'small' })}
                            </span>
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6">
                <Link
                    to="/logout"
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 transition-all"
                >
                    <ExitToAppIcon fontSize="small" /> Logout
                </Link>
            </div>
        </div>
    );
};

export default FacultySideBar;
