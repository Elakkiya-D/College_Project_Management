import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const SideBar = () => {
    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#F59E0B] via-[#F59E0B] to-[#065F46] text-white overflow-y-auto w-full min-h-[calc(100vh-64px)] pt-2 pb-4">

            {/* Main Navigation */}
            <div className="flex-1 flex flex-col gap-1 px-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 px-4 mt-2 mb-2 font-black">
                    Main Menu
                </div>

                <MenuItem
                    to="/"
                    icon={<HomeIcon />}
                    label="Home"
                    pathMatchPattern="/Admin/dashboard"
                    exact={true}
                />
                <MenuItem
                    to="/Admin/classes"
                    icon={<ClassOutlinedIcon />}
                    label="Classes"
                    pathMatchPattern="/Admin/classes"
                />
                <MenuItem
                    to="/Admin/subjects"
                    icon={<AssignmentIcon />}
                    label="Subjects"
                    pathMatchPattern="/Admin/subjects"
                />
                <MenuItem
                    to="/Admin/teachers"
                    icon={<SupervisorAccountOutlinedIcon />}
                    label="Teachers"
                    pathMatchPattern="/Admin/teachers"
                />
                <MenuItem
                    to="/Admin/students"
                    icon={<PersonOutlineIcon />}
                    label="Students"
                    pathMatchPattern="/Admin/students"
                />
                <MenuItem
                    to="/Admin/fees"
                    icon={<AttachMoneyIcon />}
                    label="Fees"
                    pathMatchPattern="/Admin/fees"
                />
                <MenuItem
                    to="/Admin/notices"
                    icon={<AnnouncementOutlinedIcon />}
                    label="Notices"
                    pathMatchPattern="/Admin/notices"
                />
                <MenuItem
                    to="/Admin/complains"
                    icon={<ReportIcon />}
                    label="Complains"
                    pathMatchPattern="/Admin/complains"
                />
            </div>

            {/* Divider */}
            <div className="px-5 py-4">
                <div className="h-px w-full bg-white/10" />
            </div>

            {/* Account Controls */}
            <div className="flex flex-col gap-1 px-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 px-4 mt-2 mb-2 font-black">
                    Account
                </div>

                <MenuItem
                    to="/Admin/profile"
                    icon={<AccountCircleOutlinedIcon />}
                    label="Profile"
                    pathMatchPattern="/Admin/profile"
                />
                <MenuItem
                    to="/logout"
                    icon={<ExitToAppIcon />}
                    label="Logout"
                    pathMatchPattern="/logout"
                />
            </div>
        </div>
    )
}

const MenuItem = ({ to, icon, label, pathMatchPattern, exact }) => {
    const location = useLocation();

    const isActive = exact
        ? location.pathname === to || location.pathname === pathMatchPattern
        : location.pathname.startsWith(pathMatchPattern) || location.pathname === to;

    return (
        <Link
            to={to}
            className={`
                relative flex items-center gap-4 px-4 py-2 h-11 rounded-lg
                transition-all duration-200 ease-in-out group overflow-hidden
                ${isActive ? 'bg-white/10 text-white font-medium' : 'hover:bg-white/5 hover:translate-x-1 hover:text-white'}
            `}
            style={{ textDecoration: 'none' }} // Override MUI Link default if bleeding
        >
            {/* Active Left Indicator Bar */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-md shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}

            {/* Icon Center - 20px bounded */}
            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                {React.cloneElement(icon, { style: { fontSize: 20 } })}
            </div>

            {/* Label Base - Nowrap to handle Drawer shrinking smoothly */}
            <span className="truncate text-[14px] leading-none tracking-wide pt-0.5 whitespace-nowrap">
                {label}
            </span>
        </Link>
    );
};

export default SideBar;
