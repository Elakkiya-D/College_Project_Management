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
        <div className="max-w-7xl mx-auto px-8 py-8 w-full animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Attendance Tracking</h1>
                    <p className="text-sm text-gray-500">
                        Comprehensive log of your session presence and academic engagement.
                    </p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'table' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Logs
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'chart' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-100 border-t-yellow-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-brand uppercase tracking-widest">Crunching Session Data...</p>
                </div>
            ) : subjectAttendance.length > 0 ? (
                <div className="space-y-8">
                    {/* Summary Bar */}
                    <div className="bg-brand rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                        <EventAvailableIcon className="absolute -bottom-4 -left-4 text-white/5 text-[120px] -rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        <div className="z-10 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter mb-1">
                                {overallAttendancePercentage.toFixed(1)}% <span className="text-lg text-yellow-200">Overall Presence</span>
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-yellow-200 opacity-80 italic">System Synchronized | Real-time Academic Tracking</p>
                        </div>
                        <div className="z-10 flex gap-4">
                            <div className="px-5 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-100 mb-0.5">Sessions Attended</p>
                                <p className="text-xl font-black text-white">{subjectAttendance.filter(a => a.status === 'Present').length}</p>
                            </div>
                            <div className="px-5 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-100 mb-0.5">Total Registered</p>
                                <p className="text-xl font-black text-white">{subjectAttendance.length}</p>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'table' ? (
                        <DashboardCard title="Subject-wise Breakdown" subtitle="Detailed performance and session history per course.">
                            <div className="space-y-4">
                                {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => {
                                    const percentage = calculateSubjectAttendancePercentage(present, sessions);
                                    const isOpen = !!openStates[subId];

                                    return (
                                        <div key={index} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden transition-all group hover:bg-white hover:shadow-md hover:border-yellow-100">
                                            <div
                                                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                onClick={() => toggleRow(subId)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${percentage >= 75 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                        <FactCheckIcon />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 leading-tight">{subName}</h4>
                                                        <p className="text-xs font-bold text-slate-400 italic">Faculty Assigned Curriculum</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Status</p>
                                                        <p className={`text-sm font-bold ${percentage >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>{percentage}%</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Attendance</p>
                                                        <p className="text-sm font-bold text-slate-700">{present} / {sessions}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                                                        {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="px-6 pb-6 animate-slide-up">
                                                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-inner">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Session Date</th>
                                                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50">
                                                                {allData.map((data, i) => {
                                                                    const date = new Date(data.date);
                                                                    const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                    return (
                                                                        <tr key={data._id || i} className="hover:bg-surface/10 transition-colors">
                                                                            <td className="px-4 py-3 text-sm font-bold text-slate-600 flex items-center gap-2">
                                                                                <CalendarMonthIcon className="text-slate-300" fontSize="inherit" />
                                                                                {dateStr}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${data.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
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
                        </DashboardCard>
                    ) : (
                        <DashboardCard title="Attendance Visualizer" subtitle="Graphical analysis of presence across registered sessions.">
                            <div className="h-[400px] py-4">
                                <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                            </div>
                        </DashboardCard>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-20 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner group hover:scale-110 transition-transform duration-500">
                        <CalendarMonthIcon className="text-yellow-200 group-hover:text-accent transition-colors" style={{ fontSize: 50 }} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-800">No Attendance Records</h2>
                        <p className="text-sm font-medium text-slate-400 max-w-sm">Your attendance data is currently empty. Start attending classes to see your statistics synchronized here.</p>
                    </div>
                    <button className="px-8 py-3 bg-brand text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        Refresh Dashboard
                    </button>
                </div>
            )}
        </div>
    )
}

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <FactCheckIcon className="text-gray-300" />
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default ViewStdAttendance