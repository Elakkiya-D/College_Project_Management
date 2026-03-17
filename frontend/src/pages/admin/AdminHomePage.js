import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import CountUp from 'react-countup';
import SeeNotice from '../../components/SeeNotice';
import DashboardContainer from '../../components/DashboardContainer';
import PageHeader from '../../components/PageHeader';
import ContentCard from '../../components/ContentCard';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
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
    const { sclassesList, subjectsList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getSubjectList(adminID, "AllSubjects"));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    const numberOfStudents = Array.isArray(studentsList) ? studentsList.length : 0;
    const numberOfClasses = Array.isArray(sclassesList) ? sclassesList.length : 0;
    const numberOfTeachers = Array.isArray(teachersList) ? teachersList.length : 0;
    const numberOfCourses = Array.isArray(subjectsList) ? subjectsList.length : 0;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <DashboardContainer>
            <PageHeader
                title={`Welcome back, ${currentUser.name}`}
                subtitle={`Today is ${today}. Here's the performance of your institution.`}
                actions={[
                    { label: 'Add Student', icon: <PersonAddAltIcon />, onClick: () => navigate("/Admin/addstudents") },
                    { label: 'Add Department', icon: <DomainAddIcon />, onClick: () => navigate("/Admin/addclass") },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Departments"
                    count={numberOfClasses}
                    icon={<ClassOutlinedIcon fontSize="small" />}
                    trend="Structure is up to date"
                    color="indigo"
                />
                <ModernStatCard
                    title="Faculty"
                    count={numberOfTeachers}
                    icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                    trend="Teaching team status"
                    color="emerald"
                />
                <ModernStatCard
                    title="Courses"
                    count={numberOfCourses}
                    icon={<MenuBookOutlinedIcon fontSize="small" />}
                    trend="Curriculum availability"
                    color="blue"
                />
                <ModernStatCard
                    title="Students"
                    count={numberOfStudents}
                    icon={<PeopleAltOutlinedIcon fontSize="small" />}
                    trend="Enrollment overview"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ModernStatCard
                    title="Fees Collection"
                    count={0}
                    icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                    prefix="₹"
                    trend="Pending calculation"
                    color="amber"
                />
                <ContentCard title="Department Directory" subtitle="Create and manage every department with clear ownership.">
                    <button
                        onClick={() => navigate("/Admin/classes")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        View Departments
                    </button>
                </ContentCard>
                <ContentCard title="Faculty and Courses" subtitle="Assign faculty to courses with strong visibility across modules.">
                    <button
                        onClick={() => navigate("/Admin/teachers")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
                    >
                        Open Faculty Registry
                    </button>
                </ContentCard>
            </div>

            <ContentCard title="Administrative Commands" subtitle="Execution dashboard for frequent management tasks.">
                <div className="flex flex-wrap gap-4">
                    <ActionButton icon={<CampaignIcon />} label="Dispatch Notice" onClick={() => navigate("/Admin/addnotice")} />
                    <ActionButton icon={<ReceiptLongIcon />} label="Ledger Entry (Fees)" onClick={() => navigate("/Admin/addfee")} />
                    <ActionButton icon={<PersonAddAltIcon />} label="Faculty Onboarding" onClick={() => navigate("/Admin/teachers")} />
                </div>
            </ContentCard>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <SeeNotice inDashboardWidget={true} />
                </div>

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
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
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
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm transition-all duration-200"
    >
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        {label}
    </button>
);

export default AdminHomePage;