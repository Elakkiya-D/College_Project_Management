import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardContainer from '../../components/DashboardContainer';
import PageHeader from '../../components/PageHeader';
import SeeNotice from '../../components/SeeNotice';
import DashboardCards from './components/DashboardCards';
import SectionCard from './components/SectionCard';
import { getAllSclasses, getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllFaculty } from '../../redux/facultyRelated/facultyHandle';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import DomainAddRoundedIcon from '@mui/icons-material/DomainAddRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const pageAnimation = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
    },
};

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList, subjectsList } = useSelector((state) => state.sclass);
    const { facultyList } = useSelector((state) => state.faculty);
    const { currentUser } = useSelector((state) => state.user);

    const adminID = currentUser?._id;

    useEffect(() => {
        if (!adminID) return;

        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, 'Sclass'));
        dispatch(getSubjectList(adminID, 'AllSubjects'));
        dispatch(getAllFaculty(adminID));
    }, [adminID, dispatch]);

    const dashboardStats = useMemo(() => {
        const departmentCount = Array.isArray(sclassesList) ? sclassesList.length : 0;
        const facultyCount = Array.isArray(facultyList) ? facultyList.length : 0;
        const courseCount = Array.isArray(subjectsList) ? subjectsList.length : 0;
        const studentCount = Array.isArray(studentsList) ? studentsList.length : 0;

        return [
            {
                title: 'Departments',
                count: departmentCount,
                icon: <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />,
                subtext: 'Active academic units',
                color: 'indigo',
            },
            {
                title: 'Faculty',
                count: facultyCount,
                icon: <SchoolRoundedIcon sx={{ fontSize: 20 }} />,
                subtext: 'Teaching team members',
                color: 'emerald',
            },
            {
                title: 'Courses',
                count: courseCount,
                icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />,
                subtext: 'Programs currently listed',
                color: 'blue',
            },
            {
                title: 'Students',
                count: studentCount,
                icon: <GroupsRoundedIcon sx={{ fontSize: 20 }} />,
                subtext: 'Total enrolled learners',
                color: 'amber',
            },
        ];
    }, [sclassesList, facultyList, subjectsList, studentsList]);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <DashboardContainer>
            <motion.div variants={pageAnimation} initial="hidden" animate="visible" className="space-y-10">
                <PageHeader
                    title={`Welcome back, ${currentUser?.name || 'Admin'}`}
                    subtitle={`${today} - monitor departments, faculty, courses, and students in one place.`}
                    actions={[
                        {
                            label: 'Add Student',
                            variant: 'primary',
                            icon: <PersonAddAltRoundedIcon fontSize="small" />,
                            onClick: () => navigate('/Admin/addstudents'),
                        },
                        {
                            label: 'Add Department',
                            variant: 'secondary',
                            icon: <DomainAddRoundedIcon fontSize="small" />,
                            onClick: () => navigate('/Admin/addclass'),
                        },
                    ]}
                />

                <section className="space-y-6">
                    <SectionHeading
                        title="Stats Cards"
                        subtitle="Key metrics with improved readability and breathing space for quick scanning."
                    />
                    <DashboardCards items={dashboardStats} />
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <SectionCard
                        title="Department Directory"
                        subtitle="Review and manage department structures, ownership, and enrollment routing."
                    >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-sm text-textMedium">Keep department records updated and consistent.</p>
                            <ActionButton
                                label="Open Departments"
                                icon={<ArrowOutwardRoundedIcon sx={{ fontSize: 16 }} />}
                                onClick={() => navigate('/Admin/classes')}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Faculty and Courses"
                        subtitle="Navigate directly to faculty assignment and course mapping workflows."
                    >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-sm text-textMedium">Track teaching ownership and course availability.</p>
                            <ActionButton
                                label="Open Faculty"
                                icon={<ArrowOutwardRoundedIcon sx={{ fontSize: 16 }} />}
                                onClick={() => navigate('/Admin/faculty')}
                            />
                        </div>
                    </SectionCard>
                </section>

                <section className="space-y-6">
                    <SectionHeading
                        title="Administrative Commands"
                        subtitle="Use quick actions with smooth interactions for high-frequency operations."
                    />
                    <SectionCard>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <ActionButton
                                label="Add Notice"
                                icon={<CampaignRoundedIcon sx={{ fontSize: 17 }} />}
                                onClick={() => navigate('/Admin/addnotice')}
                                fullWidth
                            />
                            <ActionButton
                                label="Record Fee"
                                icon={<ReceiptLongRoundedIcon sx={{ fontSize: 17 }} />}
                                onClick={() => navigate('/Admin/addfee')}
                                fullWidth
                            />
                            <ActionButton
                                label="Faculty Overview"
                                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />}
                                onClick={() => navigate('/Admin/faculty')}
                                fullWidth
                            />
                        </div>
                    </SectionCard>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <SectionCard
                        className="xl:col-span-2"
                        title="Announcements"
                        subtitle="Latest communication updates across departments and courses."
                    >
                        <SeeNotice inDashboardWidget={true} />
                    </SectionCard>

                    <SectionCard
                        title="Activity"
                        subtitle="Operational timeline for recent admin actions."
                    >
                        <div className="h-64 rounded-xl border border-dashed border-textDark/15 bg-background flex flex-col items-center justify-center text-center px-5">
                            <AccessTimeRoundedIcon className="text-textMedium/60" sx={{ fontSize: 28 }} />
                            <p className="text-sm font-medium text-textMedium mt-3">No tracked activity available yet.</p>
                        </div>
                    </SectionCard>
                </section>
            </motion.div>
        </DashboardContainer>
    );
};

const SectionHeading = ({ title, subtitle }) => (
    <div className="space-y-1 px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-textDark">{title}</h2>
        <p className="text-sm text-textMedium">{subtitle}</p>
    </div>
);

const ActionButton = ({ label, icon, onClick, fullWidth = false }) => (
    <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onClick}
        className={`h-11 px-5 rounded-xl border border-textDark/10 bg-white text-textDark text-sm font-semibold shadow-sm hover:shadow-md hover:border-brand/30 hover:text-brand transition-colors flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''}`}
    >
        {icon}
        {label}
    </motion.button>
);

export default AdminHomePage;
