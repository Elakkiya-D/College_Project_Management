import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ViewStdAttendance = () => {
    const dispatch = useDispatch();
    const [openStates, setOpenStates] = useState({});
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

    const { userDetails, currentUser, loading } = useSelector((state) => state.user);

    const [subjectAttendance, setSubjectAttendance] = useState([]);

    useEffect(() => {
        if (userDetails) {
            const rawAttendance = userDetails.attendance || [];
            // Defend against duplicate records using _id or combined date/subName
            const uniqueAttendance = Array.from(
                new Map(rawAttendance.map(item => [`${item.date}-${item.subName?._id || item.subName}`, item])).values()
            );
            setSubjectAttendance(uniqueAttendance);
        }
    }, [userDetails])

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance)
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const subjectData = Object.entries(attendanceBySubject).map(([subName, { present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const toggleRow = (subId) => {
        setOpenStates(prev => ({ ...prev, [subId]: !prev[subId] }));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Logs</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Analytical summary and session-level breakdown of your academic presence.
                    </p>
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Logs
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text">Analyzing Sessions...</p>
                </div>
            ) : subjectAttendance.length > 0 ? (
                <div className="space-y-10">
                    {/* Premium Summary Bar */}
                    <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                        <EventAvailableIcon className="absolute -bottom-8 -left-8 text-white/5 text-[180px] -rotate-12 group-hover:scale-110 transition-transform duration-1000 select-none" />
                        <div className="z-10 text-center lg:text-left space-y-2">
                            <h2 className="text-4xl font-bold tracking-tight">
                                {overallAttendancePercentage.toFixed(1)}%
                                <span className="text-base font-medium text-blue-100/60 ml-3 uppercase tracking-widest">Aggregate Score</span>
                            </h2>
                            <p className="text-sm font-medium text-blue-100/70 italic">Synchronized with Institution Enrollment System</p>
                        </div>
                        <div className="z-10 flex flex-wrap justify-center gap-4">
                            <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md text-center min-w-[140px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200/80 mb-1">Attended</p>
                                <p className="text-2xl font-bold text-white leading-none">{subjectAttendance.filter(a => a.status === 'Present').length}</p>
                            </div>
                            <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md text-center min-w-[140px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200/80 mb-1">Total</p>
                                <p className="text-2xl font-bold text-white leading-none">{subjectAttendance.length}</p>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'table' ? (
                        <ContentCard title="Course Performance" subtitle="Session metrics and attendance ratios per course.">
                            <div className="space-y-4">
                                {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => {
                                    const percentage = calculateSubjectAttendancePercentage(present, sessions);
                                    const isOpen = !!openStates[subId];

                                    return (
                                        <div key={index} className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden transition-all group hover:bg-white hover:border-blue-100 hover:shadow-md">
                                            <div
                                                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                                onClick={() => toggleRow(subId)}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${percentage >= 75 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                        <FactCheckIcon fontSize="small" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{subName}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Course</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 justify-between md:justify-end">
                                                    <div className="text-right whitespace-nowrap">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Engagement</p>
                                                        <p className={`text-base font-bold ${percentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>{percentage}%</p>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200 hidden md:block" />
                                                    <div className="text-right whitespace-nowrap">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Sessions</p>
                                                        <p className="text-base font-bold text-gray-900">{present} / {sessions}</p>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isOpen ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-600 transition-all'}`}>
                                                        {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="px-6 pb-6 animate-slide-up">
                                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Registry Date</th>
                                                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Status Assessment</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {allData.map((data, i) => {
                                                                    const date = new Date(data.date);
                                                                    const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                    return (
                                                                        <tr key={data._id || i} className="hover:bg-blue-50/20 transition-colors">
                                                                            <td className="px-4 py-3 text-sm font-bold text-gray-600 flex items-center gap-3">
                                                                                <CalendarMonthIcon className="text-gray-300" fontSize="inherit" />
                                                                                {dateStr}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <span className={`text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border ${data.status === 'Present' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                                                    {data.status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ContentCard>
                    ) : (
                        <ContentCard title="Mastery Visualization" subtitle="Comparative analysis of engagement across active courses.">
                            <div className="h-[400px] w-full pt-4">
                                <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                            </div>
                        </ContentCard>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-20 flex flex-col items-center text-center space-y-6 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner group overflow-hidden relative">
                        <div className="absolute inset-0 bg-blue-600 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 opacity-10" />
                        <CalendarMonthIcon className="text-gray-300 group-hover:text-blue-500 transition-colors duration-500" style={{ fontSize: 32 }} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">Curriculum Logs Empty</h2>
                        <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">No session data has been synchronized with your profile yet. Statistics will appear here once faculty records are finalized.</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md">
                        Refresh Records
                    </button>
                </div>
            )}
        </div>
    )
}

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
            <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
            </div>
            <FactCheckIcon className="text-gray-200" fontSize="small" />
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default ViewStdAttendance;