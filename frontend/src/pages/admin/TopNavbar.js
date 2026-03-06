import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import AccountMenu from '../../components/AccountMenu';
import { useSelector } from 'react-redux';

const TopNavbar = () => {
    const { currentUser } = useSelector(state => state.user);

    return (
        <header className="h-16 sticky top-0 z-50 bg-gradient-to-r from-[#065F46] via-[#065F46] to-[#F59E0B] shadow-md flex items-center justify-between px-8 text-white">
            {/* Left: Logo / Brand */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white shadow-sm backdrop-blur-sm border border-white/30">
                    {currentUser?.schoolName ? currentUser.schoolName.charAt(0) : 'E'}
                </div>
                <span className="font-bold tracking-tight ml-2 md:block">
                    {currentUser?.schoolName || 'EduManage Pro'}
                </span>
            </div>

            {/* Center: Navigation Menu */}
            <nav className="hidden lg:flex items-center h-full gap-1">
                <NavItem to="/Admin/dashboard" label="Home" pathMatchPattern="/Admin/dashboard" exact={true} />
                <NavItem to="/Admin/classes" label="Classes" pathMatchPattern="/Admin/classes" />
                <NavItem to="/Admin/subjects" label="Subjects" pathMatchPattern="/Admin/subjects" />
                <NavItem to="/Admin/teachers" label="Teachers" pathMatchPattern="/Admin/teachers" />
                <NavItem to="/Admin/students" label="Students" pathMatchPattern="/Admin/students" />
                <NavItem to="/Admin/fees" label="Fees" pathMatchPattern="/Admin/fees" />
                <NavItem to="/Admin/notices" label="Notices" pathMatchPattern="/Admin/notices" />
                <NavItem to="/Admin/complains" label="Complaints" pathMatchPattern="/Admin/complains" />
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/20 focus-within:border-white focus-within:bg-white/20 transition-all backdrop-blur-sm">
                    <SearchIcon className="text-white/70" sx={{ fontSize: 18 }} />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-white placeholder-white/60"
                    />
                </div>
                <button className="p-2 relative text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 hidden sm:block">
                    <NotificationsNoneIcon />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-brand shadow-sm"></span>
                </button>
                <div className="pl-2 border-l border-white/20 ml-1 opacity-90">
                    <AccountMenu />
                </div>
            </div>
        </header>
    );
};

const NavItem = ({ to, label, pathMatchPattern, exact }) => {
    const location = useLocation();
    const isActive = exact
        ? location.pathname === to || location.pathname === '/'
        : location.pathname.startsWith(pathMatchPattern) || location.pathname === to;

    return (
        <Link
            to={to}
            className={`
                h-full flex items-center px-4 text-sm font-semibold transition-all duration-200 relative
                ${isActive ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}
            `}
            style={{ textDecoration: 'none' }}
        >
            {label}
            {/* Active Indicator Bar - Absolute pinned to the bottom of the sticky header */}
            {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-t-sm shadow-[0_-2px_8px_rgba(255,255,255,0.4)]"></span>
            )}
            {/* Hover Indicator Bar */}
            {!isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white/30 rounded-t-sm scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200"></span>
            )}
        </Link>
    );
};

export default TopNavbar;
