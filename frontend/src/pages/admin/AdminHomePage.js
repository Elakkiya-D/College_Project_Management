import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import CountUp from 'react-countup';
import SeeNotice from '../../components/SeeNotice';
import DashboardContainer from '../../components/DashboardContainer';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    const numberOfStudents = Array.isArray(studentsList) ? studentsList.length : 0;
    const numberOfClasses = Array.isArray(sclassesList) ? sclassesList.length : 0;
    const numberOfTeachers = Array.isArray(teachersList) ? teachersList.length : 0;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <DashboardContainer>
            {/* SECTION 1 - Welcome Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {currentUser.name} 👋</h1>
                <p className="text-sm text-gray-500 font-medium">It's {today}. Here's what's happening in your institution today.</p>
            </div>

            {/* SECTION 2 - Statistics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Total Students"
                    count={numberOfStudents}
                    icon={<PeopleAltOutlinedIcon fontSize="small" />}
                    trend="+12% from last month"
                    color="blue"
                />
                <ModernStatCard
                    title="Active Classes"
                    count={numberOfClasses}
                    icon={<ClassOutlinedIcon fontSize="small" />}
                    trend="Steady"
                    color="indigo"
                />
                <ModernStatCard
                    title="Faculty Members"
                    count={numberOfTeachers}
                    icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                    trend="+2 new hires"
                    color="emerald"
                />
                <ModernStatCard
                    title="Fees Collection"
                    count={0}
                    icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                    prefix="₹"
                    trend="Pending calculation"
                    color="amber"
                />
            </div>

            {/* SECTION 3 - Quick Action Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
                    <p className="text-sm text-gray-500">Frequently used administrative tasks.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <ActionButton icon={<PersonAddAltIcon />} label="Add Student" onClick={() => navigate("/Admin/addstudents")} />
                    <ActionButton icon={<DomainAddIcon />} label="Add Class" onClick={() => navigate("/Admin/addclass")} />
                    <ActionButton icon={<CampaignIcon />} label="Create Notice" onClick={() => navigate("/Admin/addnotice")} />
                    <ActionButton icon={<ReceiptLongIcon />} label="Assign Fees" onClick={() => navigate("/Admin/addfee")} />
                </div>
            </div>

            {/* SECTION 4 - Live Activity / Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Recent Notices */}
                <div className="lg:col-span-8">
                    <SeeNotice inDashboardWidget={true} />
                </div>

                {/* RIGHT: Recent Activities / Logs */}
                <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                        <HistoryIcon className="text-gray-400" fontSize="small" />
                        <h3 className="text-base font-semibold text-slate-800">System Logs</h3>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center text-center h-64 space-y-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                            <HistoryIcon className="text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No recent activities properly tracked yet.</p>
                    </div>
                </div>
            </div>
        </DashboardContainer>
    );
};

const ModernStatCard = ({ title, count, icon, prefix = "", trend, color }) => {
    const colorClasses = {
        blue: "text-brand bg-surface border-yellow-100",
        indigo: "text-brand bg-surface border-yellow-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-40 group">
            <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold text-gray-500">{title}</h4>
                <div className={`p-2 rounded-xl border transition-colors ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="space-y-1 mt-2">
                <CountUp
                    start={0}
                    end={count}
                    duration={2.5}
                    prefix={prefix}
                    className="text-3xl font-bold text-slate-800"
                />
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <TrendingUpIcon sx={{ fontSize: 14 }} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    {trend}
                </div>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:text-brand hover:border-yellow-200 hover:bg-surface hover:shadow-sm transition-all duration-200"
    >
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        {label}
    </button>
);

export default AdminHomePage;