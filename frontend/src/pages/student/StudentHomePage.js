import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import SubjectIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import AttendanceIcon from "@mui/icons-material/EventAvailable";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import DashboardContainer from '../../components/DashboardContainer';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, classID]);

    const numberOfSubjects = Array.isArray(subjectsList) ? subjectsList.length : 0;

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    return (
        <DashboardContainer>
            {/* 1. Page Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Overview</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Welcome back, {currentUser.name}. Your semester metrics are up to date.</p>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard
                    label="Registrations"
                    count={numberOfSubjects}
                    icon={<SubjectIcon className="text-blue-500" fontSize="small" />}
                    helper="Active modules"
                />
                <StatCard
                    label="Tasks & Labs"
                    count={12}
                    icon={<AssignmentIcon className="text-blue-500" fontSize="small" />}
                    helper="Critical deadlines"
                />
                <StatCard
                    label="Attendance"
                    count={Math.round(overallAttendancePercentage)}
                    icon={<AttendanceIcon className="text-green-500" fontSize="small" />}
                    helper="Presence Index"
                    suffix="%"
                />
            </div>

            {/* 3. Main Content: Attendance & Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 h-full">
                    <ContentCard title="Presence Analysis" subtitle="Session attendance distribution.">
                        <div className="flex flex-col items-center justify-center min-h-[350px]">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
                                    <p className="text-xs font-bold text-gray-400">Syncing charts...</p>
                                </div>
                            ) : subjectAttendance.length > 0 ? (
                                <div className="w-full h-[320px]">
                                    <CustomPieChart data={chartData} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                                        <AttendanceIcon className="text-gray-300" fontSize="large" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-gray-900 leading-tight">Board Empty</h4>
                                        <p className="text-xs text-gray-500 font-medium">No session data available for visualization.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ContentCard>
                </div>

                <div className="lg:col-span-7 h-full">
                    <SeeNotice inDashboardWidget={true} />
                </div>
            </div>
        </DashboardContainer>
    )
}

const StatCard = ({ label, count, icon, helper, suffix = "" }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shrink-0 shadow-inner">
            {icon}
        </div>
        <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
            <div className="flex items-baseline gap-1">
                <CountUp
                    start={0}
                    end={count}
                    duration={2}
                    className="text-2xl font-bold text-gray-900"
                />
                {suffix && <span className="text-sm font-bold text-gray-400">{suffix}</span>}
            </div>
            <p className="text-xs text-gray-500 font-medium italic">{helper}</p>
        </div>
    </div>
);

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/20">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

export default StudentHomePage;