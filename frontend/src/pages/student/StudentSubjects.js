import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import CustomBarChart from '../../components/CustomBarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);



    const [subjectMarks, setSubjectMarks] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'

    useEffect(() => {
        if (userDetails) {
            const rawMarks = userDetails.examResult || [];
            // Defend against duplicate records using _id or subName as unique keys
            const uniqueMarks = Array.from(
                new Map(rawMarks.map(item => [item.subName?._id || item.subName, item])).values()
            );
            setSubjectMarks(uniqueMarks);
        }
    }, [userDetails])

    useEffect(() => {
        if (!subjectMarks.length) {
            dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
        }
    }, [subjectMarks, dispatch, currentUser.sclassName._id]);

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 w-full animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Academic Records</h1>
                    <p className="text-sm text-gray-500">
                        Detailed overview of your registered subjects and examination results.
                    </p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Detailed List
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'chart' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Performance Chart
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-100 border-t-yellow-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-brand uppercase tracking-widest">Retrieving Transcripts...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {subjectMarks.length > 0 ? (
                        <>
                            {viewMode === 'list' ? (
                                <DashboardCard title="Examination Results" subtitle={`Academic Year ${new Date().getFullYear()} - Semester Records`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Name</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Marks Obtained</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Performance Index</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {subjectMarks.map((result, index) => (
                                                    <tr key={result._id || index} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                                                    <MenuBookIcon fontSize="small" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">{result.subName.subName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-black text-slate-800 text-lg">{result.marksObtained}</span>
                                                            <span className="text-slate-400 text-xs ml-1">/ 100</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-brand shadow-sm transition-all duration-1000"
                                                                        style={{ width: `${result.marksObtained}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${result.marksObtained > 40 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                    {result.marksObtained > 40 ? 'Qualified' : 'Requires Improv.'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </DashboardCard>
                            ) : (
                                <DashboardCard title="Performance Analytics" subtitle="Visual comparison of grades across registered curriculum.">
                                    <div className="h-[400px] py-4">
                                        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                                    </div>
                                </DashboardCard>
                            )}
                        </>
                    ) : (
                        <DashboardCard title="Active Curriculum" subtitle={`Current Enrollment: ${sclassDetails?.sclassName || 'N/A'}`}>
                            {subjectsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                    {Array.from(new Map(subjectsList.map(item => [item._id, item])).values()).map((subject, index) => (
                                        <div key={subject._id || index} className="p-6 bg-white rounded-xl border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all group flex flex-col justify-between">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-brand group-hover:scale-105 transition-transform shrink-0">
                                                    <MenuBookIcon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-gray-800 leading-tight">{subject.subName}</h4>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{subject.subCode}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-gray-400 italic">
                                                <span>Core Educational Module</span>
                                                <FactCheckIcon fontSize="small" className="opacity-40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                        <FactCheckIcon className="text-slate-300" fontSize="large" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-700">Curriculum Pending</h4>
                                        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">Your subjects for the active class are being prepared by the administration.</p>
                                    </div>
                                </div>
                            )}
                        </DashboardCard>
                    )}
                </div>
            )}
        </div>
    );
};

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <FactCheckIcon className="text-gray-300" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

export default StudentSubjects;
