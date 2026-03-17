import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const navigationItems = [
    { to: '/Admin/dashboard', pathMatchPattern: '/Admin/dashboard', label: 'Overview', icon: <HomeRoundedIcon /> },
    { to: '/Admin/classes', pathMatchPattern: '/Admin/classes', label: 'Departments', icon: <AccountBalanceRoundedIcon /> },
    { to: '/Admin/subjects', pathMatchPattern: '/Admin/subjects', label: 'Courses', icon: <MenuBookRoundedIcon /> },
    { to: '/Admin/teachers', pathMatchPattern: '/Admin/teachers', label: 'Faculty', icon: <SchoolRoundedIcon /> },
    { to: '/Admin/students', pathMatchPattern: '/Admin/students', label: 'Students', icon: <GroupsRoundedIcon /> },
    { to: '/Admin/fees', pathMatchPattern: '/Admin/fees', label: 'Fees', icon: <PaymentsRoundedIcon /> },
    { to: '/Admin/notices', pathMatchPattern: '/Admin/notices', label: 'Notices', icon: <CampaignRoundedIcon /> },
    { to: '/Admin/complains', pathMatchPattern: '/Admin/complains', label: 'Grievances', icon: <ReportGmailerrorredRoundedIcon /> },
];

const accountItems = [
    { to: '/Admin/profile', pathMatchPattern: '/Admin/profile', label: 'Profile', icon: <AccountCircleRoundedIcon /> },
    { to: '/logout', pathMatchPattern: '/logout', label: 'Logout', icon: <LogoutRoundedIcon /> },
];

const Sidebar = () => {
    return (
        <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-100 px-4 py-6">
            <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400 px-3 mb-4">Navigation</p>

            <div className="space-y-2">
                {navigationItems.map((item) => (
                    <NavigationItem key={item.to} {...item} />
                ))}
            </div>

            <div className="h-px bg-slate-700/60 my-6" />

            <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400 px-3 mb-4">Account</p>
            <div className="space-y-2">
                {accountItems.map((item) => (
                    <NavigationItem key={item.to} {...item} />
                ))}
            </div>
        </div>
    );
};

const NavigationItem = ({ to, pathMatchPattern, label, icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(pathMatchPattern);

    return (
        <Link to={to} style={{ textDecoration: 'none' }}>
            <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`h-11 rounded-xl px-3 flex items-center gap-3 border ${isActive
                    ? 'bg-slate-100 text-slate-900 border-slate-100 shadow-md'
                    : 'bg-transparent text-slate-200 border-transparent hover:bg-slate-800/70'
                    }`}
            >
                <span className={`${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                    {React.cloneElement(icon, { sx: { fontSize: 20 } })}
                </span>
                <span className="text-sm font-medium">{label}</span>
            </motion.div>
        </Link>
    );
};

export default Sidebar;
