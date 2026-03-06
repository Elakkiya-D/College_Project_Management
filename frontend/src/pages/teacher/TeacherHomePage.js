import React, { useEffect, useState } from 'react'
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import ClassIcon from "@mui/icons-material/ClassOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import DashboardContainer from '../../components/DashboardContainer';

const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    const [numberOfAssignments, setNumberOfAssignments] = useState(0);

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
        dispatch(getClassStudents(classID));

        const fetchAssignmentsCount = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/TeacherAssignments/${currentUser._id}`);
                if (Array.isArray(res.data)) {
                    setNumberOfAssignments(res.data.length);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAssignmentsCount();
    }, [dispatch, subjectID, classID, currentUser._id]);

    const numberOfStudents = sclassStudents && sclassStudents.length ? sclassStudents.length : 0;
    const numberOfSessions = subjectDetails && subjectDetails.sessions ? subjectDetails.sessions : 0;

    return (
        <DashboardContainer>
            {/* 1. Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Teacher Overview</h1>
                    <p className="text-sm text-gray-500">Welcome back, {currentUser.name}. Here is your classroom report.</p>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Class Students"
                    count={numberOfStudents}
                    icon={<PeopleIcon className="text-brand w-5 h-5" />}
                    helper="Enrolled"
                />
                <StatCard
                    label="Total Lessons"
                    count={numberOfSessions}
                    icon={<ClassIcon className="text-brand w-5 h-5" />}
                    helper="Sessions conducted"
                />
                <StatCard
                    label="Assignments"
                    count={numberOfAssignments}
                    icon={<AssignmentIcon className="text-brand w-5 h-5" />}
                    helper="Tasks created"
                />
                <StatCard
                    label="Total Hours"
                    count={numberOfSessions}
                    icon={<AccessTimeIcon className="text-brand w-5 h-5" />}
                    helper="Teaching hours"
                    suffix=" hrs"
                />
            </div>

            {/* 3. Main Content: Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="col-span-12 lg:col-span-8">
                    <DashboardCard title="Institutional Bulletin" subtitle="Real-time updates and official announcements from university administration.">
                        <SeeNotice inDashboardWidget={true} />
                    </DashboardCard>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-200">
        <div className="mb-6 space-y-1 p-6 pb-0">
            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex-1 flex flex-col px-6 pb-6 pt-0">
            {children}
        </div>
    </div>
);

export default TeacherHomePage;