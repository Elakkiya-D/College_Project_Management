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
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Records</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Comprehensive overview of your registered curriculum and examination metrics.
                    </p>
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Detailed List
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Performance
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling Records...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {subjectMarks.length > 0 ? (
                        <>
                            {viewMode === 'list' ? (
                                <ContentCard title="Examination Portfolio" subtitle={`Institutional Records - ${new Date().getFullYear()}`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left truncate">
                                            <thead>
                                                <tr className="border-b border-gray-50">
                                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Course</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Score Assessment</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Metric Index</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {subjectMarks.map((result, index) => (
                                                    <tr key={result._id || index} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                                                                    <MenuBookIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-900">{result.subName.subName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-bold text-gray-900 italic">
                                                                {result.marksObtained}
                                                                <span className="text-gray-400 text-[10px] align-top ml-1">pts</span>
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full transition-all duration-1000 ${result.marksObtained > 75 ? 'bg-blue-600' : result.marksObtained > 40 ? 'bg-blue-400' : 'bg-red-400'}`}
                                                                        style={{ width: `${result.marksObtained}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${result.marksObtained > 40 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                    {result.marksObtained > 40 ? 'Qualified' : 'Deficient'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </ContentCard>
                            ) : (
                                <ContentCard title="Performance Analytics" subtitle="Visual data mapping of curriculum mastery.">
                                    <div className="h-[400px] w-full pt-4">
                                        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                                    </div>
                                </ContentCard>
                            )}
                        </>
                    ) : (
                        <ContentCard title="Curriculum Overview" subtitle={`Active Enrollment Group: ${sclassDetails?.sclassName || 'Standard Registry'}`}>
                            {subjectsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from(new Map(subjectsList.map(item => [item._id, item])).values()).map((subject, index) => (
                                        <div key={subject._id || index} className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col justify-between space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <MenuBookIcon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{subject.subName}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subject.subCode}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Course</span>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center text-center space-y-5">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                                        <FactCheckIcon className="text-gray-300" fontSize="large" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold text-gray-900">Curriculum Pending</h4>
                                        <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
                                            The academic department has not updated the subject registry for your class yet.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ContentCard>
                    )}
                </div>
            )}
        </div>
    );
};

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
            <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium italic">{subtitle}</p>}
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-300 shadow-sm">
                <BarChartIcon fontSize="small" />
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default StudentSubjects;
