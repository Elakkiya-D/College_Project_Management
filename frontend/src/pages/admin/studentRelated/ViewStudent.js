import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, deleteUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Box, Button, Collapse, IconButton, Table, TableBody, TableHead, Typography, Avatar } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart'
import CustomPieChart from '../../../components/CustomPieChart'
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const ViewStudent = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch()
    const { userDetails, response, loading, error } = useSelector((state) => state.user);

    const studentID = params.id
    const address = "Student"

    const [activeTab, setActiveTab] = useState('details');
    const [openStates, setOpenStates] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID])

    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id !== undefined) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    const handleOpen = (subId) => {
        setOpenStates(prev => ({ ...prev, [subId]: !prev[subId] }));
    };

    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
            .then(() => dispatch(getUserDetails(studentID, address)));
    }

    const removeHandler = (id, deladdress) => {
        dispatch(removeStuff(id, deladdress))
            .then(() => dispatch(getUserDetails(studentID, address)));
    }

    if (loading) return (
        <div className="flex justify-center items-center py-40">
            <svg className="animate-spin h-12 w-12 text-brand" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );

    if (!userDetails) return null;

    const subjectAttendance = userDetails.attendance || [];
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const subjectMarks = userDetails.examResult || [];

    const tabs = [
        { id: 'details', label: 'Profile Overview', icon: <BadgeIcon fontSize="small" /> },
        { id: 'attendance', label: 'Attendance Records', icon: <EventAvailableIcon fontSize="small" /> },
        { id: 'marks', label: 'Academic Performance', icon: <AssignmentTurnedInIcon fontSize="small" /> }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title={userDetails.name}
                subtitle={`Student ID: ${userDetails.rollNum} | ${userDetails.sclassName?.sclassName || 'No Class'}`}
                actions={[
                    {
                        label: 'Go Back',
                        variant: 'secondary',
                        onClick: () => navigate(-1)
                    }
                ]}
            />

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-8 bg-white/50 p-1.5 rounded-2xl border border-black/5 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all ${activeTab === tab.id
                            ? 'bg-brand text-white shadow-md'
                            : 'text-textDark/40 hover:text-textDark/60 hover:bg-white'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-slide-up">
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-8">
                            <ContentCard className="flex flex-col items-center">
                                <Avatar sx={{ width: 120, height: 120, bgcolor: '#ca8a04', fontSize: '3rem', mb: 4, shadow: 4 }}>
                                    {userDetails.name?.charAt(0)}
                                </Avatar>
                                <h3 className="text-2xl font-black text-textDark mb-1">{userDetails.name}</h3>
                                <p className="text-brand font-bold uppercase tracking-widest text-xs mb-8">Roll No: {userDetails.rollNum}</p>

                                <div className="w-full space-y-4 pt-6 border-t border-black/5">
                                    <DetailItem icon={<ClassIcon className="text-accent" fontSize="small" />} label="Class" value={userDetails.sclassName?.sclassName} />
                                    <DetailItem icon={<SchoolIcon className="text-accent" fontSize="small" />} label="Institution" value={userDetails.school?.schoolName} />
                                </div>
                            </ContentCard>

                            {subjectAttendance.length > 0 && (
                                <ContentCard title="Attendance Summary" subtitle="Optical overview of student presence">
                                    <CustomPieChart data={[
                                        { name: 'Present', value: overallAttendancePercentage },
                                        { name: 'Absent', value: 100 - overallAttendancePercentage }
                                    ]} />
                                </ContentCard>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            <ContentCard title="Institutional Record" subtitle="Official registration and enrollment details.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DetailBlock label="Full Legal Name" value={userDetails.name} />
                                    <DetailBlock label="Enrollment Number" value={userDetails.rollNum} />
                                    <DetailBlock label="Assigned Class" value={userDetails.sclassName?.sclassName} />
                                    <DetailBlock label="Institution" value={userDetails.school?.schoolName} />
                                </div>
                                <div className="mt-12 flex gap-4">
                                    <button className="h-11 px-6 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all">
                                        Edit Record
                                    </button>
                                    <button
                                        onClick={() => {
                                            dispatch(deleteUser(studentID, "Student"))
                                                .then(() => navigate(-1));
                                        }}
                                        className="h-11 px-6 border border-yellow-600 text-brand font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                    >
                                        Delete Student
                                    </button>
                                </div>
                            </ContentCard>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-8">
                        <ContentCard
                            title="Attendance Logs"
                            subtitle="Detailed breakdown of presence across all assigned subjects."
                        >
                            <Table className="border border-black/5 rounded-xl overflow-hidden">
                                <TableHead className="bg-slate-50">
                                    <StyledTableRow>
                                        <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Subject</StyledTableCell>
                                        <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Present</StyledTableCell>
                                        <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Total</StyledTableCell>
                                        <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Percentage</StyledTableCell>
                                        <StyledTableCell align="right" className="!font-black uppercase tracking-wider !text-textDark/40">Actions</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                                        const percentage = calculateSubjectAttendancePercentage(present, sessions);
                                        return (
                                            <React.Fragment key={index}>
                                                <StyledTableRow className="hover:bg-slate-50/50 transition-colors">
                                                    <StyledTableCell className="!font-bold">{subName}</StyledTableCell>
                                                    <StyledTableCell className="!text-brand font-bold">{present}</StyledTableCell>
                                                    <StyledTableCell>{sessions}</StyledTableCell>
                                                    <StyledTableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-brand" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                            <span className="font-black text-xs text-textDark/60">{percentage}%</span>
                                                        </div>
                                                    </StyledTableCell>
                                                    <StyledTableCell align="right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOpen(subId)}
                                                                className="px-3 py-1 bg-white border border-black/10 rounded-lg text-xs font-bold hover:shadow-sm"
                                                            >
                                                                {openStates[subId] ? 'Hide' : 'Logs'}
                                                            </button>
                                                            <IconButton onClick={() => removeSubAttendance(subId)} size="small">
                                                                <DeleteIcon fontSize="small" color="error" />
                                                            </IconButton>
                                                            <button
                                                                onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${subId}`)}
                                                                className="px-3 py-1 bg-brand text-white rounded-lg text-xs font-bold hover:brightness-110"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                                <StyledTableRow>
                                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0, border: 0 }} colSpan={6}>
                                                        <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                            <div className="my-4 ml-8 p-6 bg-slate-50 rounded-2xl border border-black/5">
                                                                <h4 className="text-sm font-black text-brand mb-4 uppercase tracking-widest">Daily History</h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                                    {allData.map((data, idx) => (
                                                                        <div key={idx} className="bg-white p-3 rounded-xl border border-black/5 shadow-sm text-center">
                                                                            <p className="text-[10px] font-black text-textDark/30 mb-1">{new Date(data.date).toLocaleDateString()}</p>
                                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${data.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                {data.status}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </Collapse>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <div className="mt-8 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-bold text-textDark/60 uppercase tracking-widest">Aggregate Rating:</p>
                                    <span className="text-3xl font-black text-brand">{overallAttendancePercentage.toFixed(1)}%</span>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => removeHandler(studentID, "RemoveStudentAtten")} className="h-11 px-6 border border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50">Clear Logs</button>
                                    <button onClick={() => navigate("/Admin/students/student/attendance/" + studentID)} className="h-11 px-6 bg-brand text-white font-bold rounded-xl shadow-md">Record Attendance</button>
                                </div>
                            </div>
                        </ContentCard>
                    </div>
                )}

                {activeTab === 'marks' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <ContentCard title="Grade Distribution" subtitle="Academic trend analysis">
                                <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                            </ContentCard>
                        </div>
                        <div className="lg:col-span-2">
                            <ContentCard title="Exam Results" subtitle="Latest computed scores by subject.">
                                <Table className="border border-black/5 rounded-xl overflow-hidden mb-8">
                                    <TableHead className="bg-slate-50">
                                        <StyledTableRow>
                                            <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Subject</StyledTableCell>
                                            <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Score</StyledTableCell>
                                            <StyledTableCell className="!font-black uppercase tracking-wider !text-textDark/40">Status</StyledTableCell>
                                        </StyledTableRow>
                                    </TableHead>
                                    <TableBody>
                                        {subjectMarks.map((result, index) => result.subName && (
                                            <StyledTableRow key={index} className="hover:bg-slate-50/50">
                                                <StyledTableCell className="!font-bold">{result.subName.subName}</StyledTableCell>
                                                <StyledTableCell className="!text-xl font-black text-brand">{result.marksObtained}</StyledTableCell>
                                                <StyledTableCell>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${result.marksObtained >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {result.marksObtained >= 40 ? 'Pass' : 'Fail'}
                                                    </span>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <button onClick={() => navigate("/Admin/students/student/marks/" + studentID)} className="h-11 px-8 bg-brand text-white font-extrabold rounded-xl shadow-md">Add Marks</button>
                            </ContentCard>
                        </div>
                    </div>
                )}
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
}

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 w-full">
        {icon}
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-textDark/30 leading-none mb-1">{label}</span>
            <span className="text-sm font-bold text-textDark/70">{value || 'Not Assigned'}</span>
        </div>
    </div>
);

const DetailBlock = ({ label, value }) => (
    <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 group hover:bg-white hover:shadow-md transition-all">
        <p className="text-[10px] uppercase font-black text-textDark/30 mb-1 group-hover:text-brand transition-colors">{label}</p>
        <p className="text-lg font-extrabold text-textDark">{value || 'N/A'}</p>
    </div>
);

export default ViewStudent;