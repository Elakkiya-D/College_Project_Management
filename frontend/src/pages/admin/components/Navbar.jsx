import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AccountMenu from '../../../components/AccountMenu';

const sectionTitles = [
    { path: '/Admin/dashboard', label: 'Dashboard Overview' },
    { path: '/Admin/classes', label: 'Department Directory' },
    { path: '/Admin/subjects', label: 'Course Catalog' },
    { path: '/Admin/teachers', label: 'Faculty Registry' },
    { path: '/Admin/students', label: 'Student Records' },
    { path: '/Admin/fees', label: 'Fee Management' },
    { path: '/Admin/notices', label: 'Notices' },
    { path: '/Admin/complains', label: 'Grievances' },
    { path: '/Admin/profile', label: 'Admin Profile' },
];

const Navbar = ({ onMenuToggle }) => {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();

    const activeSection = sectionTitles.find((item) => location.pathname.startsWith(item.path))?.label || 'Dashboard Overview';

    return (
        <header className="h-16 sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-textDark/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    className="lg:hidden h-10 w-10 rounded-xl border border-textDark/10 text-textMedium hover:bg-brand/10 transition-colors flex items-center justify-center"
                    aria-label="Toggle sidebar"
                >
                    <MenuIcon fontSize="small" />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-3 min-w-0"
                >
                    <div className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center font-semibold shadow-sm">
                        {currentUser?.schoolName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-textMedium font-semibold">Admin Panel</p>
                        <h1 className="text-sm sm:text-base font-semibold text-textDark truncate">{activeSection}</h1>
                    </div>
                </motion.div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden md:flex items-center h-10 px-3 rounded-xl border border-textDark/10 bg-background focus-within:bg-white focus-within:border-brand transition-colors">
                    <SearchRoundedIcon className="text-textMedium" sx={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Search department, faculty, course"
                        className="ml-2 w-44 lg:w-60 bg-transparent outline-none text-sm text-textDark placeholder-textMedium"
                    />
                </div>

                <button
                    type="button"
                    className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-textDark/10 text-textMedium hover:text-brand hover:bg-brand/10 transition-colors relative"
                    aria-label="Notifications"
                >
                    <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
                </button>

                <div className="pl-3 border-l border-textDark/10">
                    <AccountMenu />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
