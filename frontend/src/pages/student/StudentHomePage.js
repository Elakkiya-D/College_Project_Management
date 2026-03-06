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
import axios from 'axios';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [numberOfAssignments, setNumberOfAssignments] = useState(0);

    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getSubjectList(classID, "ClassSubjects"));

        const fetchAssignmentsCount = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/AssignmentList/${classID}`);
                if (Array.isArray(res.data)) {
                    setNumberOfAssignments(res.data.length);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAssignmentsCount();
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Academic Overview</h1>
                    <p className="text-sm text-gray-500">Welcome back, {currentUser.name}. Here is your progress report.</p>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1 md:col-span-1 xl:col-span-1">
                    <StatCard
                        label="Enrolled Subjects"
                        count={numberOfSubjects}
                        icon={<SubjectIcon className="text-brand w-5 h-5" />}
                        helper="Courses registered"
                    />
                </div>
                <div className="col-span-1 md:col-span-1 xl:col-span-1">
                    <StatCard
                        label="Upcoming Assignments"
                        count={numberOfAssignments}
                        icon={<AssignmentIcon className="text-brand w-5 h-5" />}
                        helper="Submission pending"
                    />
                </div>
                <div className="col-span-1 md:col-span-1 xl:col-span-1">
                    <StatCard
                        label="Attendance Score"
                        count={Math.round(overallAttendancePercentage)}
                        icon={<AttendanceIcon className="text-brand w-5 h-5" />}
                        helper="Percentage avg."
                        suffix="%"
                    />
                </div>
            </div>

            {/* 3. Main Content: Attendance & Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Attendance Pie Chart (5 cols) */}
                <div className="col-span-12 lg:col-span-5">
                    <DashboardCard title="Attendance Analysis" subtitle="Overview of your presence across all sessions.">
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            {loading ? (
                                <div className="animate-pulse text-brand font-bold">Analyzing data...</div>
                            ) : subjectAttendance.length > 0 ? (
                                <div className="w-full h-[300px]">
                                    <CustomPieChart data={chartData} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                        <AttendanceIcon className="text-slate-300" fontSize="large" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-700 leading-tight">No Attendance Found</h4>
                                        <p className="text-sm font-medium text-slate-400">Records for the current month will appear here once faculty updates the registry.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* Right: Institutional Notices (7 cols) */}
                <div className="col-span-12 lg:col-span-7">
                    <SeeNotice inDashboardWidget={true} />
                </div>
            </div>
        </DashboardContainer>
    )
}

/* Internal Dashboard Components */

const StatCard = ({ label, count, icon, helper, suffix = "" }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all duration-200">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform duration-200 shrink-0">
            {icon}
        </div>
        <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <div className="flex items-baseline gap-1">
                <CountUp
                    start={0}
                    end={count}
                    duration={2.5}
                    className="text-2xl font-bold text-gray-900 tracking-tight"
                />
                {suffix && <span className="text-lg font-bold text-gray-500">{suffix}</span>}
            </div>
            <p className="text-sm text-gray-500">{helper}</p>
        </div>
    </div>
);

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-all duration-200">
        <div className="mb-6 space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

export default StudentHomePage;