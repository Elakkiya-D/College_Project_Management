import React from 'react';
import { useLocation } from 'react-router-dom';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import AccountMenu from '../../components/AccountMenu';
import { useSelector } from 'react-redux';

const sectionTitles = [
    { path: '/Admin/dashboard', label: 'Admin Overview' },
    { path: '/Admin/classes', label: 'Department Management' },
    { path: '/Admin/subjects', label: 'Course Management' },
    { path: '/Admin/teachers', label: 'Faculty Management' },
    { path: '/Admin/students', label: 'Student Management' },
    { path: '/Admin/fees', label: 'Fees and Billing' },
    { path: '/Admin/notices', label: 'Announcements' },
    { path: '/Admin/complains', label: 'Grievances' },
    { path: '/Admin/profile', label: 'Admin Profile' },
];

const TopNavbar = ({ onMenuToggle }) => {
    const { currentUser } = useSelector(state => state.user);
    const location = useLocation();

    const activeSection = sectionTitles.find((item) => location.pathname.startsWith(item.path))?.label || 'Admin Overview';

    return (
        <header className="h-16 sticky top-0 z-50 bg-white border-b border-textDark/10 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    className="lg:hidden h-9 w-9 rounded-lg border border-textDark/10 text-textMedium hover:bg-brand/10 transition-colors flex items-center justify-center"
                    aria-label="Open navigation"
                >
                    <MenuIcon fontSize="small" />
                </button>

                <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
                    {currentUser?.schoolName ? currentUser.schoolName.charAt(0) : 'C'}
                </div>
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-textMedium font-semibold">Control Center</p>
                    <h1 className="text-sm sm:text-base font-semibold text-textDark truncate">{activeSection}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden md:flex items-center bg-background px-3 py-1.5 rounded-lg border border-textDark/10 focus-within:border-brand focus-within:bg-white transition-all">
                    <SearchIcon className="text-textMedium" sx={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Search departments, faculty, courses..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-48 lg:w-64 text-textDark placeholder-textMedium"
                    />
                </div>

                <button className="p-2 relative text-textMedium hover:text-brand transition-colors rounded-lg hover:bg-brand/10 hidden sm:block" aria-label="Notifications">
                    <NotificationsNoneIcon />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white shadow-sm"></span>
                </button>

                <div className="pl-2 border-l border-textDark/10 ml-1">
                    <AccountMenu />
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
