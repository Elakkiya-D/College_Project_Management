import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import SeeNotice from '../../components/SeeNotice';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';

const FacultyHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubject?._id;

    useEffect(() => {
        if (subjectID) {
            dispatch(getSubjectDetails(subjectID, 'Subject'));
        }
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, subjectID, classID]);

    const stats = useMemo(() => {
        const studentCount = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
        const sessionCount = Number(subjectDetails?.sessions || 0);
        return [
            {
                label: 'Students',
                value: studentCount,
                icon: <GroupsIcon />,
                tone: 'bg-emerald-50 text-emerald-600',
            },
            {
                label: 'Sessions',
                value: sessionCount,
                icon: <MenuBookIcon />,
                tone: 'bg-blue-50 text-blue-600',
            },
            {
                label: 'Attendance',
                value: 'Live',
                icon: <AccountBalanceIcon />,
                tone: 'bg-amber-50 text-amber-600',
            },
            {
                label: 'Hours',
                value: 30,
                icon: <TimerIcon />,
                tone: 'bg-purple-50 text-purple-600',
            },
        ];
    }, [subjectDetails, sclassStudents]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 w-full space-y-8 animate-fade-in">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Faculty Workspace</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome back, {currentUser?.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your department, students, and course sessions with clarity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.tone}`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{item.label}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                    <p className="text-sm text-gray-500 mb-4">Latest updates from the administration.</p>
                    <SeeNotice inDashboardWidget={true} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Department Snapshot</h2>
                    <p className="text-sm text-gray-500 mb-4">Course and class alignment details.</p>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Department</span>
                            <span>{currentUser?.teachSclass?.sclassName || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Course</span>
                            <span>{currentUser?.teachSubject?.subName || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Sessions</span>
                            <span>{subjectDetails?.sessions || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyHomePage;
