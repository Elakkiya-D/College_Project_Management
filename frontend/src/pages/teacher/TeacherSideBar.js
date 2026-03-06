import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import { useSelector } from 'react-redux';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.teachSclass;

    return (
        <div className="flex flex-col h-screen sticky top-0 bg-gradient-to-b from-[#F59E0B] via-[#F59E0B] to-[#065F46] text-white w-64 overflow-y-auto font-poppins shadow-xl z-20">
            {/* Top: Logo + Portal Title */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 mb-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#F59E0B] font-black text-xl shadow-md">
                    T
                </div>
                <div>
                    <h2 className="text-base font-black tracking-wide leading-tight text-white">Teacher</h2>
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Portal</p>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 flex flex-col px-3 gap-1">
                <div className="text-xs uppercase tracking-wider text-white/60 px-4 mt-6 mb-2">
                    Main Menu
                </div>

                <MenuItem
                    to="/"
                    icon={<HomeIcon />}
                    label="Summary"
                    pathMatchPattern="/Teacher/dashboard"
                    exact={true}
                />
                <MenuItem
                    to="/Teacher/class"
                    icon={<ClassOutlinedIcon />}
                    label={`Class ${sclassName?.sclassName || ''}`}
                    pathMatchPattern="/Teacher/class"
                />
                <MenuItem
                    to="/Teacher/assignments"
                    icon={<AssignmentIcon />}
                    label="Assignments"
                    pathMatchPattern="/Teacher/assignments"
                />
                <MenuItem
                    to="/Teacher/complain"
                    icon={<AnnouncementOutlinedIcon />}
                    label="Grievances"
                    pathMatchPattern="/Teacher/complain"
                />
            </div>

            {/* Account Controls */}
            <div className="flex flex-col px-3 pb-6 border-t border-white/10 pt-4 mt-2 gap-1">
                <div className="text-xs uppercase tracking-wider text-white/60 px-4 mt-2 mb-2">
                    Account Controls
                </div>

                <MenuItem
                    to="/Teacher/profile"
                    icon={<AccountCircleOutlinedIcon />}
                    label="Profile"
                    pathMatchPattern="/Teacher/profile"
                />
                <MenuItem
                    to="/logout"
                    icon={<ExitToAppIcon />}
                    label="Logout"
                    pathMatchPattern="/logout"
                />
            </div>
        </div>
    );
};

const MenuItem = ({ to, icon, label, pathMatchPattern, exact }) => {
    const location = useLocation();

    const isActive = exact
        ? location.pathname === to || location.pathname === pathMatchPattern
        : location.pathname.startsWith(pathMatchPattern) || location.pathname === to;

    return (
        <Link
            to={to}
            className={`
                relative flex items-center gap-3 px-4 py-3 rounded-lg
                transition duration-200 group overflow-hidden mb-1
                ${isActive ? 'bg-white/20 text-white font-medium' : 'text-white/80 hover:bg-white/10 hover:text-white'}
            `}
            style={{ textDecoration: 'none' }}
        >
            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                {React.cloneElement(icon, { style: { fontSize: 20 } })}
            </div>

            <span className="truncate text-sm tracking-wide whitespace-nowrap">
                {label}
            </span>
        </Link>
    );
};

export default TeacherSideBar;